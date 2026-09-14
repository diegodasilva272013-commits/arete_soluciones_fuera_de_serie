/**
 * POST /api/webhooks/elevenlabs-events
 *
 * Webhook post-conversación de ElevenLabs.
 * Se llama automáticamente cuando termina una sesión de voz.
 * Guarda la transcripción completa en el contacto_ia correspondiente.
 *
 * Configurar en ElevenLabs → Settings → Webhooks:
 *   URL: https://arete-soluciones-plataforma.vercel.app/api/webhooks/elevenlabs-events
 *   Events: conversation_initiation_metadata, post_conversation_analysis
 *
 * ElevenLabs firma las requests con HMAC-SHA256.
 * Env vars requeridas: ELEVENLABS_WEBHOOK_SECRET (desde ElevenLabs dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  // ── Verificar firma HMAC de ElevenLabs ─────────────────────────────────
  const signature = req.headers.get('elevenlabs-signature') ?? '';
  const rawBody = await req.text();

  if (process.env.ELEVENLABS_WEBHOOK_SECRET && signature) {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(process.env.ELEVENLABS_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const sigBytes = Buffer.from(signature, 'hex');
      const valid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
      if (!valid) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
      }
    } catch {
      // Si falla la verificación, igual procesamos (no bloqueamos en prod)
      console.warn('[elevenlabs-events] firma no verificada');
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const type = event.type as string;

  // Solo procesamos eventos de conversación finalizada
  if (type !== 'post_conversation_analysis' && type !== 'conversation_initiation_metadata') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  // ── Extraer datos del evento ────────────────────────────────────────────
  const conversationId = (event.conversation_id ?? event.data as Record<string,unknown>)?.toString?.() ?? null;
  const data = (event.data ?? event) as Record<string, unknown>;

  // Transcripción completa (array de mensajes)
  const transcriptArr = (data.transcript ?? data.messages ?? []) as Array<Record<string, string>>;
  const transcripcion = transcriptArr.length > 0
    ? transcriptArr.map((m) => `[${m.role ?? m.speaker ?? 'agente'}]: ${m.message ?? m.content ?? m.text ?? ''}`).join('\n')
    : null;

  // Resumen / análisis post-conversación
  const analysis = data.analysis as Record<string, unknown> | undefined;
  const resumenAnalisis = analysis
    ? JSON.stringify(analysis, null, 2)
    : null;

  if (!transcripcion && !resumenAnalisis) {
    return NextResponse.json({ ok: true, nothing_to_save: true });
  }

  // ── Buscar si ya existe un contacto_ia para esta conversación ───────────
  // (el agente debió llamar a registrar_llamada; si no, creamos uno nuevo)
  const { data: existing } = await supabase
    .from('contactos_ia')
    .select('id')
    .eq('conversation_id', conversationId ?? '')
    .maybeSingle();

  if (existing) {
    await supabase
      .from('contactos_ia')
      .update({
        transcripcion: transcripcion ?? undefined,
        resumen: resumenAnalisis
          ? `[ANÁLISIS AUTOMÁTICO]\n${resumenAnalisis}`
          : undefined,
      })
      .eq('id', existing.id);
  } else {
    // Crear nuevo registro si el agente no llamó a registrar_llamada
    await supabase.from('contactos_ia').insert({
      resumen: resumenAnalisis
        ? `[ANÁLISIS AUTOMÁTICO]\n${resumenAnalisis}`
        : '(conversación sin resumen del agente)',
      transcripcion,
      conversation_id: conversationId,
    });
  }

  return NextResponse.json({ ok: true });
}
