// TEMPORAL — diagnóstico de la clave de NVIDIA en producción. Se borra apenas
// se resuelve. Protegido con FRECUENCIA_C8_SECRET. No devuelve la clave.
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secreto = process.env.FRECUENCIA_C8_SECRET;
  if (!secreto || req.headers.get('x-diag') !== secreto) return NextResponse.json({ error: 'no' }, { status: 404 });

  const nombres = Object.keys(process.env).filter((n) => /nvidia/i.test(n));
  const k = (process.env.NVIDIA_API_KEY || process.env.nvidia_key || process.env.NVIDIA_KEY || '').trim();
  const out: Record<string, unknown> = {
    variables_nvidia: nombres,
    clave_presente: k.length > 0,
    clave_largo: k.length,
    clave_empieza_nvapi: k.startsWith('nvapi-'),
    clave_con_espacios_o_comillas: /\s|^["']|["']$/.test(process.env.nvidia_key ?? process.env.NVIDIA_API_KEY ?? ''),
  };

  let modelo = 'meta/llama-3.1-8b-instruct';
  try {
    const { data } = await (createSupabaseAdminClient() as any).from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'modelos_ia').maybeSingle();
    const lista = data?.valor?.chat as { id: string; por_defecto?: boolean }[] | undefined;
    const elegido = lista?.find((m) => m.por_defecto) ?? lista?.[0];
    out.modelos_en_base = lista?.map((m) => m.id) ?? null;
    if (elegido) modelo = elegido.id;
  } catch (e) {
    out.error_base = String((e as Error)?.message ?? e).slice(0, 200);
  }
  out.modelo_probado = modelo;

  if (k) {
    try {
      const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelo, messages: [{ role: 'user', content: 'Respondé solo: ok' }], max_tokens: 10 }),
      });
      out.nvidia_status = r.status;
      out.nvidia_respuesta = (await r.text()).slice(0, 400);
    } catch (e) {
      out.nvidia_error_red = String((e as Error)?.message ?? e).slice(0, 200);
    }
  }
  if (k) {
    try {
      const r = await fetch('https://integrate.api.nvidia.com/v1/models', { headers: { Authorization: `Bearer ${k}` } });
      const j = (await r.json()) as { data?: { id: string }[] };
      const ids = (j.data ?? []).map((m) => m.id);
      out.total_modelos = ids.length;
      out.modelos_disponibles = ids.filter((i) => /llama-3\.[1-9]|llama-4|nemotron|mistral|qwen|gpt-oss|deepseek|gemma/i.test(i) && !/vision|embed|guard|reward|safety|vl|clip|parse|retriev|rerank/i.test(i));
    } catch (e) {
      out.error_modelos = String((e as Error)?.message ?? e).slice(0, 200);
    }
    // Prueba con herramientas de los candidatos (?probar=id1,id2)
    const probar = (new URL(req.url).searchParams.get('probar') ?? '').split(',').filter(Boolean);
    const pruebas: Record<string, string> = {};
    for (const id of probar) {
      try {
        const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: id, max_tokens: 800, tool_choice: 'auto',
            messages: [{ role: 'user', content: 'Anotá el objetivo "correr" usando la herramienta.' }],
            tools: [{ type: 'function', function: { name: 'anotar', description: 'Anota un objetivo', parameters: { type: 'object', properties: { texto: { type: 'string' } }, required: ['texto'] } } }],
          }),
        });
        const t = await r.text();
        pruebas[id] = `${r.status} ${r.ok ? (t.includes('tool_calls') ? 'USA_HERRAMIENTAS' : 'sin_tool_calls') : t.slice(0, 160)}`;
      } catch (e) {
        pruebas[id] = 'error red';
      }
    }
    out.pruebas_herramientas = pruebas;
  }
  const sp = new URL(req.url).searchParams;
  // ?chat=id1,id2 : respuesta simple (sin herramientas) para ver el contenido
  const chat = (sp.get('chat') ?? '').split(',').filter(Boolean);
  if (k && chat.length) {
    const r2: Record<string, unknown> = {};
    for (const id of chat) {
      try {
        const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: id, max_tokens: 200, messages: [{ role: 'user', content: 'Respondé en una frase corta, en español rioplatense: ¿qué es un dial?' }] }),
        });
        const j = (await r.json().catch(() => null)) as { choices?: { message?: { content?: string | null; reasoning_content?: string | null } }[] } | null;
        const m = j?.choices?.[0]?.message;
        r2[id] = { status: r.status, content: m?.content ?? null, tiene_reasoning: !!m?.reasoning_content };
      } catch {
        r2[id] = { error: 'red' };
      }
    }
    out.chat = r2;
  }
  // ?aplicar=id1,id2 : reemplaza los modelos de chat en la base (el primero es el por defecto)
  const aplicar = (sp.get('aplicar') ?? '').split(',').filter(Boolean);
  if (aplicar.length) {
    const nombres: Record<string, string> = {
      'deepseek-ai/deepseek-v4.1-flash': 'DeepSeek V4.1 Flash',
      'openai/gpt-oss-20b': 'GPT-OSS 20B (más rápido)',
      'nvidia/nemotron-3-super-120b-a12b': 'Nemotron 3 Super 120B',
    };
    const admin = createSupabaseAdminClient() as any;
    const { data } = await admin.from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'modelos_ia').maybeSingle();
    const nuevo = {
      ...(data?.valor ?? { imagenes: [] }),
      chat: aplicar.map((id, i) => ({ id, nombre: nombres[id] ?? id, licencia: 'NVIDIA API Catalog', ...(i === 0 ? { por_defecto: true } : {}) })),
    };
    const { error } = await admin.from('frecuencia_knowledge_blocks').update({ valor: nuevo, updated_at: new Date().toISOString() }).eq('clave', 'modelos_ia');
    out.aplicado = error ? `error: ${error.message}` : nuevo.chat;
  }
  return NextResponse.json(out);
}
