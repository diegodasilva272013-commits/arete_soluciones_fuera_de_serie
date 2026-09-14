/**
 * POST /api/webhooks/registrar-llamada
 *
 * Llamado por el agente de voz ElevenLabs al finalizar la sesión.
 * Registra TODOS los datos recolectados + transcripción/resumen.
 *
 * Auth: Authorization: Bearer <WEBHOOK_IA_SECRET>
 *
 * Payload:
 *   {
 *     parameters: {
 *       resumen:       string  — resumen detallado de la llamada (requerido)
 *       nombre?:       string
 *       telefono?:     string
 *       email?:        string
 *       empresa?:      string
 *       motivo?:       string
 *       resultado?:    string  — agendada | no_agenda | fuera_de_serie | cliente_actual | spam | corto
 *       transcripcion?: string — texto completo de la conversación
 *       duracion_seg?: number
 *       reunion_id?:   string  — UUID de reunión si se agendó
 *       palabras_exactas?: string — frases literales del prospecto
 *     }
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

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

  let params: Record<string, string | number | undefined> = {};
  try {
    const body = await req.json();
    params = body?.parameters ?? body ?? {};
  } catch {
    return NextResponse.json({ registrado: false, error: 'Payload inválido' }, { status: 400 });
  }

  const {
    nombre, telefono, email, empresa, motivo,
    resumen, transcripcion, palabras_exactas,
    resultado, duracion_seg, reunion_id,
  } = params as Record<string, string | number | undefined>;

  // Armar resumen completo combinando todos los campos de texto
  const resumenCompleto = [
    resumen ? `RESUMEN: ${resumen}` : null,
    resultado ? `RESULTADO: ${resultado}` : null,
    motivo ? `MOTIVO: ${motivo}` : null,
    palabras_exactas ? `PALABRAS EXACTAS: ${palabras_exactas}` : null,
  ].filter(Boolean).join('\n\n') || '(sin resumen)';

  const transcripcionCompleta = [
    transcripcion ? String(transcripcion) : null,
    palabras_exactas && !transcripcion ? `Palabras del prospecto: ${palabras_exactas}` : null,
  ].filter(Boolean).join('\n\n') || null;

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  const { data: contacto, error } = await supabase
    .from('contactos_ia')
    .insert({
      nombre:        nombre    ? String(nombre)    : null,
      email:         email     ? String(email)     : null,
      telefono:      telefono  ? String(telefono)  : null,
      empresa:       empresa   ? String(empresa)   : null,
      resumen:       resumenCompleto,
      transcripcion: transcripcionCompleta,
      duracion_seg:  duracion_seg ? Number(duracion_seg) : null,
      reunion_id:    reunion_id   ? String(reunion_id)   : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[webhook/registrar-llamada]', error);
    return NextResponse.json({ registrado: false, error: 'Error al registrar' }, { status: 500 });
  }

  // Si se agendó reunión, vincularla al contacto
  if (reunion_id) {
    await supabase
      .from('reuniones_externas')
      .update({ contacto_ia_id: contacto.id })
      .eq('id', String(reunion_id));
  }

  return NextResponse.json({ registrado: true, contacto_id: contacto.id });
}
