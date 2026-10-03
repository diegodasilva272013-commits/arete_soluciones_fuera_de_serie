import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { enviarPrueba } from '@/lib/fds-temporada-email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** POST /api/admin/temporada-1/probar-mail — manda un mail de prueba al admin logueado. */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

  const r = await enviarPrueba(user.email);
  return NextResponse.json({ ...r, to: user.email }, { status: r.ok ? 200 : 500 });
}
