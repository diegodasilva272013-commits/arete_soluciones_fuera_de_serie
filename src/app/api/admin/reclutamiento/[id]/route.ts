import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ESTADOS = ['nuevo', 'revisando', 'entrevista', 'aceptado', 'rechazado'];

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient() as any;
  const { data: p } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return p?.role === 'admin' ? { admin, userId: user.id } : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { estado, notas_admin } = await req.json().catch(() => ({})) as
    { estado?: string; notas_admin?: string };

  const patch: Record<string, unknown> = {};
  if (estado !== undefined) {
    if (!ESTADOS.includes(estado)) return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    patch.estado = estado;
    patch.reviewed_by = ctx.userId;
    patch.reviewed_at = new Date().toISOString();
  }
  if (notas_admin !== undefined) patch.notas_admin = notas_admin;

  const { error } = await ctx.admin
    .from('reclutamiento_postulantes')
    .update(patch)
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
