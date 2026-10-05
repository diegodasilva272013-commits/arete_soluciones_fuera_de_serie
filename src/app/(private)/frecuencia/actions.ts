'use server';

/**
 * Todas las escrituras de Frecuencia pasan por acá, con el cliente de
 * sesión del usuario (RLS real) — nunca service role (regla 2 de la
 * Fase 3). Cero contenido del método acá: eso vive en
 * frecuencia_knowledge_blocks (regla 1).
 */

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal, momentoDelDia } from '@/lib/frecuencia-fecha';
import type { FrecuenciaFranja } from '@/types/frecuencia';

export type AccionState = { error?: string; ok?: boolean };

async function usuarioActual() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function timezoneDelUsuario(supabase: ReturnType<typeof createSupabaseServerClient>, userId: string) {
  const { data } = await (supabase as any)
    .from('frecuencia_preferencias')
    .select('timezone')
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';
}

// ── 1. Dial ─────────────────────────────────────────────────────────

export async function guardarDial(input: {
  frecuencia: number;
  energiasEscasez: Record<string, number>;
  accionesSubida: string[];
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const fecha = fechaLocal(timezone);
  const momento = momentoDelDia(timezone);

  const { error } = await (supabase as any).from('frecuencia_dial').upsert(
    {
      user_id: user.id,
      fecha,
      momento,
      frecuencia: input.frecuencia,
      energias_escasez: input.energiasEscasez,
      acciones_subida: input.accionesSubida,
    },
    { onConflict: 'user_id,fecha,momento' }
  );

  if (error) return { error: error.message };
  revalidatePath('/frecuencia');
  revalidatePath('/frecuencia/dial');
  return { ok: true };
}

// ── 2 y 3. Identidad (los 4 ejes, no negociables, estándar mínimo) ───

export async function guardarIdentidad(input: {
  quienCreiaSer?: string;
  quienSoy?: string;
  comoMeVen?: string;
  quienQuieroSer?: string;
  noNegociables?: string[];
  estandarMinimo?: string[];
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const payload: Record<string, unknown> = { user_id: user.id };
  if (input.quienCreiaSer !== undefined) payload.quien_creia_ser = input.quienCreiaSer;
  if (input.quienSoy !== undefined) payload.quien_soy = input.quienSoy;
  if (input.comoMeVen !== undefined) payload.como_me_ven = input.comoMeVen;
  if (input.quienQuieroSer !== undefined) payload.quien_quiero_ser = input.quienQuieroSer;
  if (input.noNegociables !== undefined) payload.no_negociables = input.noNegociables;
  if (input.estandarMinimo !== undefined) payload.estandar_minimo = input.estandarMinimo;

  // El upsert de PostgREST solo actualiza las columnas presentes en el
  // payload — no pisa lo que ya se guardó en un paso anterior.
  const { error } = await (supabase as any).from('frecuencia_identidad').upsert(payload, { onConflict: 'user_id' });

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/onboarding');
  return { ok: true };
}

// ── 4. Ecualizador (áreas + palanca + manzana podrida) ───────────────

export async function guardarAreas(input: {
  niveles: Record<string, number>;
  palancaKey: string | null;
  manzanaKey: string | null;
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const filas = Object.entries(input.niveles).map(([area_key, nivel_actual]) => ({
    user_id: user.id,
    area_key,
    nivel_actual,
    es_palanca: area_key === input.palancaKey,
    es_manzana_podrida: area_key === input.manzanaKey,
  }));

  const { error } = await (supabase as any)
    .from('frecuencia_areas')
    .upsert(filas, { onConflict: 'user_id,area_key' });

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/onboarding');
  revalidatePath('/frecuencia/areas');
  return { ok: true };
}

// ── 5. Energía (hora de despertar + mapa de energía) ─────────────────

export async function guardarEnergia(input: {
  horaDespertar: string; // "HH:MM"
  franjas: FrecuenciaFranja[];
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { error: errPref } = await (supabase as any)
    .from('frecuencia_preferencias')
    .upsert({ user_id: user.id, hora_despertar: input.horaDespertar }, { onConflict: 'user_id' });
  if (errPref) return { error: errPref.message };

  const { data: existente } = await (supabase as any)
    .from('frecuencia_mapa_energia')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente?.id) {
    const { error } = await (supabase as any)
      .from('frecuencia_mapa_energia')
      .update({ franjas: input.franjas, fecha_diagnostico: new Date().toISOString() })
      .eq('id', existente.id)
      .eq('user_id', user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await (supabase as any).from('frecuencia_mapa_energia').insert({
      user_id: user.id,
      franjas: input.franjas,
      fecha_diagnostico: new Date().toISOString(),
    });
    if (error) return { error: error.message };
  }

  revalidatePath('/frecuencia/onboarding');
  return { ok: true };
}

// ── 6. Espejo ─────────────────────────────────────────────────────────

export async function guardarEspejo(input: {
  comoMeVeo: string;
  comoMePercibo: string;
  comoMeSiento: string;
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const fecha = fechaLocal(timezone);
  const momento = momentoDelDia(timezone);

  const { error } = await (supabase as any).from('frecuencia_espejo').insert({
    user_id: user.id,
    fecha,
    momento,
    como_me_veo: input.comoMeVeo,
    como_me_percibo: input.comoMePercibo,
    como_me_siento: input.comoMeSiento,
  });

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/onboarding');
  return { ok: true };
}

// ── 7. Primer objetivo ────────────────────────────────────────────────

export async function guardarObjetivo(input: {
  imagenMental: string;
  fechaLimite: string | null;
  areaKey: string | null;
  identidadQueExpresa: string | null;
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { data: existente } = await (supabase as any)
    .from('frecuencia_objetivos')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    titulo: input.imagenMental,
    imagen_mental: input.imagenMental,
    area_key: input.areaKey,
    fecha_limite: input.fechaLimite,
    identidad_que_expresa: input.identidadQueExpresa,
  };

  const { error } = existente?.id
    ? await (supabase as any).from('frecuencia_objetivos').update(payload).eq('id', existente.id).eq('user_id', user.id)
    : await (supabase as any).from('frecuencia_objetivos').insert(payload);

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/onboarding');
  return { ok: true };
}
