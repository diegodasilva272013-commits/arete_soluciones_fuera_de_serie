// TEMPORAL — prueba de modelos de NVIDIA. Se borra al terminar. Protegido con FRECUENCIA_C8_SECRET.
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const URL_CHAT = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function probar(k: string, id: string) {
  const base = { model: id, max_tokens: 400 };
  const llamar = async (extra: Record<string, unknown>) => {
    try {
      const r = await fetch(URL_CHAT, { method: 'POST', headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...base, ...extra }), signal: AbortSignal.timeout(40000) });
      const t = await r.text();
      return { status: r.status, txt: t };
    } catch {
      return { status: 0, txt: 'timeout/red' };
    }
  };
  const simple = await llamar({ messages: [{ role: 'user', content: 'Respondé en una frase corta: ¿qué es un dial?' }] });
  let herramientas = '-';
  if (simple.status === 200) {
    const h = await llamar({
      tool_choice: 'auto',
      messages: [{ role: 'user', content: 'Anotá el objetivo "correr" usando la herramienta.' }],
      tools: [{ type: 'function', function: { name: 'anotar', description: 'Anota un objetivo', parameters: { type: 'object', properties: { texto: { type: 'string' } }, required: ['texto'] } } }],
    });
    herramientas = h.status === 200 ? (h.txt.includes('tool_calls') ? 'si' : 'no_uso') : `err${h.status}`;
  }
  let contenido = false;
  try { contenido = !!JSON.parse(simple.txt)?.choices?.[0]?.message?.content; } catch { /* nada */ }
  return { id, simple: simple.status, contenido, herramientas, detalle: simple.status === 200 ? '' : simple.txt.slice(0, 90) };
}

export async function GET(req: Request) {
  noStore();
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const k = (process.env.NVIDIA_API_KEY || process.env.nvidia_key || process.env.NVIDIA_KEY || '').trim();
  const sp = new URL(req.url).searchParams;

  if (sp.get('listar')) {
    const r = await fetch('https://integrate.api.nvidia.com/v1/models', { headers: { Authorization: `Bearer ${k}` } });
    const j = (await r.json()) as { data?: { id: string }[] };
    return NextResponse.json({ ids: (j.data ?? []).map((m) => m.id) });
  }
  const lote = (sp.get('lote') ?? '').split(',').filter(Boolean);
  if (lote.length) return NextResponse.json({ resultados: await Promise.all(lote.map((id) => probar(k, id))) });

  const aplicar = sp.get('aplicar');
  if (aplicar) {
    const lista = JSON.parse(aplicar) as { id: string; nombre: string; por_defecto?: boolean }[];
    const admin = createSupabaseAdminClient() as any;
    const { data } = await admin.from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'modelos_ia').maybeSingle();
    const nuevo = { ...(data?.valor ?? { imagenes: [] }), chat: lista.map((m) => ({ id: m.id, nombre: m.nombre, licencia: 'NVIDIA API Catalog', ...(m.por_defecto ? { por_defecto: true } : {}) })) };
    const res = await admin.from('frecuencia_knowledge_blocks').update({ valor: nuevo }).eq('clave', 'modelos_ia').select('clave, valor');
    return NextResponse.json({ aplicado: res.error ? res.error.message : { filas: res.data?.length, chat: res.data?.[0]?.valor?.chat?.map((m: { id: string }) => m.id) } });
  }
  return NextResponse.json({ ok: true });
}
