'use server';

/**
 * Administración de equipos (Fase 6.1). Solo admin: se chequea acá y además lo exige la RLS
 * (frecuencia_equipos / frecuencia_equipo_miembros: insert/update/delete = is_admin). Siempre con
 * el cliente de sesión de quien administra; nunca service role.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/current-user';
import { getFrecuenciaRolesHabilitados } from '@/lib/frecuencia-access';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { copy } from '../../_copy';

export type Persona = { id: string; nombre: string; email: string; rol: string };
type Resultado = { ok?: boolean; error?: string; id?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function soloAdmin() {
  const ctx = await getCurrentUserContext();
  if (!ctx?.isAdmin) return null;
  return { ctx, supabase: createSupabaseServerClient() as any };
}

/** Busca personas por nombre o email, solo de roles habilitados en Frecuencia (máx. 12). */
export async function buscarPersonas(texto: string): Promise<Persona[]> {
  const a = await soloAdmin();
  if (!a) return [];
  // Sin caracteres que rompan el filtro de PostgREST (coma, paréntesis, comodines).
  const q = String(texto ?? '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
  if (q.length < 2) return [];
  const roles = (await getFrecuenciaRolesHabilitados()) ?? ['admin'];
  const { data } = await a.supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('role', roles)
    .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
    .order('full_name', { ascending: true })
    .limit(12);
  return ((data ?? []) as { id: string; full_name: string | null; email: string | null; role: string }[]).map((p) => ({
    id: p.id,
    nombre: p.full_name?.trim() || p.email || 'Sin nombre',
    email: p.email ?? '',
    rol: p.role,
  }));
}

/** Solo se suman personas con un rol habilitado en Frecuencia (lo mismo que filtra el buscador). */
async function puedeIntegrar(supabase: any, userId: string): Promise<boolean> {
  const roles = (await getFrecuenciaRolesHabilitados()) ?? ['admin'];
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  return !!data && roles.includes(data.role);
}

export async function crearEquipo(input: { nombre: string; liderId: string }): Promise<Resultado> {
  const a = await soloAdmin();
  if (!a) return { error: copy.equipo.admin.noEsAdmin };
  const nombre = String(input.nombre ?? '').trim();
  if (!nombre || nombre.length > 80) return { error: copy.equipo.admin.faltaNombre };
  if (!UUID.test(input.liderId ?? '')) return { error: copy.equipo.admin.faltaLider };
  if (!(await puedeIntegrar(a.supabase, input.liderId))) return { error: copy.equipo.admin.errorGeneral };
  const { data, error } = await a.supabase.from('frecuencia_equipos').insert({ nombre, lider_id: input.liderId }).select('id').single();
  if (error || !data) return { error: copy.equipo.admin.errorGeneral };
  revalidatePath('/frecuencia/equipo/admin');
  return { ok: true, id: data.id };
}

export async function agregarMiembro(input: { equipoId: string; userId: string }): Promise<Resultado> {
  const a = await soloAdmin();
  if (!a) return { error: copy.equipo.admin.noEsAdmin };
  if (!UUID.test(input.equipoId ?? '') || !UUID.test(input.userId ?? '')) return { error: copy.equipo.admin.errorGeneral };
  if (!(await puedeIntegrar(a.supabase, input.userId))) return { error: copy.equipo.admin.errorGeneral };
  const { error } = await a.supabase.from('frecuencia_equipo_miembros').insert({ equipo_id: input.equipoId, user_id: input.userId });
  // Ya era miembro (clave primaria repetida): el resultado que se quería ya está.
  if (error && error.code !== '23505') return { error: copy.equipo.admin.errorGeneral };
  revalidatePath('/frecuencia/equipo/admin');
  return { ok: true };
}

export async function sacarMiembro(input: { equipoId: string; userId: string }): Promise<Resultado> {
  const a = await soloAdmin();
  if (!a) return { error: copy.equipo.admin.noEsAdmin };
  if (!UUID.test(input.equipoId ?? '') || !UUID.test(input.userId ?? '')) return { error: copy.equipo.admin.errorGeneral };
  // El líder no se saca: primero se cambia el líder.
  const { data: eq } = await a.supabase.from('frecuencia_equipos').select('lider_id').eq('id', input.equipoId).maybeSingle();
  if (!eq || eq.lider_id === input.userId) return { error: copy.equipo.admin.errorGeneral };
  const { error } = await a.supabase.from('frecuencia_equipo_miembros').delete().eq('equipo_id', input.equipoId).eq('user_id', input.userId);
  if (error) return { error: copy.equipo.admin.errorGeneral };
  // Si justo entre la lectura y el borrado otra persona lo hizo líder, se le devuelve su fila de miembro:
  // un líder fuera de la tabla de miembros perdería sus permisos.
  const { data: despues } = await a.supabase.from('frecuencia_equipos').select('lider_id').eq('id', input.equipoId).maybeSingle();
  if (despues?.lider_id === input.userId) await a.supabase.from('frecuencia_equipo_miembros').insert({ equipo_id: input.equipoId, user_id: input.userId });
  revalidatePath('/frecuencia/equipo/admin');
  return { ok: true };
}

export async function cambiarLider(input: { equipoId: string; userId: string }): Promise<Resultado> {
  const a = await soloAdmin();
  if (!a) return { error: copy.equipo.admin.noEsAdmin };
  if (!UUID.test(input.equipoId ?? '') || !UUID.test(input.userId ?? '')) return { error: copy.equipo.admin.errorGeneral };
  if (!(await puedeIntegrar(a.supabase, input.userId))) return { error: copy.equipo.admin.errorGeneral };
  const { error } = await a.supabase.from('frecuencia_equipos').update({ lider_id: input.userId }).eq('id', input.equipoId);
  if (error) return { error: copy.equipo.admin.errorGeneral };
  revalidatePath('/frecuencia/equipo/admin');
  return { ok: true };
}
