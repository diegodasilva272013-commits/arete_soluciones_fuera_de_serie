/**
 * DEMO PROVIDUS — los leads de un vendedor. Solo sesión de vendedor, y solo lo que se le asignó:
 * el filtro por vendedor lo pone el servidor con el id de la sesión, nunca el navegador.
 * La pantalla del vendedor consulta esto cada ~2 s.
 */
import { NextResponse } from 'next/server';
import { sesionActual } from '@/lib/demo-providus/sesion';
import { COLS_VENDEDOR, columnaFaltante, db, FALTA_SQL_VENDEDORES, falla, tablaFaltante, vendedorPublico } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

const COLS = 'id, creado_en, asignado_en, nombre, apellido, telefono, telefono_e164, provincia, localidad, foto_url, evento, promotora, promotora_nombre, promotora_apellido, sucursal, contacto_estado, contacto_en, llamada_estado';
// Resultado de la llamada (migración 0090).
const COLS_LLAMADA = `${COLS}, llamada_segundos, llamada_resumen`;

export async function GET() {
  const s = sesionActual();
  if (!s || s.t !== 'v') return falla('sesion', 401, 'Ingresá con tu usuario de vendedor.');
  try {
    const admin = db();
    const leer = (cols: string) => admin.from('demo_providus_registros').select(cols).eq('vendedor_id', s.id).eq('eliminado', false).order('asignado_en', { ascending: false, nullsFirst: false }).limit(100);
    const [yo, conLlamada] = await Promise.all([
      admin.from('demo_providus_vendedores').select(COLS_VENDEDOR).eq('id', s.id).maybeSingle(),
      leer(COLS_LLAMADA),
    ]);
    const leads = columnaFaltante(conLlamada.error) ? await leer(COLS) : conLlamada;
    const error = yo.error ?? leads.error;
    if (error) {
      if (tablaFaltante(error)) return falla('tabla', 503, FALTA_SQL_VENDEDORES);
      console.error('[demo-providus] leads del vendedor', error.code, error.message);
      return falla('base', 502, `No se pudo leer: ${error.message}`);
    }
    if (!yo.data || !yo.data.activo) return falla('sesion', 401, 'Tu usuario ya no está activo. Avisale a quien administra.');
    return NextResponse.json({ ok: true, vendedor: vendedorPublico(yo.data), leads: leads.data ?? [], servidor: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[demo-providus] leads falló', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'El servidor no pudo leer los datos.');
  }
}
