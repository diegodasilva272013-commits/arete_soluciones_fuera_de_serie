import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admin' }, { status: 403 });

    const body = await req.json();
    const updates: Record<string, any> = {};

    if (body.status !== undefined)       updates.status       = body.status;
    if (body.notes  !== undefined)       updates.notes        = body.notes;
    if (body.scheduled_at !== undefined) updates.scheduled_at = body.scheduled_at;

    // Auto-set completed_at when marking complete
    if (body.status === 'completed' && !body.completed_at) {
      updates.completed_at = new Date().toISOString();
    } else if (body.completed_at !== undefined) {
      updates.completed_at = body.completed_at;
    }

    const { data, error } = await admin.from('course_sessions')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admin' }, { status: 403 });

    await admin.from('course_sessions').delete().eq('id', params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
