import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { TEMPORADA_SLUG } from '@/app/fuera-de-serie/temporada-1/_data';
import { EnviarZoom } from './_enviar-zoom';
import { EnviarAnuncio } from './_enviar-anuncio';
import { zoomUrl } from '@/lib/fds-temporada-email';

export const dynamic = 'force-dynamic';

type Registro = {
  id: string;
  created_at: string;
  nombre: string;
  apellido: string;
  edad: number | null;
  email: string;
  telefono: string;
  motivo: string;
  zoom_enviado_at: string | null;
};

export default async function Temporada1AdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const { data } = await admin
    .from('fds_temporada_registros')
    .select('*')
    .eq('temporada', TEMPORADA_SLUG)
    .order('created_at', { ascending: false });
  const registros = (data ?? []) as Registro[];
  const pendientes = registros.filter((r) => !r.zoom_enviado_at).length;

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 lg:px-8">
      <PageHeader
        eyebrow="Admin · Fuera de Serie"
        title="Temporada 1 · Inscriptos"
        description={`${registros.length} inscriptos · ${pendientes} sin link de Zoom`}
        actions={<EnviarZoom pendientes={pendientes} zoomDefault={zoomUrl()} />}
      />

      <EnviarAnuncio total={registros.length} />

      {registros.length === 0 ? (
        <p className="text-sm text-brand-muted">Todavía no hay inscriptos.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-white/5 text-[11px] uppercase tracking-[0.15em] text-white/50">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Edad</th>
                <th className="px-4 py-3">Mail</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Qué espera de las clases</th>
                <th className="px-4 py-3">Zoom</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-t border-white/5 align-top">
                  <td className="px-4 py-3 text-white">
                    {r.nombre} {r.apellido}
                    <div className="text-xs text-white/40">{new Date(r.created_at).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.edad ?? '—'}</td>
                  <td className="px-4 py-3 text-white/70">{r.email}</td>
                  <td className="px-4 py-3 text-white/70">{r.telefono}</td>
                  <td className="max-w-[360px] px-4 py-3 text-white/70">{r.motivo}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.zoom_enviado_at
                      ? <span className="text-emerald-400">Enviado</span>
                      : <span className="text-amber-400">Pendiente</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
