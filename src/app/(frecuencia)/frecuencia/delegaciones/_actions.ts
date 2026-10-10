'use server';

/**
 * Delegaciones (6.3). Cliente de sesión + RLS (insert: quien delega, comparten equipo; update: solo quien delega).
 * El criterio es OBLIGATORIO: sin criterio escrito no hay delegación (la tabla también lo exige por clave foránea).
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal } from '@/lib/frecuencia-fecha';
import { copy } from '../_copy';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Resultado = { ok?: boolean; error?: string };

export async function crearDelegacion(input: { tareaId: string; aUserId: string; criterioId: string }): Promise<Resultado> {
  const ctx = await getCurrentUserContext();
  if (!ctx) return { error: copy.delegaciones.form.error };
  if (![input.tareaId, input.aUserId, input.criterioId].every((x) => UUID.test(x ?? ''))) return { error: copy.delegaciones.form.falta };
  if (input.aUserId === ctx.userId) return { error: copy.delegaciones.form.error };
  const supabase = createSupabaseServerClient() as any;

  const { data: tarea, error: e1 } = await supabase.from('frecuencia_tareas').select('id').eq('id', input.tareaId).eq('user_id', ctx.userId).maybeSingle();
  const { data: criterio, error: e2 } = await supabase.from('frecuencia_criterios').select('id, activo').eq('id', input.criterioId).eq('user_id', ctx.userId).maybeSingle();
  if (e1 || e2 || !tarea || !criterio || criterio.activo === false) return { error: copy.delegaciones.form.error };

  // La misma tarea a la misma persona no se delega dos veces mientras siga en sus manos.
  const { data: abiertas, error: e3 } = await supabase.from('frecuencia_delegaciones').select('id').eq('tarea_id', input.tareaId).eq('de_user_id', ctx.userId).eq('a_user_id', input.aUserId).eq('volvio', false).limit(1);
  if (e3) return { error: copy.delegaciones.form.error };
  if ((abiertas ?? []).length > 0) return { error: copy.delegaciones.form.yaDelegada };

  const { data: pref } = await supabase.from('frecuencia_preferencias').select('timezone').eq('user_id', ctx.userId).maybeSingle();
  const fecha = fechaLocal((pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires');
  const { error } = await supabase.from('frecuencia_delegaciones').insert({ tarea_id: input.tareaId, de_user_id: ctx.userId, a_user_id: input.aUserId, criterio_id: input.criterioId, fecha });
  // 23505: la base (índice único, 0083) frenó una carrera de dos pedidos a la vez.
  if (error) return { error: error.code === '23505' ? copy.delegaciones.form.yaDelegada : copy.delegaciones.form.error };
  revalidatePath('/frecuencia/delegaciones');
  return { ok: true };
}

/** Solo quien delegó marca si volvió (la RLS lo exige también). */
export async function marcarVolvio(input: { id: string; volvio: boolean }): Promise<Resultado> {
  const ctx = await getCurrentUserContext();
  if (!ctx || !UUID.test(input.id ?? '')) return { error: copy.delegaciones.form.error };
  const supabase = createSupabaseServerClient() as any;
  const { data, error } = await supabase.from('frecuencia_delegaciones').update({ volvio: input.volvio === true }).eq('id', input.id).eq('de_user_id', ctx.userId).select('id');
  if (error || !data?.length) return { error: error?.code === '23505' ? copy.delegaciones.form.yaDelegada : copy.delegaciones.form.error };
  revalidatePath('/frecuencia/delegaciones');
  return { ok: true };
}

/** Quien delegó puede quitar la delegación: la otra persona deja de ver la tarea y el criterio. */
export async function quitarDelegacion(input: { id: string }): Promise<Resultado> {
  const ctx = await getCurrentUserContext();
  if (!ctx || !UUID.test(input.id ?? '')) return { error: copy.delegaciones.form.error };
  const supabase = createSupabaseServerClient() as any;
  const { data, error } = await supabase.from('frecuencia_delegaciones').delete().eq('id', input.id).eq('de_user_id', ctx.userId).select('id');
  if (error || !data?.length) return { error: copy.delegaciones.form.error };
  revalidatePath('/frecuencia/delegaciones');
  return { ok: true };
}
