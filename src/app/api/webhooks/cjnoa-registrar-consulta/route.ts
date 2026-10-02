/**
 * POST /api/webhooks/cjnoa-registrar-consulta
 *
 * Tool (Webhook Tool, en tiempo real) que el agente de Centro Jurídico
 * NOA llama durante la conversación para ir registrando lo que dice el
 * cliente y lo que responde el agente — sin esperar al webhook post-call,
 * que puede llegar segundos o minutos más tarde o no llegar si la llamada
 * se corta de golpe.
 *
 * Configurar en ElevenLabs como Tool (Custom Tool → Webhook):
 *   URL: https://aretesoluciones.space/api/webhooks/cjnoa-registrar-consulta
 *   Método: POST
 *   Header: Authorization: Bearer <CJNOA_TOOL_SECRET>
 *
 * IMPORTANTE — para que se vea la respuesta del agente en el panel:
 *   La Tool tiene que mandar, además de lo que ya manda, un parámetro con
 *   el texto que el agente le está por responder al cliente en ese turno
 *   (por ejemplo "respuesta_agente"). Si ese parámetro no está configurado
 *   del lado de ElevenLabs, acá solo se puede guardar el lado del cliente,
 *   porque el agente nunca nos mandó su propia respuesta.
 *
 * Payload real configurado en la Tool "registrar_consulta" de ElevenLabs:
 *   {
 *     parameters: {
 *       mensaje?:           string — lo que escribió el cliente en este turno
 *       respuesta_agente?:  string — lo que responde el agente en este turno
 *       nombre_cliente?:    string
 *       telefono_cliente?:  string
 *       resumen_caso?:      string
 *     }
 *   }
 *
 * También acepta los nombres del diseño original (por si se configura la
 * Tool o el Data Collection del webhook post-call con esos nombres en vez
 * de los de arriba — ambos escriben en las mismas columnas):
 *   conversation_id, nombre_consultante, dni_o_cuil, telefono,
 *   rama_consulta, tipo_tramite_previsional, requiere_turno, resumen,
 *   datos_adicionales
 *
 * Agrupación de una misma conversación: por conversation_id si llega: si
 * no, por teléfono (toda consulta del mismo número en las últimas 12h se
 * considera la misma conversación) — así varios mensajes del mismo
 * intercambio de WhatsApp no terminan como "conversaciones" separadas.
 *
 * Env vars requeridas en Vercel:
 *   CJNOA_TOOL_SECRET — secret que el agente manda en el header Authorization
 *   RESEND_API_KEY    — opcional, para la notificación por email (si falta, se omite sin error)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { env } from '@/lib/env';

function checkAuth(req: NextRequest): boolean {
  const raw = req.headers.get('authorization') ?? '';
  const bearer = raw.startsWith('Bearer ') ? raw.slice(7) : null;
  const header = req.headers.get('x-webhook-secret');
  return (bearer ?? header) === process.env.CJNOA_TOOL_SECRET;
}

type MensajeEntry = { from: 'cliente' | 'agente'; texto: string; at: string };

const MERGEABLE_FIELDS = [
  'dni_o_cuil',
  'rama_consulta',
  'tipo_tramite_previsional',
  'resumen',
  'datos_adicionales',
] as const;

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let params: Record<string, unknown> = {};
  try {
    const body = await req.json();
    params = (body?.parameters ?? body ?? {}) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ registrado: false, error: 'Payload inválido' }, { status: 400 });
  }

  const str = (v: unknown) => (v === undefined || v === null || v === '' ? null : String(v));

  const conversationId = str(params.conversation_id);
  const mensajeCliente = str(params.mensaje);
  const respuestaAgente = str(params.respuesta_agente ?? params.agente_respuesta ?? params.respuesta);
  const nombre = str(params.nombre_cliente ?? params.nombre_consultante);
  const telefono = str(params.telefono_cliente ?? params.telefono);
  const requiereTurno = typeof params.requiere_turno === 'boolean' ? params.requiere_turno : null;

  const incoming: Record<string, string | null> = {
    dni_o_cuil: str(params.dni_o_cuil),
    rama_consulta: str(params.rama_consulta),
    tipo_tramite_previsional: str(params.tipo_tramite_previsional),
    resumen: str(params.resumen_caso ?? params.resumen),
    datos_adicionales: str(params.datos_adicionales),
  };

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  let existing: { id: string; mensajes: MensajeEntry[] } | null = null;

  if (conversationId) {
    const { data } = await supabase
      .from('cjnoa_consultas')
      .select('id, mensajes')
      .eq('conversation_id', conversationId)
      .maybeSingle();
    existing = data as { id: string; mensajes: MensajeEntry[] } | null;
  }

  if (!existing && telefono) {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('cjnoa_consultas')
      .select('id, mensajes')
      .eq('telefono', telefono)
      .gte('updated_at', twelveHoursAgo)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    existing = data as { id: string; mensajes: MensajeEntry[] } | null;
  }

  const nuevosMensajes: MensajeEntry[] = [];
  const now = new Date().toISOString();
  if (mensajeCliente) nuevosMensajes.push({ from: 'cliente', texto: mensajeCliente, at: now });
  if (respuestaAgente) nuevosMensajes.push({ from: 'agente', texto: respuestaAgente, at: now });

  let consultaId: string;
  let isNew = false;

  if (existing) {
    const update: Record<string, unknown> = {
      mensajes: [...(existing.mensajes ?? []), ...nuevosMensajes],
    };
    if (mensajeCliente) update.mensaje = mensajeCliente;
    if (conversationId) update.conversation_id = conversationId;
    if (nombre) update.nombre_consultante = nombre;
    if (telefono) update.telefono = telefono;
    if (requiereTurno !== null) update.requiere_turno = requiereTurno;
    for (const field of MERGEABLE_FIELDS) {
      if (incoming[field]) update[field] = incoming[field];
    }

    const { error } = await supabase.from('cjnoa_consultas').update(update).eq('id', existing.id);
    if (error) {
      console.error('[cjnoa-registrar-consulta] update error', error);
      return NextResponse.json({ registrado: false, error: 'Error al registrar' }, { status: 500 });
    }
    consultaId = existing.id;
  } else {
    isNew = true;
    const row = {
      conversation_id: conversationId,
      mensaje: mensajeCliente,
      mensajes: nuevosMensajes,
      nombre_consultante: nombre,
      telefono,
      requiere_turno: requiereTurno,
      ...incoming,
    };
    const { data: inserted, error } = await supabase
      .from('cjnoa_consultas')
      .insert(row)
      .select('id')
      .single();
    if (error) {
      console.error('[cjnoa-registrar-consulta] insert error', error);
      return NextResponse.json({ registrado: false, error: 'Error al registrar' }, { status: 500 });
    }
    consultaId = inserted.id;
  }

  if (isNew) {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'Agente CJ NOA <ia@aretesoluciones.com>',
          to: ['arete@aretesoluciones.com'],
          subject: `Nueva consulta — Centro Jurídico NOA${incoming.rama_consulta ? ` (${incoming.rama_consulta})` : ''}`,
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;padding:40px">
  <h2 style="color:#2F7BF6;margin-bottom:8px">Nueva consulta — Centro Jurídico NOA</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:16px">
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700;width:160px">Nombre</td><td style="padding:10px 14px">${nombre ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Teléfono</td><td style="padding:10px 14px">${telefono ?? '—'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">DNI / CUIL</td><td style="padding:10px 14px">${incoming.dni_o_cuil ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Rama</td><td style="padding:10px 14px">${incoming.rama_consulta ?? '—'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">Trámite</td><td style="padding:10px 14px">${incoming.tipo_tramite_previsional ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Quiere turno</td><td style="padding:10px 14px">${requiereTurno ? 'Sí' : 'No / no especificado'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">Resumen</td><td style="padding:10px 14px">${incoming.resumen ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Mensaje del cliente</td><td style="padding:10px 14px">${mensajeCliente ?? '—'}</td></tr>
  </table>
  <p style="margin-top:32px;font-size:13px;color:#999">Centro Jurídico NOA · agente de Areté Soluciones</p>
</div>`,
        });
      } catch (err) {
        console.error('[cjnoa-registrar-consulta] email error', err);
      }
    }
  }

  return NextResponse.json({ registrado: true, consulta_id: consultaId });
}
