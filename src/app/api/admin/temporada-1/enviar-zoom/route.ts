import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { enviarZoom } from '@/lib/fds-temporada-email';
import { TEMPORADA_SLUG } from '@/app/fuera-de-serie/temporada-1/_data';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LOTE = 60;
const CONCURRENCIA = 5;

/**
 * POST /api/admin/temporada-1/enviar-zoom
 * Body: { zoomUrl?: string }  (si no viene, usa FDS_T1_ZOOM_URL)
 *
 * Manda el link de Zoom a los inscriptos que todavía no lo recibieron,
 * en lotes de LOTE. Devuelve cuántos quedan pendientes: el admin repite
 * la llamada hasta que `pendientes` sea 0. Solo role='admin'.
 */
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const zoomUrl = (typeof body?.zoomUrl === 'string' && body.zoomUrl.trim()) || process.env.FDS_T1_ZOOM_URL || '';
  if (!/^https:\/\/\S+$/.test(zoomUrl)) {
    return NextResponse.json({ error: 'Falta un link de Zoom válido (https://…)' }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY no está configurada' }, { status: 500 });
  }

  const { data: filas, error } = await admin
    .from('fds_temporada_registros')
    .select('id, nombre, email')
    .eq('temporada', TEMPORADA_SLUG)
    .is('zoom_enviado_at', null)
    .order('created_at', { ascending: true })
    .limit(LOTE);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let enviados = 0;
  let fallidos = 0;
  const cola = [...(filas ?? [])];
  await Promise.all(
    Array.from({ length: CONCURRENCIA }, async () => {
      for (let f = cola.shift(); f; f = cola.shift()) {
        const ok = await enviarZoom(f.email, f.nombre, zoomUrl);
        if (ok) {
          enviados++;
          await admin.from('fds_temporada_registros').update({ zoom_enviado_at: new Date().toISOString() }).eq('id', f.id);
        } else {
          fallidos++;
        }
      }
    })
  );

  const { count } = await admin
    .from('fds_temporada_registros')
    .select('id', { count: 'exact', head: true })
    .eq('temporada', TEMPORADA_SLUG)
    .is('zoom_enviado_at', null);

  return NextResponse.json({ enviados, fallidos, pendientes: count ?? 0 });
}
