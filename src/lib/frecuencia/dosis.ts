/**
 * Frecuencia — escalado de dosis (7.3).
 *
 * Función pura: dado el cumplimiento de las últimas semanas por tarea y
 * los umbrales de reglas_dosis (cargados afuera), PROPONE subir o bajar
 * la dosis (veces por semana) de una tarea. Nunca aplica nada: el usuario
 * confirma. Sin acceso a la base ni a Date.
 */

export interface ReglasEscaladoDosis {
  /** Subir: `semanas` seguidas con cumplimiento >= `cumplimientoMin` (0–1). */
  subir: { semanas: number; cumplimientoMin: number };
  /** Bajar: `semanas` seguidas con cumplimiento <= `cumplimientoMax` (0–1). */
  bajar: { semanas: number; cumplimientoMax: number };
}

export interface TareaParaEscalar {
  id: string;
  titulo: string;
  /** Veces por semana que hoy se agenda. */
  dosisActual: number;
  /** Hasta dónde crecer (null = tope duro de DOSIS_MAXIMA). */
  dosisObjetivo: number | null;
  /**
   * Fecha (YYYY-MM-DD) del último cambio de la tarea: solo cuentan las semanas
   * que EMPEZARON después, así una dosis recién subida no se vuelve a subir
   * con el mismo historial (hace falta vivir semanas nuevas con la dosis nueva).
   */
  cambiadaEn?: string | null;
}

/** Una semana (más reciente primero) con lo planificado y lo cumplido por tarea. */
export interface SemanaDeCumplimiento {
  lunes: string;
  porTarea: Record<string, { planificados: number; cumplidos: number }>;
}

export interface AjusteDosisPropuesto {
  tareaId: string;
  titulo: string;
  tipo: 'subir' | 'bajar';
  de: number;
  a: number;
  /** Cumplimiento (0–1) de cada una de las semanas evaluadas, la más reciente primero. */
  cumplimientos: number[];
}

/** Máximo duro de veces por semana cuando la tarea no tiene dosis objetivo. */
export const DOSIS_MAXIMA = 7;

function cumplimientoDeLaSemana(s: SemanaDeCumplimiento, tareaId: string): number | null {
  const d = s.porTarea[tareaId];
  if (!d || d.planificados <= 0) return null; // sin planificado no hay dato: corta la racha
  return Math.min(1, d.cumplidos / d.planificados);
}

/**
 * `semanas` viene ordenada de la más reciente a la más vieja y solo con
 * semanas ya terminadas. Cada tarea necesita datos en TODAS las semanas
 * que pide el umbral.
 */
export function proponerAjustesDosis(tareas: TareaParaEscalar[], semanas: SemanaDeCumplimiento[], reglas: ReglasEscaladoDosis): AjusteDosisPropuesto[] {
  const propuestas: AjusteDosisPropuesto[] = [];

  for (const t of tareas) {
    const datos = (n: number): number[] | null => {
      if (n <= 0 || semanas.length < n) return null;
      const valores: number[] = [];
      for (const s of semanas.slice(0, n)) {
        if (t.cambiadaEn && s.lunes < t.cambiadaEn) return null;
        const c = cumplimientoDeLaSemana(s, t.id);
        if (c === null) return null;
        valores.push(c);
      }
      return valores;
    };

    const paraSubir = datos(reglas.subir.semanas);
    const tope = t.dosisObjetivo ?? DOSIS_MAXIMA;
    if (paraSubir && paraSubir.every((c) => c >= reglas.subir.cumplimientoMin) && t.dosisActual < tope) {
      propuestas.push({ tareaId: t.id, titulo: t.titulo, tipo: 'subir', de: t.dosisActual, a: t.dosisActual + 1, cumplimientos: paraSubir });
      continue;
    }

    const paraBajar = datos(reglas.bajar.semanas);
    if (paraBajar && paraBajar.every((c) => c <= reglas.bajar.cumplimientoMax) && t.dosisActual > 1) {
      propuestas.push({ tareaId: t.id, titulo: t.titulo, tipo: 'bajar', de: t.dosisActual, a: t.dosisActual - 1, cumplimientos: paraBajar });
    }
  }

  return propuestas;
}
