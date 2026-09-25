import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';
import { RevealObserver } from '@/app/empresa/_reveal';
import { waUrl, WA_MSG_GENERAL } from '@/app/empresa/_content';
import { SEO_FDS } from '@/app/empresa/_seo';

export const metadata: Metadata = {
  title: { absolute: SEO_FDS.hub.title },
  description: SEO_FDS.hub.description,
  alternates: { canonical: SEO_FDS.hub.canonical },
  openGraph: {
    title: SEO_FDS.hub.title,
    description: SEO_FDS.hub.description,
    url: SEO_FDS.hub.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_FDS.hub.title,
    description: SEO_FDS.hub.description,
  },
};

const WA = waUrl(WA_MSG_GENERAL);

const LINEAS = [
  {
    n: '01',
    href: '/fuera-de-serie/capacitacion-equipos-de-venta',
    kicker: 'Para empresas',
    title: 'Capacitación de equipos de venta',
    body: 'Entrenamos a tu equipo comercial sobre sus propias llamadas reales: diagnóstico, calificación y conversación consultiva.',
    items: ['Diagnóstico del equipo actual', 'Entrenamiento sobre casos reales', 'Seguimiento por persona', 'Corrección con evidencia'],
  },
  {
    n: '02',
    href: '/fuera-de-serie/programa-venta-consultiva',
    kicker: 'Para quienes ya venden',
    title: 'Programa de venta consultiva',
    body: '6 semanas de entrenamiento intensivo sobre tus propias conversaciones, con mentoría y feedback individual.',
    items: ['Planes Formación e Inmersión', 'Sobre tus propias llamadas', 'Mentoría 1 a 1', 'Evaluación por criterio, no por técnica'],
  },
  {
    n: '03',
    href: '/fuera-de-serie/incorporar-equipo-comercial',
    kicker: 'Búsqueda y selección',
    title: 'Incorporar comerciales capacitados',
    body: 'Sumá a tu empresa personas formadas con el método Areté, evaluadas sobre conversaciones reales y listas para generar resultados.',
    items: ['Perfilado según tu empresa', 'Candidatos ya entrenados', 'Evaluación objetiva previa', 'Proceso de incorporación acompañado'],
  },
];

const DIFERENCIA = [
  { t: 'No entrenamos respuestas', d: 'Un guión cambia. El mercado cambia. Las herramientas cambian. Una persona que sabe diagnosticar una situación siempre va a tener valor.' },
  { t: 'Entrenamos sobre conversaciones reales', d: 'No sobre casos hipotéticos ni scripts. Sobre las llamadas que ya está teniendo el equipo, con sus propias situaciones reales.' },
  { t: 'La corrección es información', d: 'No protegemos egos, protegemos el crecimiento. La corrección honesta y específica es la diferencia entre mejorar y repetir el mismo error.' },
];

export default function FueraDeSeriePage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ── HERO ── */}
      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Areté Fuera de Serie · Línea 02</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            {SEO_FDS.hub.h1.split(' para')[0]}<br />
            <em>para equipos de alto rendimiento.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            No formamos vendedores. Formamos solucionadores de problemas: personas capaces de comprender una situación y decidir qué corresponde hacer.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar <ArrowRight size={14} />
            </a>
            <Link href="/empresa" className={s.btnGhost}>
              Ver Areté Soluciones
            </Link>
          </div>
        </div>
      </section>

      {/* ── LA DIFERENCIA ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Por qué es distinto</p>
            <h2 className={s.sectionTitle}>No entrenamos respuestas.<br /><em>Entrenamos pensamiento.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {DIFERENCIA.map(d => (
              <div
                key={d.t}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr',
                  gap: 40,
                  padding: '32px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a6fff' }}>{d.t}</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAS TRES LÍNEAS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Tres líneas de trabajo</p>
            <h2 className={s.sectionTitle}>Según lo que necesitás.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {LINEAS.map(l => (
              <Link
                key={l.n}
                href={l.href}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  padding: '40px',
                  border: '1px solid rgba(242,239,233,0.08)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease',
                  alignItems: 'start',
                }}
              >
                <div>
                  <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                    {l.kicker}
                  </p>
                  <h3 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 22, color: '#f2efe9', fontFamily: 'var(--f-display)' }}>{l.title}</h3>
                  <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.7, color: 'rgba(242,239,233,0.5)' }}>{l.body}</p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {l.items.map(item => (
                      <li key={item} style={{ fontSize: 12, padding: '4px 12px', border: '1px solid rgba(242,239,233,0.12)', borderRadius: 999, color: 'rgba(242,239,233,0.45)', fontFamily: 'var(--f-mono)' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1a6fff', whiteSpace: 'nowrap', alignSelf: 'center' }}>
                  Ver más <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Cuál de las tres líneas<br /><em>aplica a tu situación?</em></h2>
            <p className={s.ctaSub}>Una conversación para entender qué tiene más sentido.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa" className={s.btnGhost}>
                Ver Areté Soluciones
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
