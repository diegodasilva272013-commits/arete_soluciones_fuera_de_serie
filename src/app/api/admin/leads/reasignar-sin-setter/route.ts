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

    // Misma definición de "sin asignar" que el resto del panel (función
    // leads_sin_asignar, migración 0056/0076): sin assigned_to_user_id Y
    // sin estar ya en team_leads. Se procesa en lotes de 300 ids en vez
    // de traer todos de una — con miles de leads sin asignar, un solo
    // .in('id', [...]) con todos los ids arma una URL demasiado larga
    // para PostgREST/Vercel y el update no aplicaba a nada. Cada vuelta
    // pide offset 0 porque los leads ya actualizados salen del resultado.
    const BATCH = 300;
    const nowIso = new Date().toISOString();
    let totalUpdated = 0;

    for (;;) {
      const { data: rows, error: rpcErr } = await (admin as any).rpc('leads_sin_asignar', { p_limit: BATCH, p_offset: 0 });
      if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });
      const ids = ((rows ?? []) as { id: string }[]).map(r => r.id);
      if (ids.length === 0) break;

      const { error: updErr } = await admin
        .from('leads')
        .update({ assigned_to_user_id: setter_id, assigned_at: nowIso })
        .in('id', ids);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

      totalUpdated += ids.length;
      if (ids.length < BATCH) break;
    }

    return NextResponse.json({ updated: totalUpdated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
