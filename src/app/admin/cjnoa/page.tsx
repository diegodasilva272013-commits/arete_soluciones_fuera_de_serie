import { PageHeader } from '@/components/layout/page-header';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function fmtDate(d: string) {
  return new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function CJNoaAdminPage() {
  // cjnoa_consultas es una tabla nueva, todavía no está en los tipos
  // generados de Supabase (mismo patrón que reclutamiento/page.tsx).
  const admin = createSupabaseAdminClient() as any;
  const { data: consultas } = await admin
    .from('cjnoa_consultas')
    .select('*')
    .order('created_at', { ascending: false });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();
  const newToday = (consultas ?? []).filter((c: any) => c.created_at >= todayIso).length;

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 lg:px-8">
      <PageHeader
        eyebrow="Admin · Centro Jurídico NOA"
        title="Consultas recibidas"
        description={`${consultas?.length ?? 0} consultas · ${newToday} hoy — cada mensaje que el agente procesa por WhatsApp o por el chat de prueba`}
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0d0d0d]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-[rgba(212,175,55,0.08)]">
              {['Fecha', 'Nombre', 'Teléfono', 'Rama', 'Mensaje', 'Resumen', 'Turno'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-brand-gold/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(212,175,55,0.05)]">
            {(consultas ?? []).map((c: any) => {
              const isNew = c.created_at >= todayIso;
              return (
                <tr key={c.id} className={isNew ? 'bg-[rgba(212,175,55,0.04)]' : 'hover:bg-[rgba(212,175,55,0.02)]'}>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-muted">
                    {c.created_at ? fmtDate(c.created_at) : '—'}
                    {isNew && (
                      <span className="ml-2 rounded-full bg-brand-gold/20 border border-brand-gold/40 px-1.5 py-0.5 text-[10px] text-brand-gold">
                        Hoy
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-text">{c.nombre_consultante ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-muted">{c.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-brand-muted">{c.rama_consulta ?? '—'}</td>
                  <td className="max-w-[260px] px-4 py-3 text-xs text-brand-muted">{c.mensaje ?? '—'}</td>
                  <td className="max-w-[260px] px-4 py-3 text-xs text-brand-muted">{c.resumen ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-brand-muted">
                    {c.requiere_turno === true ? 'Sí' : c.requiere_turno === false ? 'No' : '—'}
                  </td>
                </tr>
              );
            })}
            {(!consultas || consultas.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-brand-muted">
                  Todavía no llegó ninguna consulta.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
