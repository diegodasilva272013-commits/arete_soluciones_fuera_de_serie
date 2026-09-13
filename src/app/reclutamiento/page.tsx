import type { Metadata } from 'next';
import { Hero } from './_hero';
import { Cultura } from './_cultura';
import { ReclutamientoForm } from './_form';
import c from '../empresa/corp.module.css';

export const metadata: Metadata = {
  title: 'Reclutamiento — Areté',
  description: 'Sumate como Setter o Cold Caller. Compromiso real, no un currículum perfecto.',
  robots: { index: false, follow: false },
};

export default function ReclutamientoPage() {
  return (
    <main style={{ background: '#050505', minHeight: '100vh' }}>
      <Hero />
      <Cultura />

      {/* Sección formulario */}
      <section id="postularme" className={c.section}>
        <div className={c.inner} style={{ maxWidth: '760px' }}>
          <div className={c.sectionLockup}>
            <span className={c.mono}>Postulate</span>
            <h2 className={c.sectionTitle}>Contanos quién sos.</h2>
            <p className={c.sectionSub}>
              Todos los campos marcados con * son obligatorios.
              El video de presentación es lo que más pesa en la decisión.
            </p>
          </div>

          <ReclutamientoForm />
        </div>
      </section>
    </main>
  );
}
