/**
 * Voz de Frecuencia, SOLO del lado del servidor: pasar audio a texto (Whisper)
 * y texto a audio (TTS de OpenAI). La clave (OPENAI_API_KEY, la misma que ya
 * usa la plataforma) nunca llega al navegador ni se loguea.
 */

export type CodigoErrorVoz = 'sin_clave' | 'proveedor' | 'vacio';

export class ErrorVoz extends Error {
  constructor(public codigo: CodigoErrorVoz, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorVoz';
  }
}

function clave(): string {
  const k = process.env.OPENAI_API_KEY?.trim();
  if (!k) throw new ErrorVoz('sin_clave', 'Falta OPENAI_API_KEY en el entorno del servidor.');
  return k;
}

function extension(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes('mp4') || m.includes('m4a') || m.includes('aac')) return 'mp4';
  if (m.includes('ogg')) return 'ogg';
  if (m.includes('wav')) return 'wav';
  if (m.includes('mpeg') || m.includes('mp3')) return 'mp3';
  return 'webm';
}

/** Audio → texto en español. Devuelve '' si no se entendió nada. */
export async function transcribir(bytes: ArrayBuffer, mime: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', new Blob([bytes], { type: mime || 'audio/webm' }), `voz.${extension(mime)}`);
  fd.append('model', 'whisper-1');
  fd.append('language', 'es');
  fd.append('response_format', 'json');
  fd.append('temperature', '0');
  let r: Response;
  try {
    r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave()}` },
      body: fd,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    if (e instanceof ErrorVoz) throw e;
    throw new ErrorVoz('proveedor', 'No se pudo hablar con el servicio de transcripción.');
  }
  if (!r.ok) {
    console.error('[voz] transcripción rechazada', r.status, (await r.text().catch(() => '')).slice(0, 200));
    throw new ErrorVoz('proveedor', `El servicio de transcripción respondió ${r.status}.`);
  }
  const j = (await r.json().catch(() => null)) as { text?: string } | null;
  return String(j?.text ?? '').trim();
}

/** Texto → audio mp3 con voz en español rioplatense. Prueba el modelo con instrucciones y, si no está disponible, el estándar. */
export async function sintetizar(texto: string): Promise<ArrayBuffer> {
  const input = texto.trim().slice(0, 2000);
  if (!input) throw new ErrorVoz('vacio', 'No hay texto para leer.');
  const intentos: Record<string, unknown>[] = [
    {
      model: 'gpt-4o-mini-tts',
      voice: 'nova',
      input,
      instructions: 'Hablá en español rioplatense (Argentina), con tono cálido, cercano y natural, como un amigo que te acompaña. Ritmo tranquilo, sin sonar robótico.',
      response_format: 'mp3',
    },
    { model: 'tts-1', voice: 'nova', input, response_format: 'mp3' },
  ];
  let ultimo = 0;
  for (const cuerpo of intentos) {
    try {
      const r = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { Authorization: `Bearer ${clave()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(30_000),
      });
      if (r.ok) return await r.arrayBuffer();
      ultimo = r.status;
      console.error('[voz] síntesis rechazada', cuerpo.model, r.status, (await r.text().catch(() => '')).slice(0, 160));
    } catch (e) {
      if (e instanceof ErrorVoz) throw e;
      ultimo = 0;
    }
  }
  throw new ErrorVoz('proveedor', `El servicio de voz respondió ${ultimo || 'sin respuesta'}.`);
}

/** Tope simple por persona (mejor esfuerzo por instancia): evita que un bucle gaste el crédito. */
const ventanas = new Map<string, number[]>();
export function reservarVoz(userId: string, tipo: string, maxPorMinuto: number, ahora: number = Date.now()): boolean {
  const k = `${tipo}:${userId}`;
  const recientes = (ventanas.get(k) ?? []).filter((t) => ahora - t < 60_000);
  if (recientes.length >= maxPorMinuto) {
    ventanas.set(k, recientes);
    return false;
  }
  recientes.push(ahora);
  ventanas.set(k, recientes);
  return true;
}
