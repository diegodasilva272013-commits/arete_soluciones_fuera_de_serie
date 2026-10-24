/**
 * DEMO PROVIDUS — exportación a CSV de TODAS las cargas con todos sus datos (cliente,
 * promotora con edad, sucursal, evento), incluidas las dadas de baja (columna "eliminado").
 * Solo administración. Abre bien en Excel (UTF-8 con BOM, separador de coma).
 */

import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { columnaFaltante, db, FALTA_SQL, falla, tablaFaltante } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

const COLUMNAS = [
  'creado_en', 'evento', 'sucursal', 'promotora', 'promotora_edad', 'nombre', 'apellido', 'telefono', 'telefono_e164',
  'email', 'instagram', 'provincia', 'localidad', 'foto_url', 'promotora_foto_url', 'vendedor_id', 'llamada_estado', 'eliminado', 'id',
] as const;
// Columnas de las migraciones 0089 y 0090: se agregan si existen.
const COLUMNAS_0089 = ['vendedor_nombre', 'contacto_estado', 'contacto_en', 'llamada_error'] as const;
const COLUMNAS_0090 = ['llamada_segundos', 'llamada_resumen', 'consentimiento', 'consentimiento_en'] as const;
const COLUMNAS_0091 = ['whatsapp_estado', 'whatsapp_en', 'whatsapp_error'] as const;

const celda = (v: unknown): string => {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutraliza fórmulas (=, +, -, @) que Excel ejecutaría al abrir un dato escrito por un tercero.
  const seguro = /^[=+\-@]/.test(s) && !/^\+?\d[\d\s-]*$/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
};

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  const leer = (cols: readonly string[]) => db().from('demo_providus_registros').select(cols.join(', ')).order('creado_en', { ascending: false }).limit(20000);
  // Se prueba con todas las columnas y se va sacando lo de las migraciones que todavía no se corrieron.
  const niveles: (readonly string[])[] = [[...COLUMNAS, ...COLUMNAS_0089, ...COLUMNAS_0090, ...COLUMNAS_0091], [...COLUMNAS, ...COLUMNAS_0089, ...COLUMNAS_0090], [...COLUMNAS, ...COLUMNAS_0089], COLUMNAS];
  let columnas = niveles[0];
  let { data, error } = await leer(columnas);
  for (let n = 1; columnaFaltante(error) && n < niveles.length; n++) { columnas = niveles[n]; ({ data, error } = await leer(columnas)); }
  if (error) return tablaFaltante(error) ? falla('tabla', 503, FALTA_SQL) : falla('base', 502, `No se pudo leer: ${error.message}`);
  const lineas = [columnas.join(','), ...((data ?? []) as Record<string, unknown>[]).map((r) => columnas.map((c) => celda(r[c])).join(','))];
  const hoy = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + lineas.join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="providus-cargas-${hoy}.csv"`, 'Cache-Control': 'no-store' },
  });
}
