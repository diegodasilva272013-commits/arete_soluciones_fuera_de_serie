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

    // "Sin asignar" pagina llamando directo a leads_sin_asignar(limit,
    // offset, status) — la misma función de siempre (migración 0056),
    // ahora con soporte de offset/status (migración 0076). Antes se
    // traían TODOS los ids a JS y se hacía .in('id', [...]) contra la
    // tabla leads: con miles de leads sin asignar esa URL supera el
    // límite que acepta PostgREST/Vercel y la query volvía vacía,
    // mientras el total mostrado seguía siendo el de toda la tabla.
    if (userId === 'unassigned') {
      const [{ data: rows, error: rpcErr }, { data: countData, error: countErr }] = await Promise.all([
        (admin as any).rpc('leads_sin_asignar', { p_limit: perPage, p_offset: from, p_status: status || null }),
        (admin as any).rpc('leads_sin_asignar_count', { p_status: status || null }),
      ]);
      if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });
      const total = countErr ? 0 : Number(countData ?? 0);
      return NextResponse.json({
        data: rows ?? [],
        total,
        page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
        has_more: to < total - 1,
      });
    }

    let query = (admin as any)
      .from('leads')
      .select('*, assignee:profiles!leads_assigned_to_user_id_fkey(id, full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (userId)   query = query.eq('assigned_to_user_id', userId);
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
