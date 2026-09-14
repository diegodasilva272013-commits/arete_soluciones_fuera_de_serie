/**
 * POST /api/webhooks/consultar-disponibilidad
 *
 * Webhook llamado por el agente de voz (ElevenLabs) para obtener los slots
 * disponibles en los próximos días.
 *
 * Auth: header  X-Webhook-Secret: <WEBHOOK_IA_SECRET>
 *
 * Payload de entrada (cualquier campo es opcional):
 *   { dias?: number }   — cuántos días hacia adelante buscar (default 7)
 *
 * Respuesta:
 *   { slots: [{ id, inicio_local, duracion_min, etiqueta }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const APP_TZ = 'America/Argentina/Buenos_Aires';

// Formato legible para el agente de voz
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
  const secret = req.headers.get('x-webhook-secret') ?? req.headers.get('X-Webhook-Secret');
  if (secret !== process.env.WEBHOOK_IA_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // ── Params ───────────────────────────────────────────────────────────
  let dias = 7;
  try {
    const body = await req.json();
    if (body?.parameters?.dias) dias = Number(body.parameters.dias) || 7;
    else if (body?.dias) dias = Number(body.dias) || 7;
  } catch {
    // body vacío está ok
  }
  dias = Math.max(1, Math.min(dias, 30));

  // ── Query ────────────────────────────────────────────────────────────
  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  const now = new Date();
  const hasta = new Date(now);
  hasta.setDate(hasta.getDate() + dias);

  const { data: slots, error } = await supabase
    .from('slots_publicos')
    .select('id, inicio, duracion_min, etiqueta')
    .eq('disponible', true)
    .gte('inicio', now.toISOString())
    .lte('inicio', hasta.toISOString())
    .order('inicio', { ascending: true })
    .limit(10);

  if (error) {
    console.error('[webhook/consultar-disponibilidad]', error);
    return NextResponse.json({ error: 'Error al consultar' }, { status: 500 });
  }

  if (!slots || slots.length === 0) {
    return NextResponse.json({
      disponibles: 0,
      mensaje: 'No hay turnos disponibles en los próximos días. El equipo te contactará para coordinar.',
      slots: [],
    });
  }

  return NextResponse.json({
    disponibles: slots.length,
    slots: slots.map(s => ({
      id: s.id,
      inicio_iso: s.inicio,
      inicio_local: formatSlotLabel(s.inicio),
      duracion_min: s.duracion_min,
      etiqueta: s.etiqueta ?? 'Diagnóstico inicial',
    })),
  });
}
