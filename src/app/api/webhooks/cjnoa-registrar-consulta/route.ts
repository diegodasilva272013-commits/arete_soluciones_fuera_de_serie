/**
 * POST /api/webhooks/cjnoa-registrar-consulta
 *
 * Tool (Webhook Tool, en tiempo real) que el agente de Centro Jurídico
 * NOA puede llamar durante o al final de la conversación, para dejar
 * registrado al instante lo que ya sabe del consultante — sin esperar
 * al webhook post-call, que puede llegar segundos o minutos más tarde
 * o no llegar si la llamada se corta de golpe.
 *
 * Configurar en ElevenLabs como Tool (Custom Tool → Webhook):
 *   URL: https://aretesoluciones.space/api/webhooks/cjnoa-registrar-consulta
 *   Método: POST
 *   Header: Authorization: Bearer <CJNOA_TOOL_SECRET>
 *
 * Payload real configurado en la Tool "registrar_consulta" de ElevenLabs:
 *   {
 *     parameters: {
 *       mensaje?:          string — lo que escribió el cliente
 *       nombre_cliente?:   string
 *       telefono_cliente?: string
 *       resumen_caso?:     string
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
  // Acepta tanto los nombres reales que manda la Tool de ElevenLabs
  // (mensaje, nombre_cliente, telefono_cliente, resumen_caso) como los del
  // diseño original (por si el Data Collection del webhook post-call usa
  // esos otros nombres) — ambos caen en las mismas columnas.
  const row = {
    conversation_id: str(params.conversation_id),
    mensaje: str(params.mensaje),
    nombre_consultante: str(params.nombre_cliente ?? params.nombre_consultante),
    dni_o_cuil: str(params.dni_o_cuil),
    telefono: str(params.telefono_cliente ?? params.telefono),
    rama_consulta: str(params.rama_consulta),
    tipo_tramite_previsional: str(params.tipo_tramite_previsional),
    requiere_turno: typeof params.requiere_turno === 'boolean' ? params.requiere_turno : null,
    resumen: str(params.resumen_caso ?? params.resumen),
    datos_adicionales: str(params.datos_adicionales),
  };

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  const existing = row.conversation_id
    ? (
        await supabase
          .from('cjnoa_consultas')
          .select('id')
          .eq('conversation_id', row.conversation_id)
          .maybeSingle()
      ).data
    : null;

  let consultaId: string;

  if (existing) {
    const { error } = await supabase.from('cjnoa_consultas').update(row).eq('id', existing.id);
    if (error) {
      console.error('[cjnoa-registrar-consulta] update error', error);
      return NextResponse.json({ registrado: false, error: 'Error al registrar' }, { status: 500 });
    }
    consultaId = existing.id;
  } else {
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

    // Notificación por email, solo en el registro inicial (no en cada update
    // posterior de la misma conversación).
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'Agente CJ NOA <ia@aretesoluciones.com>',
          to: ['arete@aretesoluciones.com'],
          subject: `Nueva consulta — Centro Jurídico NOA${row.rama_consulta ? ` (${row.rama_consulta})` : ''}`,
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;padding:40px">
  <h2 style="color:#2F7BF6;margin-bottom:8px">Nueva consulta — Centro Jurídico NOA</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:16px">
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700;width:160px">Nombre</td><td style="padding:10px 14px">${row.nombre_consultante ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Teléfono</td><td style="padding:10px 14px">${row.telefono ?? '—'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">DNI / CUIL</td><td style="padding:10px 14px">${row.dni_o_cuil ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Rama</td><td style="padding:10px 14px">${row.rama_consulta ?? '—'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">Trámite</td><td style="padding:10px 14px">${row.tipo_tramite_previsional ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Quiere turno</td><td style="padding:10px 14px">${row.requiere_turno ? 'Sí' : 'No / no especificado'}</td></tr>
    <tr style="background:#f5f5f5"><td style="padding:10px 14px;font-weight:700">Resumen</td><td style="padding:10px 14px">${row.resumen ?? '—'}</td></tr>
    <tr><td style="padding:10px 14px;font-weight:700">Mensaje del cliente</td><td style="padding:10px 14px">${row.mensaje ?? '—'}</td></tr>
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
