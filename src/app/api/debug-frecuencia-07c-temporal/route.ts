/**
 * TEMPORAL — evidencia 0.7c "después": columnas y filas de profiles,
 * leads, invite_codes y cjnoa_consultas, para comparar contra el
 * "antes" (0.7a) y confirmar que la migración 0078 no las tocó.
 * Antes: profiles 28 cols/28 filas, leads 23 cols/10386 filas,
 * invite_codes 7 cols/1 fila, cjnoa_consultas 15 cols/14 filas.
 * Solo GET, gated por FRECUENCIA_C8_SECRET. Borrar una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const TABLAS = ['profiles', 'leads', 'invite_codes', 'cjnoa_consultas'] as const;

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  const specRes = await fetch(`${env.supabase.url}/rest/v1/`, {
    headers: { apikey: env.supabase.serviceRoleKey, Authorization: `Bearer ${env.supabase.serviceRoleKey}` },
  });
  const spec = await specRes.json();

  const resultado: Record<string, { columnas: number; filas: number | null; error?: string }> = {};

  for (const tabla of TABLAS) {
    const def = spec?.definitions?.[tabla];
    const columnas = def?.properties ? Object.keys(def.properties).length : -1;

    const { count, error } = await admin.from(tabla).select('*', { count: 'exact', head: true });
    resultado[tabla] = { columnas, filas: count ?? null, error: error?.message };
  }

  return NextResponse.json(resultado);
}
