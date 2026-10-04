/**
 * TEMPORAL — evidencia 0.7a: tablas/funciones (PostgREST) + buckets de
 * storage existentes, para garantizar que ningún nombre de la migración
 * de Frecuencia choca. Solo lectura. Borrar apenas se use la evidencia.
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
  const paths = Object.keys(spec?.paths ?? {}).map((p: string) => p.replace(/^\//, '')).filter(Boolean).sort();

  const bucketsRes = await fetch(`${env.supabase.url}/storage/v1/bucket`, {
    headers: {
      apikey: env.supabase.serviceRoleKey,
      Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
    },
  });
  const buckets = await bucketsRes.json();

  return NextResponse.json({
    tablas_y_funciones_expuestas: paths,
    buckets_existentes: Array.isArray(buckets) ? buckets.map((b: any) => b.id) : buckets,
  });
}
