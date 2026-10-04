/**
 * TEMPORAL — diagnóstico de causa raíz del acceso a Frecuencia.
 * Sin datos sensibles (no expone filas de usuarios, solo si la tabla
 * knowledge_blocks existe y qué devuelve la config). Borrar apenas se
 * confirme el diagnóstico.
 */
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { getFrecuenciaRolesHabilitados } from '@/lib/frecuencia-access';

export async function GET() {
  const admin = createSupabaseAdminClient() as any;

  const { data, error } = await admin
    .from('knowledge_blocks')
    .select('clave, valor')
    .eq('clave', 'frecuencia_roles_habilitados')
    .maybeSingle();

  const resuelto = await getFrecuenciaRolesHabilitados();

  return NextResponse.json({
    tabla_knowledge_blocks_query: {
      data,
      error: error ? { message: error.message, code: error.code, details: error.details } : null,
    },
    roles_habilitados_resueltos_por_el_helper: resuelto,
  });
}
