/**
 * POST /api/webhooks/registrar-llamada
 *
 * Webhook llamado por el agente de voz (ElevenLabs) al finalizar una sesión,
 * para registrar el contacto y (opcionalmente) vincularlo a una reunión agendada.
 *
 * Auth: header  X-Webhook-Secret: <WEBHOOK_IA_SECRET>
 *
 * Payload de entrada:
 *   {
 *     parameters: {
 *       nombre?:      string
 *       telefono?:    string
 *       email?:       string
 *       empresa?:     string
 *       resumen:      string  — resumen de la llamada (lo genera el agente)
 *       duracion_seg?: number
 *       reunion_id?:  string  — si el agente agendó una reunión en esta llamada
 *     }
 *   }
 *
 * Respuesta:
 *   { registrado: true, contacto_id }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret') ?? req.headers.get('X-Webhook-Secret');
  if (secret !== process.env.WEBHOOK_IA_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // ── Parse body ───────────────────────────────────────────────────────
  let params: Record<string, string | number> = {};
  try {
    const body = await req.json();
    params = body?.parameters ?? body ?? {};
  } catch {
    return NextResponse.json({ registrado: false, error: 'Payload inválido' }, { status: 400 });
  }

  const {
    nombre,
    telefono,
    email,
    empresa,
    resumen,
    duracion_seg,
    reunion_id,
  } = params as Record<string, string | number | undefined>;

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  // ── Insertar contacto_ia ──────────────────────────────────────────────
  const { data: contacto, error } = await supabase
    .from('contactos_ia')
    .insert({
      nombre: nombre ? String(nombre) : null,
      email: email ? String(email) : null,
      telefono: telefono ? String(telefono) : null,
      empresa: empresa ? String(empresa) : null,
      resumen: resumen ? String(resumen) : '(sin resumen)',
      duracion_seg: duracion_seg ? Number(duracion_seg) : null,
      reunion_id: reunion_id ? String(reunion_id) : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[webhook/registrar-llamada]', error);
    return NextResponse.json({ registrado: false, error: 'Error al registrar' }, { status: 500 });
  }

  return NextResponse.json({ registrado: true, contacto_id: contacto.id });
}
