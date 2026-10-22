/** Quién está logueado ahora: promotora (con sus datos y los eventos activos), admin o nadie. */
import { NextResponse } from 'next/server';
import { sesionActual } from '@/lib/demo-providus/sesion';
import { COLS_PROMOTORA, COLS_VENDEDOR, db, eventosActivos, FALTA_SQL, FALTA_SQL_VENDEDORES, falla, publica, tablaFaltante, vendedorPublico } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';
const SIN_CACHE = { headers: { 'Cache-Control': 'no-store' } };

export async function GET() {
  const s = sesionActual();
  if (!s) return NextResponse.json({ ok: true, sesion: null }, SIN_CACHE);
  if (s.t === 'a') return NextResponse.json({ ok: true, sesion: 'admin' }, SIN_CACHE);
  if (s.t === 'v') {
    const { data, error } = await db().from('demo_providus_vendedores').select(COLS_VENDEDOR).eq('id', s.id).maybeSingle();
    if (error) return tablaFaltante(error) ? falla('tabla', 503, FALTA_SQL_VENDEDORES) : falla('base', 502, `No se pudo consultar: ${error.message}`);
    if (!data || !data.activo) return NextResponse.json({ ok: true, sesion: null }, SIN_CACHE);
    return NextResponse.json({ ok: true, sesion: 'vendedor', vendedor: vendedorPublico(data) }, SIN_CACHE);
  }
  const { data, error } = await db().from('demo_providus_promotoras').select(COLS_PROMOTORA).eq('id', s.id).maybeSingle();
  if (error) return tablaFaltante(error) ? falla('tabla', 503, FALTA_SQL) : falla('base', 502, `No se pudo consultar: ${error.message}`);
  if (!data || !data.activa) return NextResponse.json({ ok: true, sesion: null }, SIN_CACHE);
  const ev = await eventosActivos();
  return NextResponse.json({ ok: true, sesion: 'promotora', promotora: publica(data), eventos: ev.data }, SIN_CACHE);
}
