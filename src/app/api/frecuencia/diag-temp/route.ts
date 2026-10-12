// TEMPORAL — prueba de la voz de NVIDIA (ASR + TTS por gRPC). Se borra al terminar.
import { NextResponse } from 'next/server';
import { sintetizar, transcribir } from '@/lib/frecuencia/voz/nvidia-voz';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: Request) {
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const out: Record<string, unknown> = {};
  const f = (await req.formData()).get('audio') as File | null;
  if (f) {
    const t0 = Date.now();
    try {
      out.asr = { ...(await transcribir(Buffer.from(await f.arrayBuffer()))), ms: Date.now() - t0 };
    } catch (e) {
      out.asr_error = `${(e as Error).name}: ${(e as Error).message}`.slice(0, 300);
    }
  }
  try {
    const t1 = Date.now();
    const wav = await sintetizar('Hola, soy tu agente de Frecuencia. ¿Qué querés lograr esta semana?');
    out.tts = { bytes: wav.length, ms: Date.now() - t1 };
    try {
      const t2 = Date.now();
      out.tts_ida_y_vuelta = { ...(await transcribir(wav)), ms: Date.now() - t2 };
    } catch (e) {
      out.tts_ida_y_vuelta_error = String((e as Error).message).slice(0, 200);
    }
    if (new URL(req.url).searchParams.get('devolver')) out.tts_audio_b64 = wav.toString('base64');
  } catch (e) {
    out.tts_error = `${(e as Error).name}: ${(e as Error).message}`.slice(0, 300);
  }
  return NextResponse.json(out);
}
