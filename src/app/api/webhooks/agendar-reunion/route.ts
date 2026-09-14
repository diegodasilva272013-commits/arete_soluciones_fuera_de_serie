/**
 * POST /api/webhooks/agendar-reunion
 *
 * Llamado por el agente de voz ElevenLabs para confirmar un turno.
 * Auth: Authorization: Bearer <WEBHOOK_IA_SECRET>
 *
 * Payload:
 *   {
 *     parameters: {
 *       slot_id:   string  — UUID del slot (de consultar_disponibilidad)
 *       nombre:    string  — requerido
 *       telefono:  string  — requerido (sin esto no podemos contactar al prospecto)
 *       email?:    string
 *       empresa?:  string
 *       motivo?:   string
 *     }
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { env } from '@/lib/env';

const APP_TZ = 'America/Argentina/Buenos_Aires';

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: APP_TZ,
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  });
}

function checkAuth(req: NextRequest): boolean {
  const raw = req.headers.get('authorization') ?? '';
  const bearer = raw.startsWith('Bearer ') ? raw.slice(7) : null;
  const header = req.headers.get('x-webhook-secret');
  return (bearer ?? header) === process.env.WEBHOOK_IA_SECRET;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let params: Record<string, string> = {};
  try {
    const body = await req.json();
    params = body?.parameters ?? body ?? {};
  } catch {
    return NextResponse.json({ confirmado: false, mensaje: 'Payload inválido' }, { status: 400 });
  }

  const { slot_id, nombre, telefono, email, empresa, motivo } = params;

  // ── Validación — todos los datos de contacto son obligatorios ──────────
  if (!slot_id) {
    return NextResponse.json({ confirmado: false, mensaje: 'Falta el slot elegido.' }, { status: 400 });
  }
  if (!nombre) {
    return NextResponse.json({ confirmado: false, mensaje: 'Necesito tu nombre completo para confirmar el turno.' }, { status: 400 });
  }
  if (!telefono) {
    return NextResponse.json({ confirmado: false, mensaje: 'Necesito tu número de teléfono para que el equipo pueda contactarte y confirmar la reunión.' }, { status: 400 });
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  // ── Verificar slot disponible ───────────────────────────────────────────
  const { data: slot, error: slotErr } = await supabase
    .from('slots_publicos')
    .select('id, inicio, duracion_min, closer_id, disponible')
    .eq('id', slot_id)
    .single();

  if (slotErr || !slot) {
    return NextResponse.json({ confirmado: false, mensaje: 'El turno seleccionado no existe.' }, { status: 404 });
  }

  if (!slot.disponible) {
    return NextResponse.json({
      confirmado: false,
      mensaje: 'Ese turno ya fue reservado. ¿Querés que consulte otro horario disponible?',
    });
  }

  // ── Crear reunión externa ───────────────────────────────────────────────
  const { data: reunion, error: reErr } = await supabase
    .from('reuniones_externas')
    .insert({
      slot_id:     slot.id,
      nombre,
      telefono,
      email:       email   || null,
      empresa:     empresa || null,
      motivo:      motivo  || 'Diagnóstico inicial',
      inicio:      slot.inicio,
      duracion_min: slot.duracion_min,
      closer_id:   slot.closer_id,
      estado:      'pendiente',
      origen:      'ia_voz',
    })
    .select('id')
    .single();

  if (reErr || !reunion) {
    console.error('[webhook/agendar-reunion]', reErr);
    return NextResponse.json({
      confirmado: false,
      mensaje: 'Ocurrió un error técnico. El equipo te va a contactar para confirmar el turno manualmente.',
    }, { status: 500 });
  }

  // ── Marcar slot como no disponible ─────────────────────────────────────
  await supabase
    .from('slots_publicos')
    .update({ disponible: false, updated_at: new Date().toISOString() })
    .eq('id', slot_id);

  const inicioLocal = formatSlot(slot.inicio);

  // ── Enviar email de notificación al equipo Areté ───────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from:    'Agente IA <ia@aretesoluciones.com>',
        to:      ['arete@aretesoluciones.com'],
        subject: `📅 Nueva reunión agendada — ${nombre}`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
  <h2 style="color:#1a6fff;margin-bottom:4px">Nueva reunión agendada por el agente IA</h2>
  <p style="color:#666;margin-top:0">Agendado desde la web pública — revisá en <a href="https://arete-soluciones-plataforma.vercel.app/admin/calendario-ia">Calendario IA</a></p>

  <table style="width:100%;border-collapse:collapse;margin-top:20px">
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700;width:140px">Fecha y hora</td><td style="padding:10px 14px">${inicioLocal}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Nombre</td><td style="padding:10px 14px">${nombre}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">Teléfono</td><td style="padding:10px 14px">${telefono}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Email</td><td style="padding:10px 14px">${email || '—'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">Empresa</td><td style="padding:10px 14px">${empresa || '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Motivo</td><td style="padding:10px 14px">${motivo || 'Diagnóstico inicial'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">ID reunión</td><td style="padding:10px 14px;font-size:12px;color:#999">${reunion.id}</td></tr>
  </table>

  <p style="margin-top:24px;font-size:13px;color:#999">Areté Soluciones · Agente de voz IA</p>
</div>`,
      });
    } catch (emailErr) {
      // El email falla silenciosamente — la reunión ya quedó guardada
      console.error('[webhook/agendar-reunion] email error:', emailErr);
    }
  }

  return NextResponse.json({
    confirmado: true,
    reunion_id:   reunion.id,
    inicio_local: inicioLocal,
    mensaje: `¡Perfecto, ${nombre}! Tu reunión quedó agendada para el ${inicioLocal}. El equipo de Areté va a contactarte al ${telefono} para confirmar todos los detalles.`,
  });
}
