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
  const accion = req.nextUrl.searchParams.get('accion');

  if (accion === 'probar_asignacion') {
    const DANI_ID = 'a307ce08-b601-478b-ad95-b5102d11696a';
    const { data: sinAsignar, error: rpcErr } = await admin.rpc('leads_sin_asignar', { p_limit: 1 });
    if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    const lead = sinAsignar?.[0];
    if (!lead) return NextResponse.json({ error: 'no hay leads sin asignar para probar' }, { status: 404 });

    const { error: updErr } = await admin
      .from('leads')
      .update({ assigned_to_user_id: DANI_ID, assigned_at: new Date().toISOString() })
      .eq('id', lead.id);
    if (updErr) return NextResponse.json({ error: updErr.message, lead }, { status: 500 });

    const { data: relectura } = await admin
      .from('leads')
      .select('id, first_name, last_name, assigned_to_user_id, assigned_at')
      .eq('id', lead.id)
      .single();

    return NextResponse.json({ intentado: lead, releido: relectura, coincide: relectura?.assigned_to_user_id === DANI_ID });
  }

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
