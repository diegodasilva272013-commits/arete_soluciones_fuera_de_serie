/**
 * TEMPORAL — evidencia 0.7a: listado real de tablas y funciones
 * expuestas en PostgREST, para garantizar que ningún nombre de la
 * migración de Frecuencia choca con algo existente. Es un GET de solo
 * lectura al endpoint de introspección de PostgREST (no modifica nada).
 * Borrar apenas se use la evidencia.
 */
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  const res = await fetch(`${env.supabase.url}/rest/v1/`, {
    headers: {
      apikey: env.supabase.serviceRoleKey,
      Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
    },
  });
  const spec = await res.json();

  const paths = Object.keys(spec?.paths ?? {})
    .map((p: string) => p.replace(/^\//, ''))
    .filter(Boolean)
    .sort();

  const definitions = Object.keys(spec?.definitions ?? {}).sort();

  return NextResponse.json({
    status: res.status,
    tablas_y_funciones_expuestas: paths,
    definiciones: definitions,
  });
}
