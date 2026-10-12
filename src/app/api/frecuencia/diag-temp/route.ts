// TEMPORAL — ¿qué voz ofrece NVIDIA con la clave de la cuenta? Se borra al terminar.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

async function intento(nombre: string, f: () => Promise<Response>) {
  try {
    const r = await f();
    const t = await r.text();
    return { nombre, status: r.status, cuerpo: t.slice(0, 260) };
  } catch (e) {
    return { nombre, error: String((e as Error).message).slice(0, 120) };
  }
}

export async function POST(req: Request) {
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const k = (process.env.nvidia_key || process.env.NVIDIA_API_KEY || '').trim();
  const f = (await req.formData()).get('audio') as File;
  const bytes = await f.arrayBuffer();
  const H = { Authorization: `Bearer ${k}` };
  const out: unknown[] = [];

  for (const modelo of ['nvidia/parakeet-ctc-1.1b-asr', 'nvidia/parakeet-1.1b-rnnt-multilingual-asr', 'nvidia/canary-1b-asr', 'nvidia/parakeet-tdt-0.6b-v2']) {
    out.push(await intento(`asr ${modelo}`, () => {
      const fd = new FormData();
      fd.append('file', new Blob([bytes], { type: 'audio/wav' }), 'a.wav');
      fd.append('model', modelo);
      fd.append('language', 'es');
      return fetch('https://integrate.api.nvidia.com/v1/audio/transcriptions', { method: 'POST', headers: H, body: fd, signal: AbortSignal.timeout(30000) });
    }));
  }
  for (const modelo of ['nvidia/magpie-tts-multilingual', 'nvidia/magpie-tts-flow', 'nvidia/fastpitch-hifigan-tts']) {
    out.push(await intento(`tts ${modelo}`, () => fetch('https://integrate.api.nvidia.com/v1/audio/speech', {
      method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelo, input: 'Hola, ¿cómo estás?', voice: 'Magpie-Multilingual.ES-US.Mia', response_format: 'wav' }), signal: AbortSignal.timeout(30000),
    })));
  }
  out.push(await intento('nvcf functions public', () => fetch('https://api.nvcf.nvidia.com/v2/nvcf/functions?visibility=public', { headers: H, signal: AbortSignal.timeout(30000) })));
  // lista filtrada de funciones de voz
  try {
    const r = await fetch('https://api.nvcf.nvidia.com/v2/nvcf/functions?visibility=authorized', { headers: H, signal: AbortSignal.timeout(30000) });
    const j = (await r.json()) as { functions?: { id: string; name: string; status: string }[] };
    out.push({ nombre: 'nvcf authorized (voz)', status: r.status, total: j.functions?.length, voz: (j.functions ?? []).filter((x) => /asr|tts|speech|parakeet|canary|magpie|riva|whisper|fastpitch|voice/i.test(x.name)).map((x) => `${x.name} ${x.id} ${x.status}`) });
  } catch (e) {
    out.push({ nombre: 'nvcf authorized', error: String((e as Error).message).slice(0, 100) });
  }
  return NextResponse.json(out);
}
