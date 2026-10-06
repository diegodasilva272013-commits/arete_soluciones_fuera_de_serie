import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
  const { data, error } = await admin
    .from('frecuencia_knowledge_blocks')
    .select('clave, valor')
    .in('clave', ['reglas_dosis', 'reglas_foco', 'pasos_ante_falla'])
    .order('clave');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
