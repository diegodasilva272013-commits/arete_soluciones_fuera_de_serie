// TEMPORAL — ida y vuelta TTS → Whisper para verificar la voz en producción. Se borra al terminar.
import { NextResponse } from 'next/server';
import { sintetizar, transcribir } from '@/lib/frecuencia/voz/openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const frase = new URL(req.url).searchParams.get('frase') ?? 'Hola, soy tu agente de Frecuencia. ¿Qué querés lograr esta semana?';
  const out: Record<string, unknown> = { frase };
  try {
    const t0 = Date.now();
    const audio = await sintetizar(frase);
    out.tts_ms = Date.now() - t0;
    out.tts_bytes = audio.byteLength;
    const t1 = Date.now();
    out.transcripcion = await transcribir(audio, 'audio/mpeg');
    out.stt_ms = Date.now() - t1;
  } catch (e) {
    out.error = `${(e as Error).name}: ${(e as Error).message}`;
  }
  return NextResponse.json(out);
}
