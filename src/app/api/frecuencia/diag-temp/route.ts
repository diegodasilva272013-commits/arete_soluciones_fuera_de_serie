// TEMPORAL — funciones públicas de voz en NVCF. Se borra al terminar.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const k = (process.env.nvidia_key || process.env.NVIDIA_API_KEY || '').trim();
  const r = await fetch('https://api.nvcf.nvidia.com/v2/nvcf/functions?visibility=public', { headers: { Authorization: `Bearer ${k}` }, signal: AbortSignal.timeout(30000) });
  const j = (await r.json()) as { functions?: { id: string; name: string; status: string; apiBodyFormat?: string; functionType?: string }[] };
  const todas = j.functions ?? [];
  const voz = todas.filter((x) => /asr|tts|speech|parakeet|canary|magpie|riva|whisper|fastpitch|voice|audio|stt|transcri/i.test(x.name));
  return NextResponse.json({ total: todas.length, voz: voz.map((x) => `${x.name} | ${x.id} | ${x.status} | ${x.apiBodyFormat ?? ''} ${x.functionType ?? ''}`), muestra: todas.slice(0, 5).map((x) => x.name) });
}
