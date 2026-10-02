/**
 * POST /api/webhooks/cjnoa-conversation-init
 *
 * "Conversation Initiation Webhook" del agente de Centro Jurídico NOA.
 * ElevenLabs lo llama ANTES de que arranque cada conversación nueva por
 * WhatsApp (siempre que no venga ya con conversation_initiation_client_data),
 * pasando quién escribe. Acá buscamos si ese número ya consultó antes y le
 * devolvemos esos datos como dynamic_variables, para que el agente no
 * arranque de cero con alguien que ya habló con CJ NOA.
 *
 * Importante: esto NO reemplaza la memoria dentro de una misma conversación
 * (esa la mantiene ElevenLabs solo, nativamente) — esto es lo que le da
 * memoria ENTRE conversaciones distintas del mismo número.
 *
 * Configurar en ElevenLabs → agente CJ NOA → Settings → Conversation
 * Initiation Webhook:
 *   URL: https://aretesoluciones.space/api/webhooks/cjnoa-conversation-init
 *   Header: Authorization: Bearer <CJNOA_TOOL_SECRET>  (mismo secret que la Tool)
 *
 * Request que manda ElevenLabs (confirmado en su documentación):
 *   { caller_id, called_number, agent_id, call_sid, conversation_id }
 *   Para WhatsApp, caller_id es el ID de WhatsApp del que escribe — el
 *   mismo valor que ya guardamos en `telefono` vía system__caller_id.
 *
 * Para que el agente REALMENTE use estos datos hay que referenciarlos en
 * su system prompt, por ejemplo:
 *   "Si {{tiene_historial}} es true, ya hablaste antes con este cliente.
 *    Nombre: {{nombre_consultante}}. Último resumen: {{resumen_anterior}}.
 *    No le vuelvas a preguntar lo que ya sabés."
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const callerId = typeof body.caller_id === 'string' ? body.caller_id : null;

  const emptyResponse = {
    type: 'conversation_initiation_client_data',
    dynamic_variables: { tiene_historial: false },
  };

  if (!callerId) {
    return NextResponse.json(emptyResponse);
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const { data } = await supabase
    .from('cjnoa_consultas')
    .select('nombre_consultante, dni_o_cuil, rama_consulta, tipo_tramite_previsional, resumen, requiere_turno, datos_adicionales, updated_at')
    .eq('telefono', callerId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return NextResponse.json(emptyResponse);
  }

  const str = (v: unknown) => (v === undefined || v === null ? '' : String(v));

  return NextResponse.json({
    type: 'conversation_initiation_client_data',
    dynamic_variables: {
      tiene_historial: true,
      nombre_consultante: str(data.nombre_consultante),
      dni_o_cuil: str(data.dni_o_cuil),
      rama_consulta_anterior: str(data.rama_consulta),
      tramite_anterior: str(data.tipo_tramite_previsional),
      resumen_anterior: str(data.resumen),
      datos_adicionales_anteriores: str(data.datos_adicionales),
    },
  });
}
