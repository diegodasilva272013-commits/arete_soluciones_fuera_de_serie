import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { PostulanteCard, type Postulante } from './_postulante-card';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL = 60 * 30; // 30 min — se regeneran en cada carga de la página

export default async function ReclutamientoAdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data: rows } = await admin
    .from('reclutamiento_postulantes')
    .select('*')
    .order('created_at', { ascending: false });

  const postulantes: Postulante[] = await Promise.all(
    (rows ?? []).map(async (r: any) => {
      let fotoUrl: string | null = null;
      let videoUrl: string | null = null;
      if (r.foto_path) {
        const { data } = await admin.storage.from('reclutamiento-fotos').createSignedUrl(r.foto_path, SIGNED_URL_TTL);
        fotoUrl = data?.signedUrl ?? null;
      }
      if (r.video_path) {
        const { data } = await admin.storage.from('reclutamiento-videos').createSignedUrl(r.video_path, SIGNED_URL_TTL);
        videoUrl = data?.signedUrl ?? null;
      }
      return {
        id: r.id,
        created_at: r.created_at,
        nombre: r.nombre,
        apellido: r.apellido,
        email: r.email,
        edad: r.edad,
        experiencia: r.experiencia,
        motivo: r.motivo,
        motivacion: r.motivacion,
        estado: r.estado,
        notas_admin: r.notas_admin,
        fotoUrl,
        videoUrl,
        video_completado: r.video_completado ?? false,
      };
    })
  );

  const nuevos = postulantes.filter((p) => p.estado === 'nuevo').length;

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 lg:px-8">
      <PageHeader
        eyebrow="Admin · Reclutamiento"
        title="Postulantes"
        description={`${postulantes.length} postulaciones · ${nuevos} sin revisar`}
      />

      <div className="mt-6 space-y-3">
        {postulantes.length === 0 && (
          <p className="text-sm text-brand-muted">Todavía no hay postulaciones.</p>
        )}
        {postulantes.map((p) => (
          <PostulanteCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
