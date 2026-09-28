import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST { setter_id: string } → asigna TODOS los leads sin setter a ese setter
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { setter_id } = await req.json();
    if (!setter_id) return NextResponse.json({ error: 'setter_id requerido' }, { status: 400 });

    // Misma definición de "sin asignar" que el resto del panel (migración
    // 0056): sin assigned_to_user_id Y sin estar ya en team_leads. Antes
    // este endpoint solo miraba assigned_to_user_id IS NULL, así que podía
    // reasignar leads que en realidad ya estaban repartidos a una dupla.
    const { data: rows } = await (admin as any).rpc('leads_sin_asignar', { p_limit: 0 });
    const ids = ((rows ?? []) as { id: string }[]).map(r => r.id);
    if (ids.length === 0) return NextResponse.json({ updated: 0 });

    const nowIso = new Date().toISOString();
    const { data, error } = await admin
      .from('leads')
      .update({ assigned_to_user_id: setter_id, assigned_at: nowIso })
      .in('id', ids)
      .select('id');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ updated: data?.length ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
