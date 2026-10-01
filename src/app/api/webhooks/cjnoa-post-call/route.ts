/**
 * POST /api/webhooks/cjnoa-post-call
 *
 * Webhook post-conversación de ElevenLabs para el agente de Centro
 * Jurídico NOA. Guarda transcripción, resumen y los campos de Data
 * Collection configurados en ElevenLabs (nombre_consultante, dni_o_cuil,
 * telefono, rama_consulta, tipo_tramite_previsional, datos_adicionales).
 *
 * Configurar en ElevenLabs → Settings → Webhooks:
 *   URL: https://aretesoluciones.space/api/webhooks/cjnoa-post-call
 *   Secret: (ElevenLabs genera uno — ponelo en CJNOA_WEBHOOK_SECRET en Vercel)
 *   Events: post_conversation_analysis
 *
 * Env vars requeridas en Vercel:
 *   CJNOA_WEBHOOK_SECRET — el secret que genera ElevenLabs al crear el webhook
 *
 * Nota sobre Data Collection: la forma exacta en la que ElevenLabs manda
 * los campos extraídos dentro del payload no está confirmada contra un
 * envío real todavía — getCollectedField() prueba varias formas
 * razonables, y el evento crudo queda en los logs de Vercel (primeras
 * ~4000 chars) para poder ajustar la extracción después de la primera
 * llamada de prueba real, sin inventar una forma que no se verificó.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

async function verifySignature(secret: string, signature: string, body: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body));
  } catch {
    return false;
  }
}

const DATA_COLLECTION_FIELDS = [
  'nombre_consultante',
  'dni_o_cuil',
  'telefono',
  'rama_consulta',
  'tipo_tramite_previsional',
  'datos_adicionales',
] as const;

/** Prueba varias formas plausibles de dónde ElevenLabs pone un campo de
 *  Data Collection dentro del payload, sin asumir una sola forma fija. */
function getCollectedField(event: Record<string, unknown>, data: Record<string, unknown>, key: string): string | null {
  const analysis = (data.analysis ?? event.analysis) as Record<string, unknown> | undefined;
  const candidates: unknown[] = [
    (analysis?.data_collection_results as Record<string, unknown> | undefined)?.[key],
    (data.data_collection_results as Record<string, unknown> | undefined)?.[key],
    (event.data_collection_results as Record<string, unknown> | undefined)?.[key],
    (data.extracted_data as Record<string, unknown> | undefined)?.[key],
    (analysis?.extracted_data as Record<string, unknown> | undefined)?.[key],
  ];

  for (const raw of candidates) {
    if (raw === undefined || raw === null) continue;
    if (typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
      const v = (raw as { value?: unknown }).value;
      if (v !== undefined && v !== null && v !== '') return String(v);
      continue;
    }
    if (raw !== '') return String(raw);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const webhookSecret = process.env.CJNOA_WEBHOOK_SECRET;
  const signature = req.headers.get('elevenlabs-signature') ?? req.headers.get('x-elevenlabs-signature') ?? '';
  if (webhookSecret && signature) {
    const valid = await verifySignature(webhookSecret, signature, rawBody);
    if (!valid) {
      console.warn('[cjnoa-post-call] firma inválida');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  console.log('[cjnoa-post-call] evento crudo:', rawBody.slice(0, 4000));

  const type = (event.type ?? event.event_type ?? '') as string;
  if (!type.includes('post_conversation') && !type.includes('conversation_ended')) {
    return NextResponse.json({ ok: true, skipped: type });
  }

  const data = (event.data ?? event) as Record<string, unknown>;

  const conversationId = (event.conversation_id ?? data.conversation_id) as string | undefined;
  if (!conversationId) {
    console.warn('[cjnoa-post-call] sin conversation_id en el evento');
    return NextResponse.json({ ok: true, skipped: 'no conversation_id' });
  }

  const transcriptArr = (
    data.transcript ?? data.messages ?? (event.transcript as unknown[]) ?? []
  ) as Array<Record<string, string>>;
  const transcripcion = transcriptArr.length > 0
    ? transcriptArr
        .map(m => `[${(m.role ?? m.speaker ?? 'agente').toUpperCase()}]: ${m.message ?? m.content ?? m.text ?? ''}`)
        .join('\n')
    : null;

  const analysis = (data.analysis ?? event.analysis) as Record<string, unknown> | undefined;
  const resumen = (analysis?.transcript_summary ?? analysis?.summary) as string | undefined;

  const collected: Record<string, string | null> = {};
  for (const field of DATA_COLLECTION_FIELDS) {
    collected[field] = getCollectedField(event, data, field);
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  const { data: existing } = await supabase
    .from('cjnoa_consultas')
    .select('id')
    .eq('conversation_id', conversationId)
    .maybeSingle();

  const updates: Record<string, unknown> = {};
  if (transcripcion) updates.transcripcion = transcripcion;
  if (resumen) updates.resumen = resumen;
  for (const field of DATA_COLLECTION_FIELDS) {
    if (collected[field]) updates[field] = collected[field];
  }

  if (existing) {
    if (Object.keys(updates).length > 0) {
      await supabase.from('cjnoa_consultas').update(updates).eq('id', existing.id);
    }
  } else {
    await supabase.from('cjnoa_consultas').insert({ conversation_id: conversationId, ...updates });
  }

  return NextResponse.json({ ok: true, conversation_id: conversationId });
}
