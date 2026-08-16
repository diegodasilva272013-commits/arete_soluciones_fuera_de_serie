import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getCurrentUserContext } from '@/lib/current-user';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  nuevo:             { label: 'Nuevo',           color: '#1a6fff', bg: 'rgba(26,111,255,0.12)' },
  activo:            { label: 'Activo',           color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  pausado:           { label: 'Pausado',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  llamada_agendada:  { label: 'Llamada agendada', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  cerrado_ganado:    { label: 'Cerrado ✓',        color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  cerrado_perdido:   { label: 'Cerrado ✗',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default async function ProspectosPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/login');

  const supabase = createSupabaseServerClient();
  let query = supabase
    .from('prospects')
    .select('*, profiles!assigned_to(full_name)')
    .order('created_at', { ascending: false });

  if (!ctx.isAdmin) {
    query = query.eq('assigned_to', ctx.userId);
  }

  const { data: prospects } = await query;
  const list = prospects || [];

  return (
    <div className="min-h-screen bg-brand-black p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Prospectos</h1>
            <p className="mt-1 text-sm text-brand-muted">{list.length} prospectos en total</p>
          </div>
          <Link href="/prospectos/nuevo"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1a6fff, #0f52cc)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo Prospecto
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border border-[rgba(26,111,255,0.08)] bg-[#0d0d0d]">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-brand-text mb-2">Sin prospectos aún</h3>
            <p className="text-sm text-brand-muted mb-6">
              Pegá el link de un perfil de LinkedIn y la IA hace el resto.
            </p>
            <Link href="/prospectos/nuevo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #1a6fff, #0f52cc)' }}>
              ⚡ Analizar primer prospecto
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-[rgba(26,111,255,0.12)] bg-[#0d0d0d]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(26,111,255,0.08)]">
                  {['Prospecto', 'Empresa', 'Fase', 'Estado', 'Follow-ups', 'Asignado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const badge = STATUS_BADGE[p.status] || STATUS_BADGE.nuevo;
                  const profile = p.profiles as { full_name?: string } | null;
                  return (
                    <tr key={p.id} className="border-b border-[rgba(26,111,255,0.05)] hover:bg-[rgba(26,111,255,0.03)] transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-brand-text">{p.full_name}</p>
                          <p className="text-xs text-brand-muted mt-0.5">{p.headline || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-brand-muted">{p.company || '—'}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{ background: 'rgba(26,111,255,0.1)', color: '#1a6fff' }}>
                          {p.phase}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-brand-muted tabular-nums">
                        {p.follow_up_count ?? 0} / 6
                      </td>
                      <td className="px-4 py-4 text-xs text-brand-muted">
                        {profile?.full_name || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/prospectos/${p.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium text-brand-gold border border-[rgba(26,111,255,0.2)] hover:bg-[rgba(26,111,255,0.08)] transition-colors">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
