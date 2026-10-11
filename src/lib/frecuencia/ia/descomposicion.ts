/**
 * Frecuencia — descomposición del objetivo con IA (5.3): validación pura.
 * La IA PROPONE; la persona revisa y confirma; recién ahí se guarda (y
 * después, armarSemana). Todo lo que devuelve el modelo se trata como no
 * confiable: se extrae el JSON, se valida la forma, se acotan los valores
 * y se descartan dependencias inválidas o con ciclos.
 */

export type TipoEnergiaIA = 'profundo' | 'decision' | 'creativo';

export interface TareaPropuesta {
  titulo: string;
  protocolo: string[];
  tipoEnergia: TipoEnergiaIA;
  duracionMin: number;
  dosisObjetivo: number;
  /** Índices (base 0) de las tareas que tienen que estar hechas antes. */
  dependeDe: number[];
}
export interface MetaPropuesta {
  periodo: string;
  meta: string;
}
export interface PropuestaDescomposicion {
  metas: MetaPropuesta[];
  tareas: TareaPropuesta[];
}

export const MAX_TAREAS = 10;
const TIPOS: TipoEnergiaIA[] = ['profundo', 'decision', 'creativo'];

/** Saca el JSON de una respuesta que puede venir con texto o con ```json … ```. */
export function extraerJSON(crudo: string): unknown {
  const t = crudo.trim();
  const limpio = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const intentos = [limpio];
  const i = limpio.indexOf('{');
  const j = limpio.lastIndexOf('}');
  if (i >= 0 && j > i) intentos.push(limpio.slice(i, j + 1));
  for (const x of intentos) {
    try {
      return JSON.parse(x);
    } catch {
      /* siguiente intento */
    }
  }
  return null;
}

function texto(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function acotar(v: unknown, min: number, max: number, defecto: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : defecto;
}

/** Quita dependencias hacia sí mismo, hacia índices que no existen o que cierran un ciclo. */
export function sinCiclos(tareas: TareaPropuesta[]): TareaPropuesta[] {
  const res = tareas.map((t) => ({ ...t, dependeDe: [...new Set(t.dependeDe)].filter((d) => Number.isInteger(d) && d >= 0 && d < tareas.length) }));
  const llegaA = (desde: number, objetivo: number, visitados = new Set<number>()): boolean => {
    if (desde === objetivo) return true;
    if (visitados.has(desde)) return false;
    visitados.add(desde);
    return res[desde].dependeDe.some((d) => llegaA(d, objetivo, visitados));
  };
  for (let i = 0; i < res.length; i++) {
    res[i].dependeDe = res[i].dependeDe.filter((d) => d !== i && !llegaA(d, i));
  }
  return res;
}

export type ResultadoPropuesta = { ok: true; propuesta: PropuestaDescomposicion } | { ok: false; error: string };

export function normalizarPropuesta(crudo: unknown): ResultadoPropuesta {
  const o = typeof crudo === 'string' ? extraerJSON(crudo) : crudo;
  if (!o || typeof o !== 'object') return { ok: false, error: 'La respuesta de la IA no tiene el formato esperado.' };
  const r = o as Record<string, unknown>;

  const tareasCrudas = Array.isArray(r.tareas) ? r.tareas.slice(0, MAX_TAREAS) : [];
  let tareas: TareaPropuesta[] = tareasCrudas
    .map((t) => {
      const x = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>;
      return {
        titulo: texto(x.titulo, 200),
        protocolo: Array.isArray(x.protocolo) ? x.protocolo.map((p) => texto(p, 200)).filter(Boolean).slice(0, 12) : [],
        tipoEnergia: (TIPOS as unknown[]).includes(x.tipo_energia) ? (x.tipo_energia as TipoEnergiaIA) : 'profundo',
        duracionMin: acotar(x.duracion_min, 15, 120, 50),
        dosisObjetivo: acotar(x.dosis_objetivo, 1, 5, 2),
        dependeDe: Array.isArray(x.depende_de) ? x.depende_de.filter((d): d is number => typeof d === 'number') : [],
      };
    })
    .filter((t) => t.titulo);
  if (!tareas.length) return { ok: false, error: 'La IA no propuso ninguna tarea.' };

  // Las dependencias se escribieron sobre los índices ORIGINALES: al descartar tareas sin título hay que re-mapear.
  const indicesOriginales = tareasCrudas.map((t, i) => ((t && typeof t === 'object' && texto((t as Record<string, unknown>).titulo, 200)) ? i : -1)).filter((i) => i >= 0);
  const nuevoIndice = new Map(indicesOriginales.map((orig, nuevo) => [orig, nuevo]));
  tareas = tareas.map((t) => ({ ...t, dependeDe: t.dependeDe.map((d) => nuevoIndice.get(d)).filter((d): d is number => d !== undefined) }));
  tareas = sinCiclos(tareas);

  const metas: MetaPropuesta[] = (Array.isArray(r.metas_por_periodo) ? r.metas_por_periodo : [])
    .map((m) => {
      const x = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
      return { periodo: texto(x.periodo, 60), meta: texto(x.meta, 300) };
    })
    .filter((m) => m.periodo && m.meta)
    .slice(0, 8);

  return { ok: true, propuesta: { metas, tareas } };
}

/** desbloquea = inverso de depende_de (por índice). */
export function desbloqueaPorIndice(tareas: TareaPropuesta[]): number[][] {
  const res: number[][] = tareas.map(() => []);
  tareas.forEach((t, i) => t.dependeDe.forEach((d) => res[d].push(i)));
  return res;
}

/**
 * Re-valida una propuesta que YA está normalizada (la que el navegador
 * devuelve al confirmar): nunca se confía en lo que llega del cliente, se
 * vuelve a acotar todo con las mismas reglas. Forma camelCase (la de
 * PropuestaDescomposicion), distinta de la forma cruda que escribe la IA.
 */
export function revalidarPropuesta(entrada: unknown): ResultadoPropuesta {
  if (!entrada || typeof entrada !== 'object') return { ok: false, error: 'Propuesta inválida.' };
  const r = entrada as Record<string, unknown>;
  const tareasCrudas = Array.isArray(r.tareas) ? r.tareas.slice(0, MAX_TAREAS) : [];
  const originales: number[] = [];
  let tareas: TareaPropuesta[] = [];
  tareasCrudas.forEach((t, i) => {
    const x = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>;
    const titulo = texto(x.titulo, 200);
    if (!titulo) return;
    originales.push(i);
    tareas.push({
      titulo,
      protocolo: Array.isArray(x.protocolo) ? x.protocolo.map((p) => texto(p, 200)).filter(Boolean).slice(0, 12) : [],
      tipoEnergia: (TIPOS as unknown[]).includes(x.tipoEnergia) ? (x.tipoEnergia as TipoEnergiaIA) : 'profundo',
      duracionMin: acotar(x.duracionMin, 15, 120, 50),
      dosisObjetivo: acotar(x.dosisObjetivo, 1, 5, 2),
      dependeDe: Array.isArray(x.dependeDe) ? x.dependeDe.filter((d): d is number => typeof d === 'number') : [],
    });
  });
  if (!tareas.length) return { ok: false, error: 'Propuesta sin tareas.' };
  const nuevo = new Map(originales.map((orig, n) => [orig, n]));
  tareas = sinCiclos(tareas.map((t) => ({ ...t, dependeDe: t.dependeDe.map((d) => nuevo.get(d)).filter((d): d is number => d !== undefined) })));
  const metas: MetaPropuesta[] = (Array.isArray(r.metas) ? r.metas : [])
    .map((m) => {
      const x = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>;
      return { periodo: texto(x.periodo, 60), meta: texto(x.meta, 300) };
    })
    .filter((m) => m.periodo && m.meta)
    .slice(0, 8);
  return { ok: true, propuesta: { metas, tareas } };
}
