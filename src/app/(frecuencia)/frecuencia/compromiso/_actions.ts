'use server';

/**
 * Co-conductor (6.4): compromiso mensual compartido con avance. El dueño escribe y elige a su co-conductor
 * (alguien de su equipo); el avance lo mueve cualquiera de los dos SOLO por frecuencia_actualizar_avance_compromiso
 * (el co-conductor no tiene UPDATE directo sobre la tabla).
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { mesActual } from './_mes';
import { copy } from '../_copy';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Resultado = { ok?: boolean; error?: string };

export async function guardarCompromiso(input: { texto: string; coConductorId: string | null }): Promise<Resultado> {
  const ctx = await getCurrentUserContext();
  if (!ctx) return { error: copy.compromiso.errorGuardar };
  const texto = typeof input.texto === 'string' ? input.texto.trim() : '';
  if (!texto) return { error: copy.compromiso.falta };
  if (texto.length > 400) return { error: copy.compromiso.textoLargo };
  const co = input.coConductorId || null;
  const supabase = createSupabaseServerClient() as any;
  if (co) {
    if (!UUID.test(co) || co === ctx.userId) return { error: copy.compromiso.coInvalido };
    const { data: comparten } = await supabase.rpc('frecuencia_comparten_equipo', { p_a: ctx.userId, p_b: co });
    if (comparten !== true) return { error: copy.compromiso.coInvalido };
  }
  const mes = await mesActual(supabase, ctx.userId);
  const actualizar = async () => {
    const { data: existente, error: e } = await supabase.from('frecuencia_compromisos').select('id').eq('user_id', ctx.userId).eq('mes', mes).order('created_at', { ascending: false }).limit(1);
    if (e) return { error: e, data: null };
    if (!existente?.length) return { error: null, data: null };
    return supabase.from('frecuencia_compromisos').update({ texto_mensual: texto, co_conductor_id: co, updated_at: new Date().toISOString() }).eq('id', existente[0].id).eq('user_id', ctx.userId).select('id');
  };
  let r = await actualizar();
  if (!r.error && !r.data?.length) {
    r = await supabase.from('frecuencia_compromisos').insert({ user_id: ctx.userId, texto_mensual: texto, co_conductor_id: co, mes, avance: 0 }).select('id');
    // 23505: otra pestaña lo creó justo antes (índice único de 0084): se actualiza ese.
    if (r.error?.code === '23505') r = await actualizar();
  }
  if (r.error || !r.data?.length) return { error: copy.compromiso.errorGuardar };
  revalidatePath('/frecuencia/compromiso');
  return { ok: true };
}

export async function actualizarAvance(input: { id: string; avance: number }): Promise<Resultado> {
  const ctx = await getCurrentUserContext();
  if (!ctx || !UUID.test(input.id ?? '')) return { error: copy.compromiso.errorGuardar };
  if (typeof input.avance !== 'number') return { error: copy.compromiso.errorGuardar };
  const avance = Math.round(input.avance);
  if (!Number.isFinite(avance) || avance < 0 || avance > 100) return { error: copy.compromiso.errorGuardar };
  const supabase = createSupabaseServerClient() as any;
  const { error } = await supabase.rpc('frecuencia_actualizar_avance_compromiso', { p_compromiso_id: input.id, p_avance: avance });
  if (error) return { error: copy.compromiso.errorGuardar };
  revalidatePath('/frecuencia/compromiso');
  return { ok: true };
}
