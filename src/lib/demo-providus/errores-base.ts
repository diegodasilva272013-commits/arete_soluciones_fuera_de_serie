/** Postgres 42P01 / "schema cache": falta correr la migración. Sin dependencias del servidor, así se puede probar suelto. */
export function tablaFaltante(e: { code?: string; message?: string } | null | undefined): boolean {
  return !!e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache|Could not find the/i.test(e.message ?? ''));
}
