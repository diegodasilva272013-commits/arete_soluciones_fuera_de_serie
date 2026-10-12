// TEMPORAL — simula un turno de chat real (prompt + herramientas) con la función de producción. Se borra al terminar.
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { chatCompletion, ErrorIA } from '@/lib/frecuencia/ia/nvidia';
import { DEFINICIONES } from '@/lib/frecuencia/ia/herramientas-def';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: Request) {
  noStore();
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });
  const sp = new URL(req.url).searchParams;
  const admin = createSupabaseAdminClient() as any;
  const { data: m } = await admin.from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'modelos_ia').maybeSingle();
  const { data: p } = await admin.from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'prompt_chat').maybeSingle();
  const lista = (m?.valor?.chat ?? []) as { id: string; por_defecto?: boolean }[];
  const modelo = sp.get('modelo') ?? (lista.find((x) => x.por_defecto) ?? lista[0])?.id ?? '';
  const aplicar = sp.get('aplicar');
  if (aplicar) {
    const nueva = JSON.parse(aplicar) as { id: string; nombre: string; por_defecto?: boolean }[];
    const nuevo = { ...(m?.valor ?? { imagenes: [] }), chat: nueva.map((x) => ({ id: x.id, nombre: x.nombre, licencia: 'NVIDIA API Catalog', ...(x.por_defecto ? { por_defecto: true } : {}) })) };
    const res = await admin.from('frecuencia_knowledge_blocks').update({ valor: nuevo }).eq('clave', 'modelos_ia').select('clave, valor');
    return NextResponse.json({ aplicado: res.error ? res.error.message : { filas: res.data?.length, chat: res.data?.[0]?.valor?.chat?.map((x: { id: string }) => x.id) } });
  }
  const t0 = Date.now();
  try {
    const r = await chatCompletion({
      modelo,
      mensajes: [
        { role: 'system', content: String(p?.valor?.texto ?? 'Sos un asistente.') },
        { role: 'user', content: sp.get('msg') ?? 'Hola, quiero armar un objetivo para este año.' },
      ],
      herramientas: DEFINICIONES,
    });
    return NextResponse.json({ ok: true, modelo, ms: Date.now() - t0, contenido: String(r.content ?? '').slice(0, 300), herramientas: (r.tool_calls ?? []).map((c) => c.function.name), prompt_cargado: !!p?.valor?.texto });
  } catch (e) {
    return NextResponse.json({ ok: false, modelo, ms: Date.now() - t0, codigo: e instanceof ErrorIA ? e.codigo : 'otro', mensaje: String((e as Error)?.message).slice(0, 200) });
  }
}
