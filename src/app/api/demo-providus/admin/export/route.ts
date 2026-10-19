/**
 * DEMO PROVIDUS — exportación a CSV de TODAS las cargas con todos sus datos (cliente,
 * promotora con edad, sucursal, evento), incluidas las dadas de baja (columna "eliminado").
 * Solo administración. Abre bien en Excel (UTF-8 con BOM, separador de coma).
 */

import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { db, FALTA_SQL, falla, tablaFaltante } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

const COLUMNAS = [
  'creado_en', 'evento', 'sucursal', 'promotora', 'promotora_edad', 'nombre', 'apellido', 'telefono', 'telefono_e164',
  'email', 'instagram', 'provincia', 'localidad', 'foto_url', 'promotora_foto_url', 'vendedor_id', 'llamada_estado', 'eliminado', 'id',
] as const;

const celda = (v: unknown): string => {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutraliza fórmulas (=, +, -, @) que Excel ejecutaría al abrir un dato escrito por un tercero.
  const seguro = /^[=+\-@]/.test(s) && !/^\+?\d[\d\s-]*$/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
};

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  const { data, error } = await db().from('demo_providus_registros').select(COLUMNAS.join(', ')).order('creado_en', { ascending: false }).limit(20000);
  if (error) return tablaFaltante(error) ? falla('tabla', 503, FALTA_SQL) : falla('base', 502, `No se pudo leer: ${error.message}`);
  const lineas = [COLUMNAS.join(','), ...((data ?? []) as Record<string, unknown>[]).map((r) => COLUMNAS.map((c) => celda(r[c])).join(','))];
  const hoy = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + lineas.join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="providus-cargas-${hoy}.csv"`, 'Cache-Control': 'no-store' },
  });
}
