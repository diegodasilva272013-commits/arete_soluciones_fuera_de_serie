/**
 * POST /api/webhooks/elevenlabs-events
 *
 * Webhook post-conversación de ElevenLabs.
 * Guarda transcripción completa + descarga y almacena el audio en Supabase Storage.
 *
 * Configurar en ElevenLabs → Settings → Webhooks:
 *   URL: https://arete-soluciones-plataforma.vercel.app/api/webhooks/elevenlabs-events
 *   Secret: (ElevenLabs genera uno — ponelo en ELEVENLABS_WEBHOOK_SECRET en Vercel)
 *   Events: post_conversation_analysis
 *
 * Env vars requeridas en Vercel:
 *   ELEVENLABS_API_KEY         — tu API key de ElevenLabs (Settings → API Keys)
 *   ELEVENLABS_WEBHOOK_SECRET  — el secret que genera ElevenLabs al crear el webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// ── Helpers ────────────────────────────────────────────────────────────────────

async function verifySignature(secret: string, signature: string, body: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    // ElevenLabs envía el hash como hex
    const sigBytes = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body));
  } catch {
    return false;
  }
}

/** Descarga el audio de la conversación desde la API de ElevenLabs */
async function downloadAudio(conversationId: string, apiKey: string): Promise<Buffer | null> {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
      { headers: { 'xi-api-key': apiKey } }
    );
    if (!res.ok) {
      console.error(`[elevenlabs-events] audio fetch ${res.status}:`, await res.text());
      return null;
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('[elevenlabs-events] audio download error:', err);
    return null;
  }
}

/** Sube el audio a Supabase Storage y devuelve la URL firmada (7 días) */
async function uploadAudio(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  audio: Buffer
): Promise<string | null> {
  const path = `${conversationId}.mp3`;

  const { error: uploadErr } = await supabase.storage
    .from('grabaciones-ia')
    .upload(path, audio, {
      contentType: 'audio/mpeg',
      upsert: true,
    });

  if (uploadErr) {
    console.error('[elevenlabs-events] storage upload error:', uploadErr);
    return null;
  }

  // URL firmada válida por 7 días
  const { data: signed } = await supabase.storage
    .from('grabaciones-ia')
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  return signed?.signedUrl ?? null;
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verificar firma HMAC si ElevenLabs la envía
  const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  const signature = req.headers.get('elevenlabs-signature') ?? req.headers.get('x-elevenlabs-signature') ?? '';
  if (webhookSecret && signature) {
    const valid = await verifySignature(webhookSecret, signature, rawBody);
    if (!valid) {
      console.warn('[elevenlabs-events] firma inválida');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // ElevenLabs puede enviar el event type en distintos campos
  const type = (event.type ?? event.event_type ?? '') as string;

  // Solo procesar eventos de análisis post-conversación
  if (!type.includes('post_conversation') && !type.includes('conversation_ended')) {
    return NextResponse.json({ ok: true, skipped: type });
  }

  // ── Extraer conversation_id ─────────────────────────────────────────────
  const conversationId = (
    event.conversation_id ??
    (event.data as Record<string, unknown>)?.conversation_id
  ) as string | undefined;

  if (!conversationId) {
    console.warn('[elevenlabs-events] sin conversation_id en el evento');
    return NextResponse.json({ ok: true, skipped: 'no conversation_id' });
  }

  const data = (event.data ?? event) as Record<string, unknown>;

  // ── Transcripción ───────────────────────────────────────────────────────
  const transcriptArr = (
    data.transcript ??
    data.messages ??
    (event.transcript as unknown[]) ??
    []
  ) as Array<Record<string, string>>;

  const transcripcion = transcriptArr.length > 0
    ? transcriptArr
        .map(m => `[${(m.role ?? m.speaker ?? 'agente').toUpperCase()}]: ${m.message ?? m.content ?? m.text ?? ''}`)
        .join('\n')
    : null;

  // Análisis automático de ElevenLabs
  const analysis = (data.analysis ?? event.analysis) as Record<string, unknown> | undefined;
  const resumenAnalisis = analysis ? JSON.stringify(analysis, null, 2) : null;

  // ── Supabase ────────────────────────────────────────────────────────────
  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  // ── Descargar audio ─────────────────────────────────────────────────────
  let audioUrl: string | null = null;
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (elevenLabsApiKey) {
    const audioBuffer = await downloadAudio(conversationId, elevenLabsApiKey);
    if (audioBuffer) {
      audioUrl = await uploadAudio(supabase, conversationId, audioBuffer);
      if (audioUrl) {
        console.log(`[elevenlabs-events] audio guardado: ${conversationId}.mp3`);
      }
    }
  } else {
    console.warn('[elevenlabs-events] ELEVENLABS_API_KEY no configurada — no se descarga el audio');
  }

  // ── Guardar en base de datos ────────────────────────────────────────────
  // Buscar contacto_ia existente por conversation_id (si el agente llamó a registrar_llamada)
  const { data: existing } = await supabase
    .from('contactos_ia')
    .select('id')
    .eq('conversation_id', conversationId)
    .maybeSingle();

  const updates: Record<string, unknown> = {};
  if (transcripcion)   updates.transcripcion = transcripcion;
  if (resumenAnalisis) updates.resumen = `[ANÁLISIS AUTOMÁTICO ELEVENLABS]\n${resumenAnalisis}`;
  if (audioUrl)        updates.audio_url = audioUrl;

  if (existing) {
    if (Object.keys(updates).length > 0) {
      await supabase.from('contactos_ia').update(updates).eq('id', existing.id);
    }
  } else {
    // El agente no llamó a registrar_llamada — creamos el registro desde el evento
    await supabase.from('contactos_ia').insert({
      conversation_id: conversationId,
      resumen: resumenAnalisis
        ? `[ANÁLISIS AUTOMÁTICO ELEVENLABS]\n${resumenAnalisis}`
        : '(conversación sin resumen del agente)',
      transcripcion,
      audio_url: audioUrl,
    });
  }

  return NextResponse.json({
    ok: true,
    conversation_id: conversationId,
    audio_guardado: !!audioUrl,
    transcripcion_guardada: !!transcripcion,
  });
}
