/**
 * DEMO PROVIDUS — deja el agente de ElevenLabs listo para los avisos a vendedores. Solo administración.
 * Activa en el agente los "overrides" del primer mensaje, del prompt y del idioma: así cada llamada saliente
 * puede traer su propio guion con los datos del lead, sin cambiar el guion de atención entrante del agente.
 * No toca ningún otro ajuste del agente (se conservan los overrides que ya tuviera activados).
 */
import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { falla } from '@/lib/demo-providus/datos';
import { configIA, overridesActivos, overridesParaActivar } from '@/lib/demo-providus/llamada-ia';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const motivo = (c: { detail?: { message?: string } | string } | null) => (typeof c?.detail === 'string' ? c.detail : c?.detail?.message ?? 'sin detalle');

export async function POST() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  const cfg = configIA();
  if (!cfg) return falla('config', 503, 'Falta cargar la clave, el ID del agente o el ID del número en Vercel.');
  const url = `https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(cfg.agentId)}`;
  const cab = { 'xi-api-key': cfg.apiKey };
  try {
    const actual = await fetch(url, { headers: cab, cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    const agente = await actual.json().catch(() => null);
    if (!actual.ok) return falla('agente', 502, `ElevenLabs no devolvió el agente (${actual.status}): ${motivo(agente)}`);

    const antes = overridesActivos(agente);
    if (antes.primer_mensaje && antes.prompt && antes.idioma) return NextResponse.json({ ok: true, cambio: false, personalizacion: antes });

    const r = await fetch(url, {
      method: 'PATCH',
      headers: { ...cab, 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_settings: { overrides: overridesParaActivar(agente) } }),
      signal: AbortSignal.timeout(15_000),
    });
    const resp = await r.json().catch(() => null);
    if (!r.ok) return falla('patch', 502, `ElevenLabs no aceptó el cambio (${r.status}): ${motivo(resp)}`);

    const verif = await fetch(url, { headers: cab, cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    const despues = overridesActivos(await verif.json().catch(() => null));
    return NextResponse.json({ ok: despues.primer_mensaje && despues.prompt && despues.idioma, cambio: true, personalizacion: despues });
  } catch (e) {
    console.error('[demo-providus] configurar agente', e instanceof Error ? e.message : e);
    return falla('servidor', 503, e instanceof Error ? e.message : 'No se pudo hablar con ElevenLabs.');
  }
}
