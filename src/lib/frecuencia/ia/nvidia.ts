/**
 * Frecuencia — cliente de NVIDIA (build.nvidia.com), SOLO del lado del
 * servidor. La clave (NVIDIA_API_KEY) nunca llega al cliente ni se loguea.
 *
 * Chat: endpoint compatible con OpenAI. Límite documentado: 40 pedidos por
 * minuto por modelo → ventana deslizante en memoria (mejor esfuerzo por
 * instancia; el 429 del proveedor también se traduce a un error legible).
 * Los modelos disponibles vienen de frecuencia_knowledge_blocks['modelos_ia'].
 *
 * Para pruebas locales se puede apuntar a un servidor falso con
 * NVIDIA_CHAT_BASE_URL / NVIDIA_IMAGES_BASE_URL, pero SOLO si además está
 * FRECUENCIA_IA_MODO_PRUEBA=1; sin eso se ignoran (así una variable mal
 * puesta nunca manda la clave a otro host). Los hosts reales son https.
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

/** Host base: el real, salvo modo de prueba explícito. */
export function baseUrl(real: string, override: string | undefined): string {
  return process.env.FRECUENCIA_IA_MODO_PRUEBA === '1' && override ? override : real;
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
      redirect: 'error',
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
  const base = baseUrl('https://integrate.api.nvidia.com/v1', process.env.NVIDIA_CHAT_BASE_URL);
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
  // Las llamadas a herramientas se tratan como no confiables: solo pasan las bien formadas.
  const llamadas = (m.tool_calls ?? []).filter((c) => !!c && typeof c.id === 'string' && c.type === 'function' && typeof c.function?.name === 'string' && (typeof c.function.arguments === 'string' || c.function.arguments == null)).map((c) => ({ ...c, function: { name: c.function.name, arguments: c.function.arguments ?? '' } }));
  return { role: 'assistant', content: m.content ?? null, tool_calls: llamadas.length ? llamadas : undefined };
}

// ── Imágenes ──────────────────────────────────────────────────────────

const HOST_IMAGENES = 'ai.api.nvidia.com';
const MAX_BYTES_IMAGEN = 5 * 1024 * 1024;

/**
 * El endpoint viene de la base (editable por admins): solo se aceptan https
 * y el host de NVIDIA para imágenes. En modo de prueba se puede redirigir al
 * servidor falso con NVIDIA_IMAGES_BASE_URL (se reemplaza el origen).
 */
export function endpointImagenSeguro(endpoint: string): string | null {
  try {
    const u = new URL(endpoint);
    if (process.env.FRECUENCIA_IA_MODO_PRUEBA === '1' && process.env.NVIDIA_IMAGES_BASE_URL) {
      return process.env.NVIDIA_IMAGES_BASE_URL.replace(/\/$/, '') + u.pathname;
    }
    return u.protocol === 'https:' && u.hostname === HOST_IMAGENES ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Tipo de imagen por su cabecera real (no por lo que diga el proveedor). */
export function tipoDeImagen(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return { mime: 'image/webp', ext: 'webp' };
  return null;
}

export async function generarImagen(args: { endpoint: string; prompt: string; modeloId: string }): Promise<{ bytes: Uint8Array; mime: string; ext: string }> {
  const url = endpointImagenSeguro(args.endpoint);
  if (!url) throw new ErrorIA('proveedor', 'El endpoint de imágenes no es válido.');
  if (!reservarPedido(`img:${args.modeloId}`)) throw new ErrorIA('limite', 'Se alcanzó el límite de pedidos por minuto de este modelo.');
  const r = (await pedir(url, { prompt: args.prompt, width: 1024, height: 1024, seed: 0, steps: 4 })) as { artifacts?: { base64?: string; finishReason?: string }[]; image?: string };
  const b64 = r?.artifacts?.[0]?.base64 ?? r?.image;
  if (typeof b64 !== 'string' || !b64 || (r?.artifacts?.[0]?.finishReason && r.artifacts[0].finishReason !== 'SUCCESS')) throw new ErrorIA('respuesta_invalida', 'La respuesta de imágenes no tiene el formato esperado.');
  const bytes = new Uint8Array(Buffer.from(b64, 'base64'));
  const tipo = tipoDeImagen(bytes);
  if (!tipo || bytes.length > MAX_BYTES_IMAGEN) throw new ErrorIA('respuesta_invalida', 'La imagen recibida no es válida.');
  return { bytes, ...tipo };
}
