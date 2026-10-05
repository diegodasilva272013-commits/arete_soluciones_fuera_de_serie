/**
 * TEMPORAL — lee el contenido completo de frecuencia_knowledge_blocks
 * para diseñar la UI de Fase 3 sobre la forma real de los datos. Solo
 * GET, gated por FRECUENCIA_C8_SECRET. Borrar una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
  const { data, error } = await admin.from('frecuencia_knowledge_blocks').select('clave, valor').order('clave');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
