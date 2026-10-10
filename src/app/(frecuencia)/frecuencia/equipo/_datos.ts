/** Lecturas compartidas del área de equipo (cliente de sesión: la RLS decide qué se ve). */
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type MiembroEquipo = { userId: string; nombre: string; esLider: boolean };
export type EquipoConMiembros = { id: string; nombre: string; liderId: string; miembros: MiembroEquipo[] };

export async function nombresDePersonas(ids: string[]): Promise<Map<string, string>> {
  const supabase = createSupabaseServerClient() as any;
  const unicos = Array.from(new Set(ids));
  if (!unicos.length) return new Map();
  const { data } = await supabase.from('profiles').select('id, full_name, email').in('id', unicos);
  return new Map(((data ?? []) as { id: string; full_name: string | null; email: string | null }[]).map((p) => [p.id, p.full_name?.trim() || p.email?.split('@')[0] || 'Sin nombre']));
}

/** Los equipos que la RLS deja ver (admin: todos; el resto: los suyos), con miembros y nombres. */
export async function equiposVisibles(): Promise<EquipoConMiembros[]> {
  const supabase = createSupabaseServerClient() as any;
  const { data: equipos } = await supabase.from('frecuencia_equipos').select('id, nombre, lider_id').order('created_at', { ascending: true });
  const lista = (equipos ?? []) as { id: string; nombre: string; lider_id: string }[];
  if (!lista.length) return [];
  const { data: miembros } = await supabase.from('frecuencia_equipo_miembros').select('equipo_id, user_id').in('equipo_id', lista.map((e) => e.id));
  const filas = (miembros ?? []) as { equipo_id: string; user_id: string }[];
  const nombres = await nombresDePersonas([...filas.map((m) => m.user_id), ...lista.map((e) => e.lider_id)]);
  return lista.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    liderId: e.lider_id,
    miembros: filas
      .filter((m) => m.equipo_id === e.id)
      .map((m) => ({ userId: m.user_id, nombre: nombres.get(m.user_id) ?? 'Sin nombre', esLider: m.user_id === e.lider_id }))
      .sort((a, b) => Number(b.esLider) - Number(a.esLider) || a.nombre.localeCompare(b.nombre)),
  }));
}

/** ¿Pertenece la persona a algún equipo (como miembro o líder)? Para mostrar el acceso a /equipo. */
export async function perteneceAUnEquipo(userId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient() as any;
  const { data } = await supabase.from('frecuencia_equipo_miembros').select('equipo_id').eq('user_id', userId).limit(1);
  return (data ?? []).length > 0;
}
