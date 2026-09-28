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

    // Si no se pasaron IDs pero sí quantity, tomar leads sin asignar — misma
    // definición que el resto del panel (migración 0056): sin
    // assigned_to_user_id Y sin estar ya en team_leads. Antes solo miraba
    // assigned_to_user_id IS NULL, podía tomar leads ya repartidos a una
    // dupla y asignarlos por encima a otro setter.
    if (!ids.length && quantity && target_user_id) {
      // La función devuelve por created_at DESC (más nuevos primero); acá se
      // quiere lo contrario, el orden original: los más viejos primero,
      // así que se trae todo y se reordena antes de cortar por cantidad.
      const { data: rows } = await (admin as any).rpc('leads_sin_asignar', { p_limit: 0 });
      ids = ((rows ?? []) as { id: string; created_at: string }[])
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .slice(0, quantity)
        .map((l) => l.id);
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
