import type { Metadata } from 'next';
import Image from 'next/image';
import { Hero } from './_hero';
import { Cultura } from './_cultura';
import { ReclutamientoForm } from './_form';
import { NeonMesh } from '@/components/ui/neon-mesh';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

export const metadata: Metadata = {
  title: 'Unirse al equipo',
  description: 'Buscamos setters y cold callers con compromiso real. Sin excusas, todos los días.',
  robots: { index: false, follow: false },

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

      {/* ── Sección formulario ── */}
      <section id="postularme" className={s.formSection}>

        {/*
         * Capas de fondo (de atrás hacia adelante):
         *   z-index 0 — NeonMesh (siempre visible, tapa todo el section)
         *   z-index 1 — Video (encima del mesh)
         *     desktop: cubre TODO el section → mesh queda oculto
         *     mobile:  cubre solo los primeros 50vh → mesh visible debajo
         *   z-index 2 — Contenido (form card)
         */}

        {/* Capa 0: NeonMesh de fondo */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <NeonMesh />
        </div>

        {/* Capa 1: Video */}
        <div className={s.formVideoBg}>
          <div className={s.formVideoOverlay} />
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video autoPlay muted loop playsInline className={s.formVideoEl}>
            <source src="/video_2.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Capa 2: Contenido */}
        <div className={`${c.inner} ${s.formContent}`} style={{ maxWidth: '780px' }}>
          <div className={c.sectionLockup}>
            <span className={c.mono} style={{ color: 'rgba(242,239,233,.5)' }}>Postulate</span>
            <h2 className={c.sectionTitle}>Contanos quién sos.</h2>
            <p className={c.sectionSub}>
              Todos los campos marcados con * son obligatorios.
              El video de presentación es lo que más pesa en la decisión.
            </p>
          </div>

          <div className={s.formCard}>
            <ReclutamientoForm />
          </div>
        </div>
      </section>

      {/* ── Footer minimal reclutamiento ── */}
      <footer style={{
        borderTop: '1px solid rgba(242,239,233,.07)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        background: '#050505',
      }}>
        <Image
          src="/LOGO_ARETE.png"
          alt="Areté Soluciones"
          width={36}
          height={36}
          style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: '50%', opacity: 0.7 }}
        />
        <p style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(242,239,233,.3)',
          margin: 0,
          textAlign: 'center',
        }}>
          © {new Date().getFullYear()} Areté Soluciones · Buenos Aires, Argentina
        </p>
      </footer>
    </main>
  );
}
