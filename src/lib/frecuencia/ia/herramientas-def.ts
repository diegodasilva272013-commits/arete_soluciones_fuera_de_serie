/**
 * Frecuencia — capa ÚNICA de herramientas (5.2): definición y validación.
 * La usan el chat de texto (tool calling) y el agente de voz (client tools
 * de ElevenLabs) a través de la misma función de ejecución del servidor
 * (app/(frecuencia)/frecuencia/_ia/ejecutar.ts). Nunca se duplica lógica
 * entre texto y voz. Esto es puro: sin base de datos ni red.
 */

import type { DefinicionHerramienta } from './nvidia';

export const NOMBRES_HERRAMIENTAS = ['crear_objetivo', 'crear_tarea', 'armar_semana', 'iniciar_bloque', 'registrar_evidencia', 'escribir_criterio'] as const;
export type NombreHerramienta = (typeof NOMBRES_HERRAMIENTAS)[number];

const TIPOS_ENERGIA = ['profundo', 'decision', 'creativo'] as const;

function fn(name: string, description: string, properties: Record<string, unknown>, required: string[]): DefinicionHerramienta {
  return { type: 'function', function: { name, description, parameters: { type: 'object', properties, required, additionalProperties: false } } };
}

export const DEFINICIONES: DefinicionHerramienta[] = [
  fn('crear_objetivo', 'Crea un objetivo nuevo de la persona.', {
    titulo: { type: 'string', description: 'Qué quiere lograr, en una frase.' },
    imagen_mental: { type: 'string', description: 'Cómo se ve ese objetivo cumplido.' },
    area_key: { type: 'string', description: 'Clave del área de vida a la que pertenece (opcional).' },
    fecha_limite: { type: 'string', description: 'Fecha límite YYYY-MM-DD (opcional).' },
    identidad_que_expresa: { type: 'string', description: 'Qué dice este objetivo de quién es la persona (opcional).' },
  }, ['titulo']),
  fn('crear_tarea', 'Crea una tarea dentro de un objetivo existente.', {
    objetivo_id: { type: 'string', description: 'Id del objetivo.' },
    titulo: { type: 'string' },
    protocolo: { type: 'array', items: { type: 'string' }, description: 'Pasos para ejecutarla sin pensar.' },
    tipo_energia: { type: 'string', enum: [...TIPOS_ENERGIA] },
    duracion_min: { type: 'integer', minimum: 5, maximum: 480 },
    dosis_objetivo: { type: 'integer', minimum: 1, maximum: 7, description: 'Veces por semana a las que se quiere llegar.' },
  }, ['objetivo_id', 'titulo']),
  fn('armar_semana', 'Propone la semana (sin guardar). Para guardarla: confirmar=true, con el propuesta_hash que devolvió la propuesta, SOLO después de que la persona dijo que sí en un mensaje posterior.', {
    confirmar: { type: 'boolean', description: 'false o ausente: solo propone. true: guarda la propuesta que la persona aceptó.' },
    propuesta_hash: { type: 'string', description: 'El propuesta_hash de la propuesta que se le mostró (obligatorio con confirmar=true).' },
  }, []),
  fn('iniciar_bloque', 'Sale al aire con un bloque programado.', { bloque_id: { type: 'string' } }, ['bloque_id']),
  fn('registrar_evidencia', 'Anota algo que la persona hizo hoy.', { texto: { type: 'string' } }, ['texto']),
  fn('escribir_criterio', 'Escribe un criterio (los 4 puntos). Si no está escrito, no es criterio.', {
    titulo: { type: 'string' },
    que_se_decide: { type: 'string' },
    que_entra: { type: 'string' },
    que_no_entra: { type: 'string' },
    costo_si_sale_mal: { type: 'string' },
    reversible: { type: 'boolean' },
    tiempo_reversibilidad: { type: 'string' },
  }, ['titulo', 'que_se_decide', 'que_entra', 'que_no_entra', 'costo_si_sale_mal', 'reversible']),
];

export type Validacion<T> = { ok: true; datos: T } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function texto(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}
function entero(v: unknown, min: number, max: number): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : null;
}
function objeto(a: unknown): Record<string, unknown> | null {
  return a && typeof a === 'object' && !Array.isArray(a) ? (a as Record<string, unknown>) : null;
}

export interface DatosCrearObjetivo { titulo: string; imagenMental: string | null; areaKey: string | null; fechaLimite: string | null; identidadQueExpresa: string | null }
export function validarCrearObjetivo(a: unknown): Validacion<DatosCrearObjetivo> {
  const o = objeto(a);
  const titulo = texto(o?.titulo, 200);
  if (!titulo) return { ok: false, error: 'Falta el título del objetivo.' };
  const fecha = o?.fecha_limite == null ? null : fechaCalendarioValida(o.fecha_limite) ? o.fecha_limite : undefined;
  if (fecha === undefined) return { ok: false, error: 'La fecha límite tiene que ser YYYY-MM-DD.' };
  return { ok: true, datos: { titulo, imagenMental: texto(o?.imagen_mental, 600), areaKey: texto(o?.area_key, 60), fechaLimite: fecha, identidadQueExpresa: texto(o?.identidad_que_expresa, 300) } };
}

export interface DatosCrearTarea { objetivoId: string; titulo: string; protocolo: string[]; tipoEnergia: (typeof TIPOS_ENERGIA)[number] | null; duracionMin: number | null; dosisObjetivo: number | null }
export function validarCrearTarea(a: unknown): Validacion<DatosCrearTarea> {
  const o = objeto(a);
  if (typeof o?.objetivo_id !== 'string' || !UUID.test(o.objetivo_id)) return { ok: false, error: 'Falta el id del objetivo (o no es válido).' };
  const titulo = texto(o.titulo, 200);
  if (!titulo) return { ok: false, error: 'Falta el título de la tarea.' };
  const protocolo = Array.isArray(o.protocolo) ? o.protocolo.map((p) => texto(p, 200)).filter((p): p is string => !!p).slice(0, 12) : [];
  const tipo = o.tipo_energia == null ? null : (TIPOS_ENERGIA as readonly unknown[]).includes(o.tipo_energia) ? (o.tipo_energia as DatosCrearTarea['tipoEnergia']) : undefined;
  if (tipo === undefined) return { ok: false, error: 'tipo_energia tiene que ser profundo, decision o creativo.' };
  const duracion = o.duracion_min == null ? null : entero(o.duracion_min, 5, 480);
  if (o.duracion_min != null && duracion === null) return { ok: false, error: 'duracion_min tiene que ser un entero entre 5 y 480.' };
  const dosis = o.dosis_objetivo == null ? null : entero(o.dosis_objetivo, 1, 7);
  if (o.dosis_objetivo != null && dosis === null) return { ok: false, error: 'dosis_objetivo tiene que ser un entero entre 1 y 7.' };
  return { ok: true, datos: { objetivoId: o.objetivo_id, titulo, protocolo, tipoEnergia: tipo, duracionMin: duracion, dosisObjetivo: dosis } };
}

export function validarArmarSemana(a: unknown): Validacion<{ confirmar: boolean; propuestaHash: string | null }> {
  const o = objeto(a);
  if (o?.confirmar != null && typeof o.confirmar !== 'boolean') return { ok: false, error: 'confirmar tiene que ser true o false.' };
  const hash = texto(o?.propuesta_hash, 40);
  if (o?.confirmar === true && !hash) return { ok: false, error: 'Para confirmar hace falta el propuesta_hash de la propuesta que se le mostró a la persona.' };
  return { ok: true, datos: { confirmar: o?.confirmar === true, propuestaHash: hash } };
}

/** Hash corto y determinístico (FNV-1a) de una propuesta: lo que se le MUESTRA es lo que se guarda. */
export function hashPropuesta(valor: unknown): string {
  const s = JSON.stringify(valor);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export interface EstadoConfirmacionSemana {
  /** Hash de la última propuesta que se le mostró a la persona en esta conversación (null si no hubo). */
  hashMostrado: string | null;
  /** ¿Hubo un mensaje de la PERSONA después de esa propuesta? (su "sí") */
  hayRespuestaPosterior: boolean;
  /** Hash de la propuesta que se calcularía ahora. */
  hashActual: string;
  /** Hash que pidió el modelo guardar. */
  hashSolicitado: string | null;
}
/** Compuerta de confirmación: solo se guarda lo que se mostró, tal cual, y después de que la persona respondió. */
export function puedeConfirmarSemana(e: EstadoConfirmacionSemana): { ok: true } | { ok: false; error: string } {
  if (!e.hashMostrado) return { ok: false, error: 'Primero hay que proponerle la semana a la persona y esperar su sí.' };
  if (!e.hayRespuestaPosterior) return { ok: false, error: 'Todavía no respondió: esperá su sí antes de guardar.' };
  if (!e.hashSolicitado || e.hashSolicitado !== e.hashMostrado) return { ok: false, error: 'Esa no es la propuesta que se le mostró.' };
  if (e.hashActual !== e.hashMostrado) return { ok: false, error: 'La propuesta cambió desde que se la mostraste: volvé a proponerla.' };
  return { ok: true };
}

/** Fecha YYYY-MM-DD que existe en el calendario (rechaza 2026-02-31). */
export function fechaCalendarioValida(f: unknown): f is string {
  if (typeof f !== 'string' || !FECHA.test(f)) return false;
  const d = new Date(`${f}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === f;
}

export function validarIniciarBloque(a: unknown): Validacion<{ bloqueId: string }> {
  const o = objeto(a);
  return typeof o?.bloque_id === 'string' && UUID.test(o.bloque_id) ? { ok: true, datos: { bloqueId: o.bloque_id } } : { ok: false, error: 'Falta el id del bloque (o no es válido).' };
}

export function validarRegistrarEvidencia(a: unknown): Validacion<{ texto: string }> {
  const t = texto(objeto(a)?.texto, 500);
  return t ? { ok: true, datos: { texto: t } } : { ok: false, error: 'Falta el texto de la evidencia.' };
}

export interface DatosCriterio { titulo: string; queSeDecide: string; queEntra: string; queNoEntra: string; costoSiSaleMal: string; reversible: boolean; tiempoReversibilidad: string | null }
export function validarEscribirCriterio(a: unknown): Validacion<DatosCriterio> {
  const o = objeto(a);
  const campos = { titulo: texto(o?.titulo, 160), queSeDecide: texto(o?.que_se_decide, 400), queEntra: texto(o?.que_entra, 400), queNoEntra: texto(o?.que_no_entra, 400), costoSiSaleMal: texto(o?.costo_si_sale_mal, 400) };
  const nombres: Record<string, string> = { titulo: 'titulo', queSeDecide: 'que_se_decide', queEntra: 'que_entra', queNoEntra: 'que_no_entra', costoSiSaleMal: 'costo_si_sale_mal' };
  const faltan = Object.entries(campos).filter(([, v]) => !v).map(([k]) => nombres[k]);
  if (faltan.length) return { ok: false, error: `Un criterio necesita los 4 puntos escritos. Falta: ${faltan.join(', ')}.` };
  if (typeof o?.reversible !== 'boolean') return { ok: false, error: 'Falta decir si es reversible (true o false).' };
  const tiempo = texto(o.tiempo_reversibilidad, 120);
  if (o.reversible && !tiempo) return { ok: false, error: 'Si es reversible, hay que decir en cuánto tiempo.' };
  return { ok: true, datos: { ...(campos as Omit<DatosCriterio, 'reversible' | 'tiempoReversibilidad'>), reversible: o.reversible, tiempoReversibilidad: tiempo } };
}

/** Parsea los argumentos que manda el modelo (JSON en string) sin tirar. */
export function parsearArgumentos(crudo: string | undefined | null): unknown {
  if (!crudo || !crudo.trim()) return {};
  try {
    return JSON.parse(crudo);
  } catch {
    return null;
  }
}
