import type { Metadata } from 'next';
import { Hero } from './_hero';
import { Cultura } from './_cultura';
import { ReclutamientoForm } from './_form';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

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

      {/* ── Sección formulario con video de fondo igual a /acceso ── */}
      <section id="postularme" className={s.formSection}>

        {/* Video fondo */}
        <div className={s.formVideoBg}>
          <div className={s.formVideoOverlay} />
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className={s.formVideoEl}
          >
            <source src="/video_2.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Contenido */}
        <div className={`${c.inner} ${s.formContent}`} style={{ maxWidth: '780px' }}>
          <div className={c.sectionLockup}>
            <span className={c.mono} style={{ color: 'rgba(242,239,233,.5)' }}>Postulate</span>
            <h2 className={c.sectionTitle}>Contanos quién sos.</h2>
            <p className={c.sectionSub}>
              Todos los campos marcados con * son obligatorios.
              El video de presentación es lo que más pesa en la decisión.
            </p>
          </div>

          {/* Card glassmorphism igual a /acceso */}
          <div className={s.formCard}>
            <ReclutamientoForm />
          </div>
        </div>
      </section>
    </main>
  );
}
