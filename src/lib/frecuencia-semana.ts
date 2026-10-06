/**
 * Junta todo lo que arrancarSemana() necesita por parámetro — hora de
 * despertar, no negociables agendados, áreas, tareas y las reglas
 * numéricas — leyendo con el cliente de sesión del usuario (RLS real,
 * nunca service role). armarSemana() en sí sigue sin tocar la base: acá
 * vive únicamente el puente entre la base y la función pura.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getReglasPlan, getReglasDecision, getReglasDosis, getReglasFoco } from '@/lib/frecuencia-kb';
import { diaYHoraLocal } from '@/lib/frecuencia-fecha';
import { copy } from '@/app/(private)/frecuencia/_copy';
import type { NoNegociableGuardado } from '@/types/frecuencia';
import type { DatosParaArmarSemana, DiaSemana, TareaParaPlan } from '@/lib/frecuencia/plan';

const DIAS_VALIDOS = new Set(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']);

/** Entradas legacy (string plano, del onboarding) quedan sin horario — se excluyen del armado hasta que alguien les asigne día y hora en la pantalla Semana. */
export function normalizarNoNegociables(raw: unknown): NoNegociableGuardado[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item): NoNegociableGuardado => {
    if (typeof item === 'string') return { texto: item, dia: null, horaInicio: null, horaFin: null };
    const obj = item as Partial<NoNegociableGuardado>;
    const dia = typeof obj.dia === 'string' && DIAS_VALIDOS.has(obj.dia) ? (obj.dia as DiaSemana) : null;
    return {
      texto: typeof obj.texto === 'string' ? obj.texto : '',
      dia,
      horaInicio: typeof obj.horaInicio === 'string' ? obj.horaInicio : null,
      horaFin: typeof obj.horaFin === 'string' ? obj.horaFin : null,
    };
  });
}

/**
 * Título a mostrar de un bloque ya guardado. frecuencia_bloques no
 * tiene columna de texto propia: para EJECUTAR/ORQUESTAR sale de la
 * tarea (join); para NO_NEGOCIABLE no hay tarea que joinear, así que se
 * reconstruye matcheando día+hora contra frecuencia_identidad.no_
 * negociables (misma fuente que armarSemana() usó para crearlo) en vez
 * de agregar una columna solo para esto. Una sola función para que
 * Semana y Hoy no puedan desalinearse (bug real: antes cada pantalla
 * tenía su propia versión y una de las dos devolvía "Imprevistos" para
 * los no negociables).
 */
export async function resolverTitulosDeBloques(
  userId: string,
  bloques: Array<{ id: string; tarea_id: string | null; tipo: string; inicio: string }>,
  timezone: string
): Promise<Map<string, string>> {
  const supabase = createSupabaseServerClient();

  const idsTareas = [...new Set(bloques.map((b) => b.tarea_id).filter((id): id is string => !!id))];
  let titulosPorTarea = new Map<string, string>();
  if (idsTareas.length > 0) {
    const { data } = await (supabase as any).from('frecuencia_tareas').select('id, titulo').in('id', idsTareas);
    titulosPorTarea = new Map((data ?? []).map((t: any) => [t.id, t.titulo]));
  }

  const { data: identidad } = await (supabase as any).from('frecuencia_identidad').select('no_negociables').eq('user_id', userId).maybeSingle();
  const noNegociables = normalizarNoNegociables(identidad?.no_negociables);
  const textoPorDiaHora = new Map(noNegociables.filter((n) => n.dia && n.horaInicio).map((n) => [`${n.dia}|${n.horaInicio}`, n.texto]));

  const resultado = new Map<string, string>();
  for (const b of bloques) {
    if (b.tarea_id) {
      resultado.set(b.id, titulosPorTarea.get(b.tarea_id) ?? '—');
    } else if (b.tipo === 'NO_NEGOCIABLE') {
      const { dia, hora } = diaYHoraLocal(b.inicio, timezone);
      resultado.set(b.id, textoPorDiaHora.get(`${dia}|${hora}`) ?? copy.semana.tipoLabel.NO_NEGOCIABLE);
    } else {
      resultado.set(b.id, copy.semana.tipoLabel.IMPREVISTOS);
    }
  }
  return resultado;
}

export interface DatosEnElAire {
  bloqueId: string;
  titulo: string;
  protocolo: string[];
  reglasFoco: string[];
  inicioReal: string;
  interrupciones: number;
  mostrarDosMinutos: boolean;
  textoDosMinutos: string;
}

/**
 * Todo lo que necesita el overlay de EN EL AIRE para un bloque —
 * usado tanto por la server action salirAlAire() (bloque recién
 * arrancado) como por hoy/page.tsx (resumir un bloque que ya estaba
 * EN_EL_AIRE al cargar la página, en este dispositivo o en otro).
 * Devuelve null si el bloque no tiene tarea asociada (no se puede
 * "salir al aire" con un NO_NEGOCIABLE o un IMPREVISTOS) o no tiene
 * inicio_real todavía.
 */
export async function obtenerDatosEnElAire(userId: string, bloqueId: string): Promise<DatosEnElAire | null> {
  const supabase = createSupabaseServerClient();

  const { data: bloque } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id, tarea_id, inicio_real, interrupciones')
    .eq('id', bloqueId)
    .eq('user_id', userId)
    .maybeSingle();
  if (!bloque || !bloque.tarea_id || !bloque.inicio_real) return null;

  const { data: tarea } = await (supabase as any)
    .from('frecuencia_tareas')
    .select('titulo, protocolo, veces_postergada')
    .eq('id', bloque.tarea_id)
    .maybeSingle();
  if (!tarea) return null;

  const reglasFoco = (await getReglasFoco()) ?? [];
  const reglasDosis = await getReglasDosis();
  const umbral = reglasDosis?.postergaciones_para_dos_minutos ?? null;
  const mostrarDosMinutos = umbral !== null && tarea.veces_postergada >= umbral;

  return {
    bloqueId: bloque.id,
    titulo: tarea.titulo,
    protocolo: Array.isArray(tarea.protocolo) ? tarea.protocolo : [],
    reglasFoco,
    inicioReal: bloque.inicio_real,
    interrupciones: bloque.interrupciones ?? 0,
    mostrarDosMinutos,
    textoDosMinutos: reglasDosis?.dos_minutos_de_dolor ?? '',
  };
}

export async function obtenerDatosParaArmarSemana(userId: string): Promise<{ datos: DatosParaArmarSemana } | { error: string }> {
  const supabase = createSupabaseServerClient();

  const { data: preferencias } = await (supabase as any)
    .from('frecuencia_preferencias')
    .select('hora_despertar')
    .eq('user_id', userId)
    .maybeSingle();
  const horaDespertarCruda = preferencias?.hora_despertar as string | null | undefined;
  if (!horaDespertarCruda) return { error: 'Falta la hora de despertar (se carga en el onboarding, paso Energía).' };
  const horaDespertar = horaDespertarCruda.slice(0, 5); // "HH:MM:SS" -> "HH:MM"

  const { data: identidad } = await (supabase as any)
    .from('frecuencia_identidad')
    .select('no_negociables')
    .eq('user_id', userId)
    .maybeSingle();
  const noNegociables = normalizarNoNegociables(identidad?.no_negociables)
    .filter((n): n is NoNegociableGuardado & { dia: DiaSemana; horaInicio: string; horaFin: string } => n.dia !== null && n.horaInicio !== null && n.horaFin !== null)
    .map((n) => ({ texto: n.texto, dia: n.dia, horaInicio: n.horaInicio, horaFin: n.horaFin }));

  const { data: areasData } = await (supabase as any)
    .from('frecuencia_areas')
    .select('area_key, es_manzana_podrida')
    .eq('user_id', userId);
  const areas = (areasData ?? []).map((a: any) => ({ areaKey: a.area_key as string, esManzanaPodrida: !!a.es_manzana_podrida }));

  const { data: objetivosData } = await (supabase as any).from('frecuencia_objetivos').select('id, area_key').eq('user_id', userId);
  const areaPorObjetivo = new Map<string, string | null>((objetivosData ?? []).map((o: any) => [o.id, o.area_key]));

  const { data: tareasData } = await (supabase as any)
    .from('frecuencia_tareas')
    .select('id, titulo, tipo_energia, duracion_min, dosis_objetivo, desbloquea, objetivo_id')
    .eq('user_id', userId);
  const tareas: TareaParaPlan[] = (tareasData ?? []).map((t: any) => ({
    id: t.id,
    titulo: t.titulo,
    tipoEnergia: t.tipo_energia,
    duracionMin: t.duracion_min ?? 30,
    dosisObjetivo: t.dosis_objetivo,
    vecesDesbloquea: Array.isArray(t.desbloquea) ? t.desbloquea.length : 0,
    areaKey: t.objetivo_id ? areaPorObjetivo.get(t.objetivo_id) ?? null : null,
    objetivoId: t.objetivo_id,
  }));

  const reglasPlan = await getReglasPlan();
  const reglasDecision = await getReglasDecision();
  if (!reglasPlan || typeof reglasPlan.imprevistos_porcentaje_dia !== 'number') {
    return { error: 'Falta reglas_plan.imprevistos_porcentaje_dia en frecuencia_knowledge_blocks.' };
  }
  if (!reglasDecision?.umbral_fatiga || typeof reglasDecision.umbral_fatiga.horas_desde_despertar !== 'number') {
    return { error: 'Falta reglas_decision.umbral_fatiga.horas_desde_despertar en frecuencia_knowledge_blocks.' };
  }

  return {
    datos: {
      horaDespertar,
      noNegociables,
      areas,
      tareas,
      reglas: {
        imprevistosPorcentajeDia: reglasPlan.imprevistos_porcentaje_dia,
        umbralFatigaHorasDesdeDespertar: reglasDecision.umbral_fatiga.horas_desde_despertar,
      },
    },
  };
}
