import type { Metadata } from 'next';
import { Hero } from './_hero';
import { Cultura } from './_cultura';
import { ReclutamientoForm } from './_form';

export const metadata: Metadata = {
  title: 'Reclutamiento — Camino al Closing',
  description: 'Sumate como Setter o Cold Caller. Compromiso real, no un currículum perfecto.',
  robots: { index: false, follow: false }, // convocatoria puntual, no queremos que quede indexada
};

export default function ReclutamientoPage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      <Hero />
      <Cultura />

      <section id="postularme" className="border-t border-[rgba(212,175,55,0.12)] bg-[#050505] py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Postulate
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
            Contanos quién sos.
          </h2>
          <p className="mt-3 text-sm text-brand-muted">
            Todos los campos marcados con * son obligatorios. El video de presentación es lo que más pesa en la decisión.
          </p>

          <div className="mt-10">
            <ReclutamientoForm />
          </div>
        </div>
      </section>
    </main>
  );
}
