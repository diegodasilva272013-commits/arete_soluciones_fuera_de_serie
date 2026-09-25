import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';
import { RevealObserver } from '@/app/empresa/_reveal';
import { waUrl, WA_MSG_GENERAL } from '@/app/empresa/_content';
import { SEO_FDS, SITE_URL } from '@/app/empresa/_seo';

export const metadata: Metadata = {
  title: SEO_FDS.incorporarEquipo.title,
  description: SEO_FDS.incorporarEquipo.description,
  alternates: { canonical: SEO_FDS.incorporarEquipo.canonical },
  robots: { index: false, follow: true },
  openGraph: {
    title: SEO_FDS.incorporarEquipo.title,
    description: SEO_FDS.incorporarEquipo.description,
    url: SEO_FDS.incorporarEquipo.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_FDS.incorporarEquipo.title,
    description: SEO_FDS.incorporarEquipo.description,
  },
};

const WA = waUrl(WA_MSG_GENERAL);

// TODO(Diego): esta línea todavía no tiene proceso de selección, plazos
// ni modelo de pricing definidos — la página sigue en robots:noindex
// hasta que confirmes esos datos. El FAQ de abajo solo incluye lo que
// ya está confirmado en el método Fuera de Serie; no se inventó nada.
const FAQ = [
  {
    q: '¿Qué significa que un candidato esté "formado con el método Areté"?',
    a: 'Que pasó por el proceso de entrenamiento de Fuera de Serie: diagnóstico de conversaciones reales, corrección con evidencia y evaluación por criterio, no solo por técnica de venta memorizada.',
  },
  {
    q: '¿Cómo se evalúa a un candidato antes de recomendarlo?',
    a: 'Sobre conversaciones reales, no sobre una entrevista tradicional o un currículum. El objetivo es ver cómo la persona diagnostica una situación y decide qué corresponde hacer.',
  },
  {
    q: '¿Esta línea reemplaza a un proceso de selección propio de mi empresa?',
    a: 'No necesariamente. Podés usarla como una fuente adicional de candidatos ya evaluados, o coordinar con nosotros cómo se integra a tu propio proceso de selección.',
  },
];

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Incorporar Equipo Comercial',
  description: SEO_FDS.incorporarEquipo.description,
  provider: { '@type': 'Organization', name: 'Areté Fuera de Serie', url: SITE_URL },
  areaServed: 'AR',
  serviceType: 'Búsqueda y selección de personal comercial',
  url: SEO_FDS.incorporarEquipo.canonical,
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/empresa` },
    { '@type': 'ListItem', position: 2, name: 'Fuera de Serie', item: SEO_FDS.hub.canonical },
    { '@type': 'ListItem', position: 3, name: 'Incorporar Equipo Comercial', item: SEO_FDS.incorporarEquipo.canonical },
  ],
};

export default function IncorporarEquipoComercialPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Fuera de Serie · Búsqueda y selección</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            {SEO_FDS.incorporarEquipo.h1.split(' a tu')[0]}<br />
            <em>a tu equipo.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Sumá a tu empresa personas formadas con el método Areté, evaluadas sobre conversaciones reales. No candidatos con CV: personas con criterio demostrado.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar disponibilidad <ArrowRight size={14} />
            </a>
            <Link href="/fuera-de-serie" className={s.btnGhost}>
              Ver todas las líneas
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRÓXIMAMENTE ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 640 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 20 }}>En preparación</p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'rgba(242,239,233,0.55)' }}>
              Estamos preparando el detalle completo de esta línea. Si tenés una necesidad concreta de incorporar comerciales capacitados a tu empresa, escribinos y hablamos directamente.
            </p>
            <div style={{ marginTop: 36 }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Consultar disponibilidad <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Preguntas frecuentes</p>
            <h2 className={s.sectionTitle}>Lo que ya podemos contarte</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 780 }}>
            {FAQ.map(f => (
              <div
                key={f.q}
                className={`${s.reveal}`}
                data-reveal=""
                style={{ padding: '28px 0', borderTop: '1px solid rgba(242,239,233,0.07)' }}
              >
                <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16, color: '#f2efe9' }}>{f.q}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: 'rgba(242,239,233,0.55)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELACIONADO ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <p className={s.kickerLabel} style={{ marginBottom: 20 }}>Otras líneas de Fuera de Serie</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/fuera-de-serie/capacitacion-equipos-de-venta" className={s.btnGhost}>Capacitación de Equipos</Link>
            <Link href="/fuera-de-serie/programa-venta-consultiva" className={s.btnGhost}>Programa de Venta Consultiva</Link>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Necesitás incorporar<br /><em>comerciales ahora?</em></h2>
            <p className={s.ctaSub}>Contactanos y te contamos qué candidatos tenemos disponibles.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/fuera-de-serie" className={s.btnGhost}>
                Ver otras líneas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
