import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { zoomUrl as zoomDefault } from '@/lib/fds-temporada-email';
import { enviarZoomPendientes } from '@/lib/fds-temporada-zoom';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/admin/temporada-1/enviar-zoom
 * Body: { zoomUrl?: string }  (si no viene, usa FDS_T1_ZOOM_URL)
 *
 * Manda el link de Zoom (desde arete@aretesoluciones.space) a los inscriptos
 * que todavía no lo recibieron. Solo role='admin'.
 */
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const zoomUrl = (typeof body?.zoomUrl === 'string' && body.zoomUrl.trim()) || zoomDefault();
  if (!/^https:\/\/\S+$/.test(zoomUrl)) {
    return NextResponse.json({ error: 'Falta un link de Zoom válido (https://…)' }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY no está configurada' }, { status: 500 });
  }

  try {
    return NextResponse.json(await enviarZoomPendientes(zoomUrl));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
