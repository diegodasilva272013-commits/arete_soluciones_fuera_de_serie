/**
 * POST /api/webhooks/agendar-reunion
 *
 * Webhook llamado por el agente de voz (ElevenLabs) para confirmar un turno.
 *
 * Auth: header  X-Webhook-Secret: <WEBHOOK_IA_SECRET>
 *
 * Payload de entrada:
 *   {
 *     parameters: {
 *       slot_id:  string   — UUID del slot (de consultar-disponibilidad)
 *       nombre:   string
 *       telefono: string
 *       email?:   string
 *       empresa?: string
 *       motivo?:  string
 *     }
 *   }
 *
 * Respuesta:
 *   { confirmado: true, reunion_id, inicio_local, mensaje }
 *   | { confirmado: false, mensaje }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const APP_TZ = 'America/Argentina/Buenos_Aires';

function formatSlotLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    timeZone: APP_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────
  const rawAuth = req.headers.get('authorization') ?? '';
  const bearerSecret = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7) : null;
  const headerSecret = req.headers.get('x-webhook-secret');
  const secret = bearerSecret ?? headerSecret;
  if (secret !== process.env.WEBHOOK_IA_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // ── Parse body ───────────────────────────────────────────────────────
  let params: Record<string, string> = {};
  try {
    const body = await req.json();
    params = body?.parameters ?? body ?? {};
  } catch {
    return NextResponse.json({ confirmado: false, mensaje: 'Payload inválido' }, { status: 400 });
  }

  const { slot_id, nombre, telefono, email, empresa, motivo } = params;

  if (!slot_id || !nombre) {
    return NextResponse.json({
      confirmado: false,
      mensaje: 'Necesito tu nombre y el turno elegido para confirmar la reunión.',
    }, { status: 400 });
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  // ── Verificar que el slot sigue disponible (con lock) ─────────────────
  const { data: slot, error: slotErr } = await supabase
    .from('slots_publicos')
    .select('id, inicio, duracion_min, closer_id, disponible')
    .eq('id', slot_id)
    .single();

  if (slotErr || !slot) {
    return NextResponse.json({ confirmado: false, mensaje: 'El turno no existe.' }, { status: 404 });
  }

  if (!slot.disponible) {
    return NextResponse.json({
      confirmado: false,
      mensaje: 'Ese turno ya fue tomado. ¿Querés que te ofrezca otro horario disponible?',
    });
  }

  // ── Crear la reunion_externa ──────────────────────────────────────────
  const { data: reunion, error: reErr } = await supabase
    .from('reuniones_externas')
    .insert({
      slot_id: slot.id,
      nombre,
      telefono,
      email: email || null,
      empresa: empresa || null,
      motivo: motivo || 'Diagnóstico inicial',
      inicio: slot.inicio,
      duracion_min: slot.duracion_min,
      closer_id: slot.closer_id,
      estado: 'pendiente',
      origen: 'ia_voz',
    })
    .select('id')
    .single();

  if (reErr || !reunion) {
    console.error('[webhook/agendar-reunion] insert reunion_externa:', reErr);
    return NextResponse.json({
      confirmado: false,
      mensaje: 'Ocurrió un error al confirmar el turno. El equipo te contactará manualmente.',
    }, { status: 500 });
  }

  // ── Marcar slot como no disponible ────────────────────────────────────
  await supabase
    .from('slots_publicos')
    .update({ disponible: false, updated_at: new Date().toISOString() })
    .eq('id', slot_id);

  const inicioLocal = formatSlotLabel(slot.inicio);

  return NextResponse.json({
    confirmado: true,
    reunion_id: reunion.id,
    inicio_local: inicioLocal,
    mensaje: `¡Perfecto, ${nombre}! Tu reunión quedó agendada para el ${inicioLocal}. El equipo de Areté se va a poner en contacto con vos para confirmar los detalles.`,
  });
}
