import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function requireAdmin(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

const DEFAULT_PER_PAGE = 200;
const MAX_PER_PAGE = 500;

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const user = await requireAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { searchParams } = req.nextUrl;
    const userId   = searchParams.get('user_id');
    const status   = searchParams.get('status');
    const batchId  = searchParams.get('batch_id');
    const source   = searchParams.get('source');
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const perPage  = Math.min(MAX_PER_PAGE, Math.max(1, parseInt(searchParams.get('per_page') ?? String(DEFAULT_PER_PAGE), 10)));
    const from     = (page - 1) * perPage;
    const to       = from + perPage - 1;

    let query = (admin as any)
      .from('leads')
      .select('*, assignee:profiles!leads_assigned_to_user_id_fkey(id, full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (userId === 'unassigned') {
      // "Sin asignar" tiene que ser LA MISMA definición en todos lados: sin
      // assigned_to_user_id Y sin estar ya repartido a una dupla (team_leads).
      // Antes esto solo miraba assigned_to_user_id IS NULL, distinto de la
      // función leads_sin_asignar() (migración 0056) que ya usa el resto de
      // la app — dos criterios distintos para "lo mismo" daban números que
      // no coincidían entre pantallas.
      const { data: rows } = await (admin as any).rpc('leads_sin_asignar', { p_limit: 0 });
      const ids = (rows ?? []).map((r: any) => r.id);
      query = query.in('id', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000']);
    }
    else if (userId) query = query.eq('assigned_to_user_id', userId);
    if (status)  query = query.eq('current_status', status);
    if (batchId) query = query.eq('batch_id', batchId);
    if (source)  query = query.eq('source', source);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const total = count ?? 0;
    return NextResponse.json({
      data: data ?? [],
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
      has_more: to < total - 1,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
