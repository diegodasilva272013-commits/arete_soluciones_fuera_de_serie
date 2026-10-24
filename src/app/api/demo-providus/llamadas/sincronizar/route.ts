/**
 * DEMO PROVIDUS — pone al día cómo terminaron las llamadas del asistente. Administración o vendedor
 * (el vendedor solo ve y actualiza las de sus propios leads). Las pantallas lo llaman cada ~10 s mientras
 * haya alguna llamada en curso. Por cada registro en "llamando" le pregunta a ElevenLabs cómo va la conversación
 * y, cuando terminó, guarda el resultado (atendida, buzón, ocupado, no atendió o fallida), la duración y el resumen.
 * Si una llamada lleva más de 10 minutos sin cerrarse, se da por fallida para que no quede "llamando" para siempre.
 */
import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { db, falla } from '@/lib/demo-providus/datos';
import { configIA } from '@/lib/demo-providus/llamada-ia';
import { interpretarConversacion } from '@/lib/demo-providus/resultado-llamada';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const VENCE_MS = 10 * 60_000;
const UNA_VEZ_POR = 4000; // evita que varias pantallas abiertas consulten a ElevenLabs a la vez
let ultima = 0;

const sinColumna = (e: { code?: string; message?: string } | null) => !!e && (e.code === '42703' || /column .* does not exist/i.test(e.message ?? ''));

export async function POST() {
  const s = sesionActual();
  if (!s || s.t === 'p') return falla('sesion', 401, 'Ingresá con tu usuario.');
  const cfg = configIA();
  if (!cfg) return NextResponse.json({ ok: true, revisadas: 0, cambios: 0, detalle: 'La llamada de IA no está configurada.' });
  if (Date.now() - ultima < UNA_VEZ_POR) return NextResponse.json({ ok: true, revisadas: 0, cambios: 0, omitido: true });
  ultima = Date.now();

  const admin = db();
  let q = admin.from('demo_providus_registros').select('id, llamada_ref, llamada_en').eq('llamada_estado', 'llamando').eq('eliminado', false).order('llamada_en', { ascending: true }).limit(10);
  if (!esAdmin(s) && s.t === 'v') q = q.eq('vendedor_id', s.id);
  const { data, error } = await q;
  if (error) { console.error('[demo-providus] sincronizar', error.code, error.message); return falla('base', 502, `No se pudo leer: ${error.message}`); }

  let cambios = 0;
  for (const reg of (data ?? []) as { id: string; llamada_ref: string | null; llamada_en: string | null }[]) {
    const pasado = reg.llamada_en ? Date.now() - Date.parse(reg.llamada_en) : 0;
    let nuevo: { estado: string; segundos: number | null; resumen: string | null; detalle: string | null } | null = null;
    if (reg.llamada_ref) {
      try {
        const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(reg.llamada_ref)}`, { headers: { 'xi-api-key': cfg.apiKey }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (r.ok) nuevo = interpretarConversacion(await r.json().catch(() => null));
        else if (r.status === 404 && pasado > 2 * 60_000) nuevo = { estado: 'fallida', segundos: null, resumen: null, detalle: 'ElevenLabs no encontró la conversación.' };
      } catch { /* se reintenta en la próxima vuelta */ }
    } else if (pasado > 60_000) {
      nuevo = { estado: 'fallida', segundos: null, resumen: null, detalle: 'La llamada no tiene referencia en ElevenLabs.' };
    }
    if (nuevo?.estado === 'llamando' && pasado > VENCE_MS) nuevo = { estado: 'fallida', segundos: null, resumen: null, detalle: 'La llamada no terminó en 10 minutos.' };
    if (!nuevo || nuevo.estado === 'llamando') continue;

    const base = { llamada_estado: nuevo.estado, llamada_error: nuevo.detalle };
    let u = await admin.from('demo_providus_registros').update({ ...base, llamada_segundos: nuevo.segundos, llamada_resumen: nuevo.resumen }).eq('id', reg.id).eq('llamada_estado', 'llamando');
    if (sinColumna(u.error)) u = await admin.from('demo_providus_registros').update(base).eq('id', reg.id).eq('llamada_estado', 'llamando'); // antes de la migración 0090
    if (u.error) console.error('[demo-providus] no se pudo guardar el resultado', u.error.code, u.error.message);
    else cambios++;
  }
  return NextResponse.json({ ok: true, revisadas: (data ?? []).length, cambios });
}
