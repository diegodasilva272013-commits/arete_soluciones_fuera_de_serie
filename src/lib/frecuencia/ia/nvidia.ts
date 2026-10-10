/**
 * Frecuencia — cliente de NVIDIA (build.nvidia.com), SOLO del lado del
 * servidor. La clave (NVIDIA_API_KEY) nunca llega al cliente ni se loguea.
 *
 * Chat: endpoint compatible con OpenAI. Límite documentado: 40 pedidos por
 * minuto por modelo → ventana deslizante en memoria (mejor esfuerzo por
 * instancia; el 429 del proveedor también se traduce a un error legible).
 * Los modelos disponibles vienen de frecuencia_knowledge_blocks['modelos_ia'].
 *
 * Para pruebas locales se pueden apuntar los hosts con NVIDIA_CHAT_BASE_URL
 * y NVIDIA_IMAGES_BASE_URL (un servidor falso); en producción no se usan.
 */

export type CodigoErrorIA = 'sin_clave' | 'limite' | 'proveedor' | 'timeout' | 'respuesta_invalida';

export class ErrorIA extends Error {
  constructor(public codigo: CodigoErrorIA, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorIA';
  }
}

export interface MensajeChat {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: LlamadaHerramienta[];
  tool_call_id?: string;
  name?: string;
}

export interface LlamadaHerramienta {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface DefinicionHerramienta {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

export const LIMITE_PEDIDOS_POR_MINUTO = 40;
const VENTANA_MS = 60_000;
const TIMEOUT_MS = 60_000;
const pedidos = new Map<string, number[]>();

/** Ventana deslizante por modelo. Devuelve false si se alcanzó el límite. */
export function reservarPedido(modelo: string, ahora: number = Date.now()): boolean {
  const recientes = (pedidos.get(modelo) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= LIMITE_PEDIDOS_POR_MINUTO) {
    pedidos.set(modelo, recientes);
    return false;
  }
  recientes.push(ahora);
  pedidos.set(modelo, recientes);
  return true;
}

export function reiniciarLimitesParaPruebas() {
  pedidos.clear();
}

function clave(): string {
  const k = process.env.NVIDIA_API_KEY;
  if (!k) throw new ErrorIA('sin_clave', 'Falta NVIDIA_API_KEY en el entorno.');
  return k;
}

async function pedir(url: string, cuerpo: unknown): Promise<unknown> {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave()}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cuerpo),
      signal: control.signal,
    });
    if (r.status === 429) throw new ErrorIA('limite', 'El proveedor de IA pidió esperar un momento.');
    if (!r.ok) throw new ErrorIA('proveedor', `El proveedor de IA respondió ${r.status}.`);
    return await r.json();
  } catch (e) {
    if (e instanceof ErrorIA) throw e;
    if ((e as Error)?.name === 'AbortError') throw new ErrorIA('timeout', 'El proveedor de IA tardó demasiado.');
    throw new ErrorIA('proveedor', 'No se pudo hablar con el proveedor de IA.');
  } finally {
    clearTimeout(temporizador);
  }
}

export async function chatCompletion(args: {
  modelo: string;
  mensajes: MensajeChat[];
  herramientas?: DefinicionHerramienta[];
  temperatura?: number;
  maxTokens?: number;
  /** Pide una respuesta JSON (para la descomposición del objetivo). */
  json?: boolean;
}): Promise<MensajeChat> {
  if (!reservarPedido(args.modelo)) throw new ErrorIA('limite', 'Se alcanzó el límite de pedidos por minuto de este modelo.');
  const base = process.env.NVIDIA_CHAT_BASE_URL ?? 'https://integrate.api.nvidia.com/v1';
  const cuerpo: Record<string, unknown> = {
    model: args.modelo,
    messages: args.mensajes,
    temperature: args.temperatura ?? 0.4,
    max_tokens: args.maxTokens ?? 1200,
    stream: false,
  };
  if (args.herramientas?.length) {
    cuerpo.tools = args.herramientas;
    cuerpo.tool_choice = 'auto';
  }
  if (args.json) cuerpo.response_format = { type: 'json_object' };

  const r = (await pedir(`${base}/chat/completions`, cuerpo)) as { choices?: { message?: MensajeChat }[] };
  const m = r?.choices?.[0]?.message;
  if (!m || (m.content == null && !m.tool_calls?.length)) throw new ErrorIA('respuesta_invalida', 'La respuesta del proveedor no tiene el formato esperado.');
  return { role: 'assistant', content: m.content ?? null, tool_calls: m.tool_calls };
}
