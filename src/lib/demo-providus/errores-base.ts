/** Postgres 42P01 / "schema cache": falta correr la migración. Sin dependencias del servidor, así se puede probar suelto. */
export function tablaFaltante(e: { code?: string; message?: string } | null | undefined): boolean {
  return !!e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache|Could not find the/i.test(e.message ?? ''));
}

/**
 * Falta una columna (todavía no se corrió una migración). Supabase lo informa distinto según la operación:
 * al LEER, Postgres devuelve 42703 ("column x does not exist"); al INSERTAR o ACTUALIZAR, PostgREST devuelve
 * PGRST204 ("Could not find the 'x' column of 'y' in the schema cache"). Hay que revisar esto ANTES que
 * `tablaFaltante`, que también reconoce ese segundo mensaje.
 */
export function columnaFaltante(e: { code?: string; message?: string } | null | undefined): boolean {
  return !!e && (e.code === '42703' || e.code === 'PGRST204' || /column .* does not exist/i.test(e.message ?? '') || /Could not find the '[^']+' column/i.test(e.message ?? ''));
}
