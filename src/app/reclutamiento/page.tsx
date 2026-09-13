import type { Metadata } from 'next';
import { Hero } from './_hero';
import { Cultura } from './_cultura';
import { ReclutamientoForm } from './_form';
import s from './recl.module.css';

export const metadata: Metadata = {
  title: 'Reclutamiento — Camino al Closing',
  description: 'Sumate como Setter o Cold Caller. Compromiso real, no un currículum perfecto.',
  robots: { index: false, follow: false }, // convocatoria puntual, no queremos que quede indexada
};

export default function ReclutamientoPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050505' }}>
      <Hero />
      <Cultura />

      <section id="postularme" className={s.formSection}>
        <div className={`${s.innerNarrow} ${s.formInner}`}>
          <div className={s.shead}>
            <p className={s.mono}>Postulate</p>
            <h2>Contanos quién sos.</h2>
            <p>
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
