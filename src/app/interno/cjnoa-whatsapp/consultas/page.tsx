import type { Metadata } from 'next';
import { hasValidCJNoaSession } from '@/lib/cjnoa-access';
import { CJNoaAccessGate } from '../access-gate';
import { fetchCJNoaConsultas } from './actions';
import { CJNoaConsultasView } from './consultas-view';

// Misma protección que /interno/cjnoa-whatsapp (contraseña propia,
// nada que ver con el login de la plataforma) — no indexar.
export const metadata: Metadata = {
  title: 'Consultas — CJ NOA | Areté Soluciones',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

export default async function CJNoaConsultasPage() {
  const hasAccess = await hasValidCJNoaSession();
  if (!hasAccess) {
    return <CJNoaAccessGate />;
  }

  const consultas = await fetchCJNoaConsultas();

  return (
    <div className="min-h-svh bg-[#050505] px-4 py-6 text-[#F2EFE9] md:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F7BF6]">
        Areté Soluciones · Centro Jurídico NOA
      </p>
      <h1 className="mt-2 mb-5 text-xl font-semibold md:text-2xl">Consultas recibidas</h1>
      <CJNoaConsultasView initial={consultas} />
    </div>
  );
}
