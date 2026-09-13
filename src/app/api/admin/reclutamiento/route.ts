import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/reclutamiento
 * Devuelve todos los postulantes. Solo accesible para usuarios con role='admin'.
 */
export async function GET() {
  // Verificar sesión del usuario logueado
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  // Verificar role admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  // Traer todos los postulantes con admin client (bypassa RLS)
  const admin = createSupabaseAdminClient() as any;
  const { data, error } = await admin
    .from('reclutamiento_postulantes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generar signed URLs para foto y video (72h de validez)
  const enriched = await Promise.all(
    (data ?? []).map(async (p: any) => {
      let foto_url: string | null = null;
      let video_url: string | null = null;

      if (p.foto_path) {
        const { data: su } = await admin.storage
          .from('reclutamiento-fotos')
          .createSignedUrl(p.foto_path, 72 * 3600);
        foto_url = su?.signedUrl ?? null;
      }
      if (p.video_path) {
        const { data: su } = await admin.storage
          .from('reclutamiento-videos')
          .createSignedUrl(p.video_path, 72 * 3600);
        video_url = su?.signedUrl ?? null;
      }

      return { ...p, foto_url, video_url };
    })
  );

  return NextResponse.json(enriched);
}
