import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admin' }, { status: 403 });

    const url    = new URL(req.url);
    const month  = url.searchParams.get('month'); // YYYY-MM

    let query = admin.from('course_sessions')
      .select('id, module_id, student_id, scheduled_at, completed_at, status, notes, created_at, modules(id, title, course_id, courses(id,title)), student:student_id(id, full_name, avatar_url)')
      .order('scheduled_at', { ascending: true });

    if (month) {
      const from = `${month}-01T00:00:00Z`;
      const to   = new Date(new Date(from).setMonth(new Date(from).getMonth() + 1)).toISOString();
      query = query.gte('scheduled_at', from).lt('scheduled_at', to);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admin' }, { status: 403 });

    const body = await req.json();
    const { module_id, student_id, scheduled_at, notes } = body;
    if (!module_id || !student_id || !scheduled_at) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data, error } = await admin.from('course_sessions').insert({
      module_id, student_id, scheduled_at, notes: notes ?? null,
      created_by: user.id,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
