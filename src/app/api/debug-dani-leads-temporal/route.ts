/**
 * TEMPORAL — diagnóstico: perfiles admin y sus leads asignados, para
 * encontrar por qué Dani no ve sus leads en "Mis Leads". Gated por
 * FRECUENCIA_C8_SECRET (reuso el mismo secreto ya configurado en
 * Vercel). Borrar una vez resuelto.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createSupabaseAdminClient() as any;

  const { data: admins } = await admin
    .from('profiles')
    .select('id, full_name, email, role, bloqueado, onboarding_completed')
    .ilike('full_name', '%dani%');

  const resultado = [];
  for (const perfil of admins ?? []) {
    const { count: totalAsignados } = await admin
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to_user_id', perfil.id);

    const { data: muestra } = await admin
      .from('leads')
      .select('id, first_name, last_name, assigned_to_user_id, assigned_at, current_status, is_closed')
      .eq('assigned_to_user_id', perfil.id)
      .order('assigned_at', { ascending: false })
      .limit(5);

    resultado.push({ perfil, totalAsignados, muestra });
  }

  // Por si el nombre no matchea "dani", traer también todos los admins.
  const { data: todosLosAdmins } = await admin
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'admin');

  return NextResponse.json({ porNombre: resultado, todosLosAdmins });
}
