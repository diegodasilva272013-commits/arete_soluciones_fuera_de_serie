// TEMPORAL — ¿el modelo omni de NVIDIA entiende audio? Se borra al terminar.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function POST(req: Request) {
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const k = (process.env.nvidia_key || process.env.NVIDIA_API_KEY || '').trim();
  const f = (await req.formData()).get('audio') as File;
  const b64 = Buffer.from(await f.arrayBuffer()).toString('base64');
  const modelo = new URL(req.url).searchParams.get('modelo') ?? 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';
  const pregunta = 'Transcribí literalmente lo que se dice en este audio, en español. Respondé solo con la transcripción.';
  const variantes: Record<string, unknown> = {
    input_audio: [{ type: 'text', text: pregunta }, { type: 'input_audio', input_audio: { data: b64, format: 'wav' } }],
    audio_url_data: [{ type: 'text', text: pregunta }, { type: 'audio_url', audio_url: { url: `data:audio/wav;base64,${b64}` } }],
  };
  const out: Record<string, unknown> = { modelo };
  for (const [nombre, content] of Object.entries(variantes)) {
    try {
      const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelo, max_tokens: 1500, messages: [{ role: 'user', content }] }),
        signal: AbortSignal.timeout(40000),
      });
      const t = await r.text();
      let texto = '';
      try { texto = JSON.parse(t)?.choices?.[0]?.message?.content ?? ''; } catch { /* nada */ }
      out[nombre] = { status: r.status, texto: String(texto).slice(0, 300), crudo: r.ok ? '' : t.slice(0, 250) };
    } catch (e) {
      out[nombre] = { error: String((e as Error).message).slice(0, 100) };
    }
  }
  return NextResponse.json(out);
}
