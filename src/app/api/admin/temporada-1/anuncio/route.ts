import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { hayEnvioConfigurado } from '@/lib/fds-temporada-email';
import { enviarAnuncioATodos } from '@/lib/fds-temporada-zoom';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/admin/temporada-1/anuncio
 * Body: { url: string; asunto: string; intro: string }
 *
 * Manda un mail con un link (la próxima clase, un aviso, etc.) a TODOS
 * los inscriptos de la Temporada 1, hayan recibido algo antes o no.
 * Solo role='admin'.
 */
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  const asunto = typeof body?.asunto === 'string' ? body.asunto.trim() : '';
  const intro = typeof body?.intro === 'string' ? body.intro.trim() : '';

  if (!/^https:\/\/\S+$/.test(url)) {
    return NextResponse.json({ error: 'Falta un link válido (https://…)' }, { status: 400 });
  }
  if (!asunto) return NextResponse.json({ error: 'Falta el asunto del mail' }, { status: 400 });
  if (!intro) return NextResponse.json({ error: 'Falta el texto del mail' }, { status: 400 });
  if (!hayEnvioConfigurado()) {
    return NextResponse.json({ error: 'Falta SMTP_PASS (Hostinger) o RESEND_API_KEY' }, { status: 500 });
  }

  try {
    return NextResponse.json(await enviarAnuncioATodos({ asunto, intro, url }));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
