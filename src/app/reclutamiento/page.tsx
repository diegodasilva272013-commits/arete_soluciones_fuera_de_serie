import type { Metadata } from 'next';
import { Hero } from './_hero';
import { Cultura } from './_cultura';
import { ReclutamientoForm } from './_form';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

export const metadata: Metadata = {
  title: 'Unirse al equipo',
  description: 'Buscamos setters y cold callers con compromiso real. Sin excusas, todos los días.',
  robots: { index: false, follow: false },

  // OG explícito para que WhatsApp/iMessage no hereden el título del layout raíz
  openGraph: {
    type: 'website',
    url: 'https://arete-soluciones-plataforma.vercel.app/reclutamiento',
    siteName: 'Areté Soluciones',
    title: 'Unirse al equipo — Areté Soluciones',
    description: 'Buscamos setters y cold callers que ejecuten todos los días. Postulate y mostranos quién sos.',
    locale: 'es_AR',
    images: [
      {
        url: 'https://arete-soluciones-plataforma.vercel.app/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Reclutamiento — Areté Soluciones',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unirse al equipo — Areté Soluciones',
    description: 'Buscamos setters y cold callers que ejecuten todos los días.',
    images: ['https://arete-soluciones-plataforma.vercel.app/opengraph-image'],
  },
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
