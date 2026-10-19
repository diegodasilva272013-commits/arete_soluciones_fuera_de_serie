/**
 * DEMO PROVIDUS — resumen de cargas por evento y promotora (todas, no solo las últimas 50).
 * Solo administración.
 */

import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { db, FALTA_SQL, falla, tablaFaltante } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  const { data, error } = await db()
    .from('demo_providus_registros')
    .select('evento, evento_id, promotora, promotora_id, sucursal, creado_en')
    .eq('eliminado', false)
    .order('creado_en', { ascending: false })
    .limit(10000);
  if (error) return tablaFaltante(error) ? falla('tabla', 503, FALTA_SQL) : falla('base', 502, `No se pudo leer: ${error.message}`);
  type Fila = { evento: string | null; promotora: string | null; promotora_id: string | null; sucursal: string | null; creado_en: string };
  const grupos = new Map<string, { evento: string; promotora: string; sucursal: string; cargas: number; ultima: string }>();
  for (const r of (data ?? []) as Fila[]) {
    const k = `${r.evento ?? ''}|${r.promotora_id ?? r.promotora ?? ''}`;
    const g = grupos.get(k);
    if (g) g.cargas++;
    else grupos.set(k, { evento: r.evento ?? '—', promotora: r.promotora ?? 'Sin identificar', sucursal: r.sucursal ?? '—', cargas: 1, ultima: r.creado_en });
  }
  const filas = [...grupos.values()].sort((a, b) => b.cargas - a.cargas);
  return NextResponse.json({ ok: true, total: (data ?? []).length, filas }, { headers: { 'Cache-Control': 'no-store' } });
}
