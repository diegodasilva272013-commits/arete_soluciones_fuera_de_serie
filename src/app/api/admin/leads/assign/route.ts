import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json() as {
      target_user_id: string | null;   // null = desasignar
      lead_ids?: string[];
      quantity?: number;
    };

    const { target_user_id, lead_ids, quantity } = body;

    // target_user_id puede ser null (desasignar) o un UUID (asignar)
    // solo rechazamos si no viene el campo en absoluto
    if (!('target_user_id' in body)) {
      return NextResponse.json({ error: 'target_user_id requerido' }, { status: 400 });
    }

    let ids = lead_ids ?? [];

    // Si no se pasaron IDs pero sí quantity, tomar leads sin asignar
    if (!ids.length && quantity && target_user_id) {
      const { data: unassigned } = await admin
        .from('leads')
        .select('id')
        .is('assigned_to_user_id', null)
        .order('created_at', { ascending: true })
        .limit(quantity);
      ids = (unassigned ?? []).map((l) => l.id);
    }

    if (!ids.length) {
      return NextResponse.json({ error: 'Sin leads para operar' }, { status: 400 });
    }

    // Desasignar
    if (target_user_id === null) {
      const { error } = await admin
        .from('leads')
        .update({
          assigned_to_user_id: null,
          assigned_at: null,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ assigned: 0, unassigned: ids.length });
    }

    // Asignar a setter — aviso si ya tiene pendientes
    const { count: pending } = await admin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to_user_id', target_user_id)
      .eq('is_closed', false);

    const { error } = await admin
      .from('leads')
      .update({
        assigned_to_user_id: target_user_id,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      assigned: ids.length,
      pending_warning: (pending ?? 0) > 0
        ? `Este usuario tiene ${pending} leads pendientes sin gestionar.`
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
