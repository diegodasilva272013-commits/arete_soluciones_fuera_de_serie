/**
 * TEMPORAL — evidencia 0.7c: columnas + conteo de filas de profiles y
 * 3 tablas más existentes, ANTES de correr la migración de Frecuencia.
 * Solo lectura (SELECT count, y las columnas via el spec de PostgREST).
 * Borrar apenas se use la evidencia.
 */
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

const TABLAS = ['profiles', 'leads', 'invite_codes', 'cjnoa_consultas'] as const;

export async function GET() {
  const res = await fetch(`${env.supabase.url}/rest/v1/`, {
    headers: {
      apikey: env.supabase.serviceRoleKey,
      Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
    },
  });
  const spec = await res.json();

  const admin = createSupabaseAdminClient() as any;
  const resultado: Record<string, unknown> = {};

  for (const tabla of TABLAS) {
    const def = spec?.definitions?.[tabla];
    const columnas = def?.properties ? Object.keys(def.properties).sort() : null;
    const { count } = await admin.from(tabla).select('*', { count: 'exact', head: true });
    resultado[tabla] = { columnas, filas: count };
  }

  return NextResponse.json(resultado);
}
