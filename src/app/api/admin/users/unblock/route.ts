import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return admin;
}

// POST — desbloquea un setter sin tocar ningún dato
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const [profileRes, authRes] = await Promise.all([
    admin.from('profiles').update({
      bloqueado: false,
      bloqueado_at: null,
      bloqueado_motivo: null,
    }).eq('id', id),
    admin.auth.admin.updateUserById(id, {
      user_metadata: { bloqueado: false },
    }),
  ]);

  if (profileRes.error) return NextResponse.json({ error: profileRes.error.message }, { status: 500 });
  if (authRes.error)    return NextResponse.json({ error: authRes.error.message },    { status: 500 });

  return NextResponse.json({ ok: true });
}
