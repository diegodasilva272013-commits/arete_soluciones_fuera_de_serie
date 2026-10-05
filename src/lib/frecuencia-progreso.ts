/**
 * Determina en qué paso del onboarding de Frecuencia está un usuario,
 * para el ruteo de entrada y la resumibilidad ("se puede salir y
 * volver: retoma desde el primer paso incompleto"). Lectura con el
 * cliente de sesión del usuario (RLS real).
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ORDEN_PASOS, type PasoOnboarding } from '@/types/frecuencia';

async function existeAlgunDial(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { count } = await (supabase as any)
    .from('frecuencia_dial')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return (count ?? 0) > 0;
}

async function identidadCompleta(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data } = await (supabase as any)
    .from('frecuencia_identidad')
    .select('quien_creia_ser, quien_soy, como_me_ven, quien_quiero_ser')
    .eq('user_id', userId)
    .maybeSingle();
  return !!(data?.quien_creia_ser && data?.quien_soy && data?.como_me_ven && data?.quien_quiero_ser);
}

async function noNegociablesCompleto(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data } = await (supabase as any)
    .from('frecuencia_identidad')
    .select('no_negociables, estandar_minimo')
    .eq('user_id', userId)
    .maybeSingle();
  return !!(data?.no_negociables?.length && data?.estandar_minimo?.length);
}

async function ecualizadorCompleto(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string, totalAreas: number) {
  const { data } = await (supabase as any)
    .from('frecuencia_areas')
    .select('area_key, es_palanca, es_manzana_podrida')
    .eq('user_id', userId);
  const filas = (data ?? []) as Array<{ area_key: string; es_palanca: boolean; es_manzana_podrida: boolean }>;
  if (filas.length < totalAreas) return false;
  return filas.some((f) => f.es_palanca) && filas.some((f) => f.es_manzana_podrida);
}

async function energiaCompleta(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data: pref } = await (supabase as any)
    .from('frecuencia_preferencias')
    .select('hora_despertar')
    .eq('user_id', userId)
    .maybeSingle();
  if (!pref?.hora_despertar) return false;
  const { count } = await (supabase as any)
    .from('frecuencia_mapa_energia')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return (count ?? 0) > 0;
}

async function existeAlgunEspejo(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { count } = await (supabase as any)
    .from('frecuencia_espejo')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return (count ?? 0) > 0;
}

async function existeAlgunObjetivo(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { count } = await (supabase as any)
    .from('frecuencia_objetivos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return (count ?? 0) > 0;
}

/** Primer paso incompleto, en el orden del onboarding. 'completo' si ya hizo todos. */
export async function primerPasoIncompleto(userId: string, totalAreas: number): Promise<PasoOnboarding> {
  const supabase = createSupabaseServerClient();

  const chequeos: Record<Exclude<PasoOnboarding, 'completo'>, () => Promise<boolean>> = {
    dial: () => existeAlgunDial(supabase, userId),
    identidad: () => identidadCompleta(supabase, userId),
    no_negociables: () => noNegociablesCompleto(supabase, userId),
    ecualizador: () => ecualizadorCompleto(supabase, userId, totalAreas),
    energia: () => energiaCompleta(supabase, userId),
    espejo: () => existeAlgunEspejo(supabase, userId),
    objetivo: () => existeAlgunObjetivo(supabase, userId),
  };

  for (const paso of ORDEN_PASOS) {
    if (paso === 'completo') return 'completo';
    const completo = await chequeos[paso]();
    if (!completo) return paso;
  }
  return 'completo';
}
