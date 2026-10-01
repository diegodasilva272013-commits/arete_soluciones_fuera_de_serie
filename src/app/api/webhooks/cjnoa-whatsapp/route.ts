/**
 * GET+POST /api/webhooks/cjnoa-whatsapp
 *
 * Puente real entre WhatsApp (Meta Cloud API) y el agente de Centro
 * Jurídico NOA en ElevenLabs. Esto es lo que hace que alguien le
 * escriba al número real de WhatsApp y el agente le conteste — distinto
 * del entorno de prueba en /interno/cjnoa-whatsapp, que es un simulador
 * para que Diego/Rodrigo prueben el mismo agente desde el navegador.
 *
 * Flujo (POST, mensaje entrante):
 *   1. Meta manda el mensaje del usuario → se guarda en cjnoa_mensajes (rol user).
 *   2. Se pide una Signed URL a ElevenLabs para el agente de CJ NOA.
 *   3. Se conecta por WebSocket a esa URL y se manda el texto del usuario.
 *   4. Se junta la respuesta completa del agente (evento agent_response).
 *   5. Se guarda la respuesta en cjnoa_mensajes (rol assistant).
 *   6. Se la manda de vuelta al usuario por la API de WhatsApp (Meta).
 *
 * Configurar en Meta for Developers → WhatsApp → Configuration → Webhook:
 *   Callback URL: https://aretesoluciones.space/api/webhooks/cjnoa-whatsapp
 *   Verify token: el valor de META_WA_VERIFY_TOKEN (ver abajo)
 *   Campos a suscribir: messages
 *
 * Env vars requeridas en Vercel:
 *   META_WA_VERIFY_TOKEN     — token de verificación del webhook (lo elegimos nosotros)
 *   META_WA_ACCESS_TOKEN     — access token de la app de Meta (WhatsApp → API Setup)
 *   META_WA_PHONE_NUMBER_ID  — el Phone Number ID de WhatsApp Business (no el número en sí)
 *   ELEVENLABS_API_KEY       — ya configurada para el otro webhook de ElevenLabs
 *   META_WA_APP_SECRET       — opcional: si está, se verifica la firma X-Hub-Signature-256
 *   CJNOA_AGENT_ID           — opcional: por default usa el mismo agente de /empresa/agentes-ia
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { WebSocket, type RawData } from 'ws';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const maxDuration = 30;

const CJNOA_AGENT_ID = process.env.CJNOA_AGENT_ID || 'agent_9801m2tg8136e28sbnjptxxq1841';

// ── Verificación del webhook (Meta) ──────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WA_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ── Firma opcional de Meta (X-Hub-Signature-256) ─────────────────────────────

async function verifyMetaSignature(appSecret: string, signature: string, body: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(appSecret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(body));
  } catch {
    return false;
  }
}

// ── Guardar un mensaje en el log ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function guardarMensaje(
  supabase: SupabaseClient<any>,
  telefono: string,
  rol: 'user' | 'assistant',
  texto: string,
) {
  await supabase.from('cjnoa_mensajes').insert({ telefono, rol, texto });
}

// ── Preguntarle al agente de ElevenLabs ──────────────────────────────────────

async function preguntarAgente(userText: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('Falta ELEVENLABS_API_KEY');

  const signedUrlRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${CJNOA_AGENT_ID}`,
    { headers: { 'xi-api-key': apiKey } },
  );
  if (!signedUrlRes.ok) {
    throw new Error(`No se pudo obtener signed URL de ElevenLabs: ${signedUrlRes.status}`);
  }
  const { signed_url: signedUrl } = (await signedUrlRes.json()) as { signed_url: string };

  return new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(signedUrl);
    let fullResponse = '';
    let settled = false;

    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try { ws.close(); } catch { /* ya puede estar cerrado */ }
      resolve(value);
    };

    // Timeout de seguridad: si el agente no termina a tiempo, se manda lo
    // que se haya acumulado hasta ese momento (igual que la referencia).
    const timeout = setTimeout(() => finish(fullResponse), 20000);

    ws.on('open', () => {
      ws.send(JSON.stringify({ user_message: { text: userText } }));
    });

    ws.on('message', (raw: RawData) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (parsed.type === 'agent_response') {
        const event = parsed.agent_response_event as { agent_response?: string } | undefined;
        fullResponse += event?.agent_response ?? '';
      }
      if (parsed.type === 'agent_response_correction' || parsed.is_final) {
        finish(fullResponse);
      }
    });

    ws.on('error', (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ── Enviar la respuesta por WhatsApp ──────────────────────────────────────────

async function enviarWhatsapp(to: string, text: string) {
  const accessToken = process.env.META_WA_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    throw new Error('Faltan META_WA_ACCESS_TOKEN o META_WA_PHONE_NUMBER_ID');
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    console.error('[cjnoa-whatsapp] error al enviar WhatsApp:', res.status, await res.text());
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const appSecret = process.env.META_WA_APP_SECRET;
  const signature = req.headers.get('x-hub-signature-256') ?? '';
  if (appSecret && signature) {
    const valid = await verifyMetaSignature(appSecret, signature, rawBody);
    if (!valid) {
      console.warn('[cjnoa-whatsapp] firma inválida');
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ status: 'invalid json' }, { status: 400 });
  }

  const entry = (body.entry as Array<Record<string, unknown>> | undefined)?.[0];
  const change = (entry?.changes as Array<Record<string, unknown>> | undefined)?.[0];
  const value = change?.value as Record<string, unknown> | undefined;
  const message = (value?.messages as Array<Record<string, unknown>> | undefined)?.[0];

  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ignored' });
  }

  const fromNumber = message.from as string;
  const userText = ((message.text as Record<string, unknown>)?.body as string) ?? '';

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  await guardarMensaje(supabase, fromNumber, 'user', userText);

  let agentReply: string;
  try {
    agentReply = await preguntarAgente(userText);
  } catch (err) {
    console.error('[cjnoa-whatsapp] error consultando al agente:', err);
    return NextResponse.json({ status: 'agent_error' }, { status: 502 });
  }

  if (!agentReply) {
    console.warn('[cjnoa-whatsapp] el agente no devolvió respuesta para:', fromNumber);
    return NextResponse.json({ status: 'empty_response' });
  }

  await guardarMensaje(supabase, fromNumber, 'assistant', agentReply);
  await enviarWhatsapp(fromNumber, agentReply);

  return NextResponse.json({ status: 'success' });
}
