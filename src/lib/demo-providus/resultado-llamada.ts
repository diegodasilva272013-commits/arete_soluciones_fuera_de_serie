/**
 * DEMO PROVIDUS — cómo terminó la llamada del asistente al cliente.
 * Se lee de ElevenLabs: GET /v1/convai/conversations/{id}. Lo que importa es
 * `metadata.phone_call.call_result` (answered / voicemail / busy / no_answer / failed), la duración y el
 * resumen que arma el análisis de la conversación. `status` solo dice si la conversación terminó de procesarse.
 */

export type EstadoLlamada = 'llamando' | 'atendida' | 'buzon' | 'ocupado' | 'no_atendio' | 'fallida';

export interface ResultadoConversacion {
  estado: EstadoLlamada;
  segundos: number | null;
  resumen: string | null;
  detalle: string | null;
}

/** Textos para mostrar en la pantalla del vendedor y en la central. */
export const ETIQUETA_LLAMADA: Record<string, { corta: string; larga: string; bueno: boolean }> = {
  llamando: { corta: 'IA llamando al cliente', larga: 'El asistente de voz está llamando al cliente…', bueno: true },
  atendida: { corta: 'IA habló con el cliente', larga: 'El asistente habló con el cliente.', bueno: true },
  buzon: { corta: 'Cayó en el buzón', larga: 'La llamada del asistente cayó en el buzón de voz. Llamalo vos.', bueno: false },
  ocupado: { corta: 'Cliente ocupado', larga: 'El cliente tenía el teléfono ocupado. Llamalo vos.', bueno: false },
  no_atendio: { corta: 'Cliente no atendió', larga: 'El cliente no atendió la llamada del asistente. Llamalo vos.', bueno: false },
  fallida: { corta: 'La llamada de IA falló', larga: 'No se pudo hacer la llamada del asistente. Llamalo vos.', bueno: false },
};

const POR_RESULTADO: Record<string, EstadoLlamada> = { answered: 'atendida', voicemail: 'buzon', busy: 'ocupado', no_answer: 'no_atendio', failed: 'fallida' };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function interpretarConversacion(c: any): ResultadoConversacion {
  const status: string = c?.status ?? '';
  const meta = c?.metadata ?? {};
  const segundos = Number.isFinite(meta.call_duration_secs) ? Number(meta.call_duration_secs) : null;
  const resumenCrudo = typeof c?.analysis?.transcript_summary === 'string' ? c.analysis.transcript_summary.trim() : '';
  const resultado: string | undefined = meta.phone_call?.call_result ?? undefined;
  const motivoError: string = [meta.error?.reason, meta.termination_reason].filter((x) => typeof x === 'string' && x).join(': ');

  // ElevenLabs a veces deja el estado en 'initiated' aunque la llamada ya terminó sin atender o falló al iniciarse (error 484, etc.).
  if ((status === 'initiated' || status === 'in-progress') && resultado && resultado !== 'answered' && POR_RESULTADO[resultado]) {
    const estado = POR_RESULTADO[resultado];
    const codigo = meta.error?.code ? `código ${meta.error.code}` : '';
    return { estado, segundos, resumen: null, detalle: estado === 'fallida' ? motivoError || (codigo ? `No se pudo iniciar la llamada (${codigo}): revisá que el número exista y esté bien escrito.` : 'La llamada falló.') : null };
  }
  if (status === 'initiated' || status === 'in-progress') return { estado: 'llamando', segundos: null, resumen: null, detalle: null };
  if (status === 'failed') return { estado: 'fallida', segundos, resumen: null, detalle: motivoError || 'ElevenLabs informó que la llamada falló.' };

  // 'processing' (la llamada ya cortó, falta el análisis) o 'done': si se sabe el resultado, se usa.
  if (resultado && POR_RESULTADO[resultado]) {
    const estado = POR_RESULTADO[resultado];
    return { estado, segundos, resumen: estado === 'atendida' ? resumenCrudo || null : null, detalle: estado === 'fallida' ? motivoError || 'La llamada falló.' : null };
  }
  if (status === 'processing') return { estado: 'llamando', segundos: null, resumen: null, detalle: null };

  // 'done' sin call_result: se deduce. Si el cliente habló, atendió; si no, no atendió.
  const cliente = Array.isArray(c?.transcript) ? c.transcript.filter((t: any) => t?.role === 'user' && typeof t?.message === 'string' && t.message.trim()).length : 0;
  if (cliente > 0 || (segundos ?? 0) >= 20) return { estado: 'atendida', segundos, resumen: resumenCrudo || null, detalle: null };
  return { estado: 'no_atendio', segundos, resumen: null, detalle: motivoError || null };
}

export const esFinal = (estado: string | null | undefined): boolean => !!estado && estado !== 'llamando' && estado !== 'pendiente';
