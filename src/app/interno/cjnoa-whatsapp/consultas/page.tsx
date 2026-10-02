import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { hasValidCJNoaSession } from '@/lib/cjnoa-access';
import { CJNoaAccessGate } from '../access-gate';

// Misma protección que /interno/cjnoa-whatsapp (contraseña propia,
// nada que ver con el login de la plataforma) — no indexar.
export const metadata: Metadata = {
  title: 'Consultas — CJ NOA | Areté Soluciones',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

function fmtDate(d: string) {
  return new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function CJNoaConsultasPage() {
  const hasAccess = await hasValidCJNoaSession();
  if (!hasAccess) {
    return <CJNoaAccessGate />;
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const { data: consultas } = await supabase
    .from('cjnoa_consultas')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-svh bg-[#050505] px-6 py-10 text-[#F2EFE9] md:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F7BF6]">
        Areté Soluciones · Centro Jurídico NOA
      </p>
      <h1 className="mt-3 text-2xl font-semibold md:text-3xl">Consultas recibidas</h1>
      <p className="mt-2 text-sm text-[#8A8A8A]">
        {consultas?.length ?? 0} consultas guardadas — cada mensaje que el agente procesa por WhatsApp.
      </p>

      <div className="mt-8 overflow-x-auto border border-[#8A8A8A]/20">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-[#8A8A8A]/20">
              {['Fecha', 'Nombre', 'Teléfono', 'Rama', 'Mensaje', 'Resumen', 'Turno'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#2F7BF6]/70">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8A8A8A]/10">
            {(consultas ?? []).map((c: any) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[#8A8A8A]">
                  {c.created_at ? fmtDate(c.created_at) : '—'}
                </td>
                <td className="px-4 py-3 font-medium">{c.nombre_consultante ?? '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-[#8A8A8A]">{c.telefono ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-[#8A8A8A]">{c.rama_consulta ?? '—'}</td>
                <td className="max-w-[260px] px-4 py-3 text-xs text-[#8A8A8A]">{c.mensaje ?? '—'}</td>
                <td className="max-w-[260px] px-4 py-3 text-xs text-[#8A8A8A]">{c.resumen ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-[#8A8A8A]">
                  {c.requiere_turno === true ? 'Sí' : c.requiere_turno === false ? 'No' : '—'}
                </td>
              </tr>
            ))}
            {(!consultas || consultas.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#8A8A8A]">
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
