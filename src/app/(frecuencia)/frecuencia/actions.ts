'use server';

/**
 * Todas las escrituras de Frecuencia pasan por acá, con el cliente de
 * sesión del usuario (RLS real) — nunca service role (regla 2 de la
 * Fase 3). Cero contenido del método acá: eso vive en
 * frecuencia_knowledge_blocks (regla 1).
 */

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal, momentoDelDia, lunesDeLaSemana, fechaMasDias, horaEnTimezoneAUtc } from '@/lib/frecuencia-fecha';
import { obtenerDatosParaArmarSemana, obtenerDatosEnElAire, type DatosEnElAire } from '@/lib/frecuencia-semana';
import { armarSemana, DIAS_SEMANA, type BloquePropuesto } from '@/lib/frecuencia/plan';
import type { FrecuenciaFranja, NoNegociableGuardado } from '@/types/frecuencia';

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
  comoMeVeo?: string;
  comoMePercibo?: string;
  comoMeSiento?: string;
  vestimentaManana?: string;
}): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const fecha = fechaLocal(timezone);
  const momento = momentoDelDia(timezone);

  const payload: Record<string, unknown> = { user_id: user.id, fecha, momento };
  if (input.comoMeVeo !== undefined) payload.como_me_veo = input.comoMeVeo;
  if (input.comoMePercibo !== undefined) payload.como_me_percibo = input.comoMePercibo;
  if (input.comoMeSiento !== undefined) payload.como_me_siento = input.comoMeSiento;
  if (input.vestimentaManana !== undefined) payload.vestimenta_manana = input.vestimentaManana;

  const { error } = await (supabase as any).from('frecuencia_espejo').insert(payload);

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/onboarding');
  revalidatePath('/frecuencia/cierre');
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

// ── 8. Tareas del objetivo ───────────────────────────────────────────
// Por ahora se cargan a mano desde esta pantalla. La descomposición con
// IA de la fase siguiente va a llamar a estas mismas funciones.

export type TareaInput = {
  objetivoId: string;
  titulo: string;
  protocolo: string[];
  tipoEnergia: 'profundo' | 'decision' | 'creativo' | null;
  duracionMin: number | null;
  dosisActual: number;
  dosisObjetivo: number | null;
  desbloquea: string[];
};

export async function crearTarea(input: TareaInput): Promise<AccionState & { id?: string }> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { data, error } = await (supabase as any)
    .from('frecuencia_tareas')
    .insert({
      user_id: user.id,
      objetivo_id: input.objetivoId,
      titulo: input.titulo,
      protocolo: input.protocolo,
      tipo_energia: input.tipoEnergia,
      duracion_min: input.duracionMin,
      dosis_actual: input.dosisActual,
      dosis_objetivo: input.dosisObjetivo,
      desbloquea: input.desbloquea,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/frecuencia/objetivos/${input.objetivoId}`);
  return { ok: true, id: data.id };
}

export async function actualizarTarea(tareaId: string, input: TareaInput): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { error } = await (supabase as any)
    .from('frecuencia_tareas')
    .update({
      titulo: input.titulo,
      protocolo: input.protocolo,
      tipo_energia: input.tipoEnergia,
      duracion_min: input.duracionMin,
      dosis_actual: input.dosisActual,
      dosis_objetivo: input.dosisObjetivo,
      desbloquea: input.desbloquea,
    })
    .eq('id', tareaId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath(`/frecuencia/objetivos/${input.objetivoId}`);
  return { ok: true };
}

export async function borrarTarea(tareaId: string, objetivoId: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  // Antes de borrar, sacar esta tarea de cualquier `desbloquea` de otra
  // tarea que la referencie — si no, queda un uuid fantasma en el array.
  const { data: queLaDesbloquean } = await (supabase as any)
    .from('frecuencia_tareas')
    .select('id, desbloquea')
    .eq('user_id', user.id)
    .contains('desbloquea', [tareaId]);

  for (const fila of queLaDesbloquean ?? []) {
    const nuevoDesbloquea = (fila.desbloquea as string[]).filter((id) => id !== tareaId);
    await (supabase as any).from('frecuencia_tareas').update({ desbloquea: nuevoDesbloquea }).eq('id', fila.id).eq('user_id', user.id);
  }

  const { error } = await (supabase as any).from('frecuencia_tareas').delete().eq('id', tareaId).eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath(`/frecuencia/objetivos/${objetivoId}`);
  return { ok: true };
}

// ── 9. No negociables con día y horario (pantalla Semana) ────────────
// Mismo campo jsonb que ya usa el onboarding (frecuencia_identidad.no_
// negociables) — sin migración. Acá se guarda la lista completa, ya
// normalizada (ver normalizarNoNegociables en frecuencia-semana.ts).

export async function guardarNoNegociablesConHorario(items: NoNegociableGuardado[]): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { error } = await (supabase as any)
    .from('frecuencia_identidad')
    .upsert({ user_id: user.id, no_negociables: items }, { onConflict: 'user_id' });

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/semana');
  return { ok: true };
}

// ── 10. Motor de la semana: proponer y confirmar ─────────────────────

export async function proponerSemana(): Promise<{ bloques: BloquePropuesto[]; error?: string }> {
  const { user } = await usuarioActual();
  if (!user) return { bloques: [], error: 'No hay sesión.' };

  const resultado = await obtenerDatosParaArmarSemana(user.id);
  if ('error' in resultado) return { bloques: [], error: resultado.error };

  return { bloques: armarSemana(resultado.datos) };
}

export async function confirmarSemana(bloques: BloquePropuesto[]): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const lunes = lunesDeLaSemana(timezone);

  const filas = bloques.map((b) => {
    const indiceDia = DIAS_SEMANA.indexOf(b.dia);
    const fechaDelDia = fechaMasDias(lunes, indiceDia);
    return {
      user_id: user.id,
      tarea_id: b.tareaId,
      tipo: b.tipo,
      inicio: horaEnTimezoneAUtc(fechaDelDia, b.horaInicio, timezone).toISOString(),
      fin: horaEnTimezoneAUtc(fechaDelDia, b.horaFin, timezone).toISOString(),
    };
  });

  const { error } = await (supabase as any).from('frecuencia_bloques').insert(filas);

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/semana');
  revalidatePath('/frecuencia/hoy');
  return { ok: true };
}

export async function actualizarBloque(bloqueId: string, cambios: { inicio?: string; fin?: string; estado?: string }): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { error } = await (supabase as any).from('frecuencia_bloques').update(cambios).eq('id', bloqueId).eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/semana');
  return { ok: true };
}

export async function borrarBloque(bloqueId: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { error } = await (supabase as any).from('frecuencia_bloques').delete().eq('id', bloqueId).eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/semana');
  return { ok: true };
}

// ── 11. Bandeja de ideas (pantalla Hoy) ───────────────────────────────

// ── 12. EN EL AIRE: salir, interrupciones, terminar ──────────────────

export type SalirAlAireResultado =
  | ({ ok: true } & DatosEnElAire)
  | { ok: false; conflicto: true; bloqueEnCursoId: string; bloqueEnCursoTitulo: string }
  | { ok: false; error: string };

export async function salirAlAire(bloqueId: string): Promise<SalirAlAireResultado> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { ok: false, error: 'No hay sesión.' };

  const { data: actual } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('estado, inicio_real, tarea_id')
    .eq('id', bloqueId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!actual) return { ok: false, error: 'Bloque inexistente.' };
  if (!actual.tarea_id) return { ok: false, error: 'Este bloque no tiene una tarea asociada.' };

  // Idempotente: si ESTE bloque ya está EN_EL_AIRE (reload o cambio de
  // dispositivo), no tocar nada — solo devolver sus datos reales.
  if (actual.estado !== 'EN_EL_AIRE') {
    const ahora = new Date().toISOString();
    const { error } = await (supabase as any)
      .from('frecuencia_bloques')
      .update({ estado: 'EN_EL_AIRE', inicio_real: ahora })
      .eq('id', bloqueId)
      .eq('user_id', user.id)
      .eq('estado', 'PROGRAMADO');

    if (error) {
      if (error.code === '23505') {
        // idx_frecuencia_bloques_un_solo_en_el_aire: ya hay otro bloque en curso.
        const { data: enCurso } = await (supabase as any)
          .from('frecuencia_bloques')
          .select('id, tarea_id')
          .eq('user_id', user.id)
          .eq('estado', 'EN_EL_AIRE')
          .maybeSingle();
        let titulo = 'otro bloque';
        if (enCurso?.tarea_id) {
          const { data: tarea } = await (supabase as any).from('frecuencia_tareas').select('titulo').eq('id', enCurso.tarea_id).maybeSingle();
          titulo = tarea?.titulo ?? titulo;
        }
        return { ok: false, conflicto: true, bloqueEnCursoId: enCurso?.id ?? '', bloqueEnCursoTitulo: titulo };
      }
      return { ok: false, error: error.message };
    }
  }

  const datos = await obtenerDatosEnElAire(user.id, bloqueId);
  if (!datos) return { ok: false, error: 'No se pudo cargar el bloque.' };
  revalidatePath('/frecuencia/hoy');
  return { ok: true, ...datos };
}

/** Para el botón "Ir a ese bloque" del mensaje de conflicto: trae los datos del bloque EN_EL_AIRE actual del usuario, sea cual sea. */
export async function obtenerBloqueEnCurso(): Promise<DatosEnElAire | null> {
  const { supabase, user } = await usuarioActual();
  if (!user) return null;
  const { data } = await (supabase as any).from('frecuencia_bloques').select('id').eq('user_id', user.id).eq('estado', 'EN_EL_AIRE').maybeSingle();
  if (!data) return null;
  return obtenerDatosEnElAire(user.id, data.id);
}

export async function registrarInterrupcion(bloqueId: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { data } = await (supabase as any).from('frecuencia_bloques').select('interrupciones').eq('id', bloqueId).eq('user_id', user.id).maybeSingle();
  if (!data) return { error: 'Bloque inexistente.' };

  const { error } = await (supabase as any)
    .from('frecuencia_bloques')
    .update({ interrupciones: data.interrupciones + 1 })
    .eq('id', bloqueId)
    .eq('user_id', user.id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function terminarBloque(bloqueId: string, cumplido: boolean): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };

  const { data: bloque } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('inicio_real, tarea_id, estado')
    .eq('id', bloqueId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!bloque) return { error: 'Bloque inexistente.' };
  if (bloque.estado !== 'EN_EL_AIRE') return { error: 'Este bloque no está en curso.' };

  const ahora = new Date();
  const minutosReales = Math.max(0, Math.round((ahora.getTime() - new Date(bloque.inicio_real).getTime()) / 60000));

  const { error } = await (supabase as any)
    .from('frecuencia_bloques')
    .update({ estado: cumplido ? 'CUMPLIDO' : 'NO_SALIO', fin_real: ahora.toISOString(), minutos_reales_foco: minutosReales })
    .eq('id', bloqueId)
    .eq('user_id', user.id);
  if (error) return { error: error.message };

  let tituloTarea = '';
  if (bloque.tarea_id) {
    const { data: tarea } = await (supabase as any).from('frecuencia_tareas').select('titulo, veces_postergada').eq('id', bloque.tarea_id).maybeSingle();
    tituloTarea = tarea?.titulo ?? '';
    if (!cumplido) {
      await (supabase as any)
        .from('frecuencia_tareas')
        .update({ veces_postergada: (tarea?.veces_postergada ?? 0) + 1 })
        .eq('id', bloque.tarea_id)
        .eq('user_id', user.id);
    }
  }

  if (cumplido) {
    const timezone = await timezoneDelUsuario(supabase, user.id);
    const fecha = fechaLocal(timezone);
    await (supabase as any).from('frecuencia_evidencia').insert({
      user_id: user.id,
      bloque_id: bloqueId,
      fecha,
      texto: tituloTarea ? `${tituloTarea} — ${minutosReales} min de foco real.` : `${minutosReales} min de foco real.`,
      tipo: 'ENTRENAMIENTO_CUMPLIDO',
    });
  }

  revalidatePath('/frecuencia/hoy');
  revalidatePath('/frecuencia/semana');
  return { ok: true };
}

// ── 13. Cierre del día ────────────────────────────────────────────────

export async function agregarEvidenciaManual(texto: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };
  if (!texto.trim()) return { error: 'Vacío.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const fecha = fechaLocal(timezone);

  const { error } = await (supabase as any).from('frecuencia_evidencia').insert({
    user_id: user.id,
    bloque_id: null,
    fecha,
    texto: texto.trim(),
    tipo: 'MANUAL',
  });
  if (error) return { error: error.message };
  revalidatePath('/frecuencia/cierre');
  return { ok: true };
}

export async function guardarAprendizaje(texto: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };
  if (!texto.trim()) return { error: 'Vacío.' };
  if (texto.length > 500) return { error: 'Demasiado largo.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const fecha = fechaLocal(timezone);

  // Mismo almacén que el registro (frecuencia_evidencia.tipo es texto libre),
  // con un tipo propio: así el cierre los muestra aparte y no hace falta tocar la base.
  const { error } = await (supabase as any).from('frecuencia_evidencia').insert({
    user_id: user.id,
    bloque_id: null,
    fecha,
    texto: texto.trim(),
    tipo: 'APRENDIZAJE',
  });
  if (error) return { error: 'No se pudo guardar.' };
  revalidatePath('/frecuencia/cierre');
  return { ok: true };
}

export async function guardarReflexionFalla(paso: number, nombre: string, texto: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };
  if (!texto.trim()) return { error: 'Vacío.' };

  const timezone = await timezoneDelUsuario(supabase, user.id);
  const fecha = fechaLocal(timezone);

  const { error } = await (supabase as any).from('frecuencia_evidencia').insert({
    user_id: user.id,
    bloque_id: null,
    fecha,
    texto: `Paso ${paso} (${nombre}): ${texto.trim()}`,
    tipo: 'PASOS_ANTE_FALLA',
  });
  if (error) return { error: error.message };
  revalidatePath('/frecuencia/cierre');
  return { ok: true };
}

export async function estacionarIdea(texto: string): Promise<AccionState> {
  const { supabase, user } = await usuarioActual();
  if (!user) return { error: 'No hay sesión.' };
  if (!texto.trim()) return { error: 'Vacío.' };

  const { error } = await (supabase as any).from('frecuencia_ideas').insert({ user_id: user.id, texto: texto.trim(), estado: 'ESTACIONADA' });

  if (error) return { error: error.message };
  revalidatePath('/frecuencia/hoy');
  return { ok: true };
}
