/**
 * DEMO PROVIDUS — diagnóstico de las últimas llamadas del asistente. Solo administración.
 * Devuelve, por cada llamada reciente de ElevenLabs, a qué número se llamó, cómo terminó y el motivo si falló.
 */
import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { falla } from '@/lib/demo-providus/datos';
import { configIA } from '@/lib/demo-providus/llamada-ia';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  const cfg = configIA();
  if (!cfg) return falla('ia', 422, 'Falta configurar el agente de IA.');
  try {
    const h = { 'xi-api-key': cfg.apiKey };
    const l = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${encodeURIComponent(cfg.agentId)}&page_size=6`, { headers: h, signal: AbortSignal.timeout(15_000) });
    const lista = await l.json().catch(() => null);
    if (!l.ok) return falla('elevenlabs', 502, `ElevenLabs respondió ${l.status}: ${JSON.stringify(lista).slice(0, 200)}`);
    const filas = await Promise.all((lista?.conversations ?? []).map(async (c: { conversation_id: string }) => {
      const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(c.conversation_id)}`, { headers: h, signal: AbortSignal.timeout(15_000) });
      const d = await r.json().catch(() => null);
      const m = d?.metadata ?? {};
      return {
        id: c.conversation_id, status: d?.status, inicio: m.start_time_unix_secs ? new Date(m.start_time_unix_secs * 1000).toISOString() : null,
        segundos: m.call_duration_secs, numero: m.phone_call?.external_number ?? null, resultado: m.phone_call?.call_result ?? null,
        direccion: m.phone_call?.direction ?? null, error: m.error ?? null, motivo: m.termination_reason ?? null,
        variables: d?.conversation_initiation_client_data?.dynamic_variables ? { telefono_e164: d.conversation_initiation_client_data.dynamic_variables.telefono_e164, prospecto: d.conversation_initiation_client_data.dynamic_variables.prospecto_nombre } : null,
      };
    }));
    return NextResponse.json({ ok: true, llamadas: filas });
  } catch (e) {
    return falla('servidor', 503, e instanceof Error ? e.message : 'No se pudo consultar a ElevenLabs.');
  }
}
