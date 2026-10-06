/**
 * TEMPORAL — lee frecuencia_knowledge_blocks completo para diseñar la
 * Fase 4 sobre los valores numéricos reales que cargó Diego. Solo GET,
 * gated por FRECUENCIA_C8_SECRET. Borrar una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createSupabaseAdminClient() as any;
  const { data, error } = await admin.from('frecuencia_knowledge_blocks').select('clave, valor').order('clave');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
