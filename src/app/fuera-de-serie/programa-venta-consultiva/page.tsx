import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';
import { RevealObserver } from '@/app/empresa/_reveal';
import { waUrl, WA_MSG_GENERAL } from '@/app/empresa/_content';
import { SEO_FDS, SITE_URL } from '@/app/empresa/_seo';

export const metadata: Metadata = {
  title: SEO_FDS.ventaConsultiva.title,
  description: SEO_FDS.ventaConsultiva.description,
  alternates: { canonical: SEO_FDS.ventaConsultiva.canonical },
  openGraph: {
    title: SEO_FDS.ventaConsultiva.title,
    description: SEO_FDS.ventaConsultiva.description,
    url: SEO_FDS.ventaConsultiva.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_FDS.ventaConsultiva.title,
    description: SEO_FDS.ventaConsultiva.description,
  },
};

const WA = waUrl(WA_MSG_GENERAL);

const PLANES = [
  {
    nombre: 'Formación',
    sub: 'Grupos de 4 personas',
    precio: 'Consultá precio',
    items: [
      '6 semanas de programa',
      'Grupos de máximo 4 personas',
      'Mentoría grupal',
      'Análisis de tus conversaciones reales',
      'Feedback escrito por sesión',
      'Acceso a la plataforma Fuera de Serie',
    ],
    accentColor: 'rgba(47,123,246,0.4)',
    accentBg: 'rgba(47,123,246,0.04)',
  },
  {
    nombre: 'Inmersión',
    sub: '1 a 1 diario',
    precio: 'Consultá precio',
    highlight: true,
    items: [
      '6 semanas de programa',
      'Formato individual (1 a 1)',
      'Mentoría diaria de lunes a viernes',
      'Análisis de cada conversación en el mismo día',
      'Feedback inmediato y específico',
      'Acceso total a la plataforma Fuera de Serie',
    ],
    accentColor: 'rgba(212,175,55,0.7)',
    accentBg: 'rgba(212,175,55,0.06)',
  },
];

const SEMANAS = [
  { n: '01–02', t: 'Diagnóstico y base', d: 'Evaluamos dónde estás hoy. Identificamos el patrón de error más costoso y lo trabajamos primero.' },
  { n: '03–04', t: 'Conversación consultiva', d: 'Cómo diagnosticar antes de proponer. Cómo hacer las preguntas que abren una conversación real.' },
  { n: '05–06', t: 'Decisión y cierre', d: 'Cómo acompañar una decisión sin presionar. Cómo decir que no cuando la situación lo requiere.' },
];

const FAQ = [
  {
    q: '¿Qué diferencia hay entre el plan Formación y el plan Inmersión?',
    a: 'Formación es grupal, con hasta 4 personas por grupo. Inmersión es individual, con mentoría diaria de lunes a viernes y feedback el mismo día de cada conversación.',
  },
  {
    q: '¿Necesito tener experiencia previa vendiendo para hacer el programa?',
    a: 'Sí. El programa está pensado para quienes ya venden y quieren mejorar su conversación, no para una introducción desde cero a la venta.',
  },
  {
    q: '¿Sobre qué conversaciones se trabaja durante las 6 semanas?',
    a: 'Sobre tus propias llamadas reales, no sobre casos hipotéticos. Cada semana se analiza lo que realmente pasó en tus conversaciones y se corrige sobre eso.',
  },
  {
    q: '¿Qué pasa después de las 6 semanas?',
    a: 'El programa tiene un cierre definido en 6 semanas. Según el resultado y la necesidad, se puede evaluar continuidad, pero el objetivo es que el criterio quede instalado, no generar dependencia del programa.',
  },
];

const COURSE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'Programa de Venta Consultiva',
  description: SEO_FDS.ventaConsultiva.description,
  provider: { '@type': 'Organization', name: 'Areté Fuera de Serie', url: SITE_URL },
  url: SEO_FDS.ventaConsultiva.canonical,
  hasCourseInstance: [
    { '@type': 'CourseInstance', courseMode: 'blended', name: 'Formación (grupos de 4)' },
    { '@type': 'CourseInstance', courseMode: 'blended', name: 'Inmersión (1 a 1 diario)' },
  ],
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/empresa` },
    { '@type': 'ListItem', position: 2, name: 'Fuera de Serie', item: SEO_FDS.hub.canonical },
    { '@type': 'ListItem', position: 3, name: 'Programa de Venta Consultiva', item: SEO_FDS.ventaConsultiva.canonical },
  ],
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function ProgramaVentaConsultivaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Fuera de Serie · Para quienes ya venden</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Programa de venta consultiva<br /><em>6 semanas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Para quienes ya venden y quieren mejorar su conversación. 6 semanas de entrenamiento sobre tus propias llamadas reales, con mentoría individual y feedback específico.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar <ArrowRight size={14} />
            </a>
            <Link href="/fuera-de-serie" className={s.btnGhost}>
              Ver todas las líneas
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEMANAS ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Estructura del programa</p>
            <h2 className={s.sectionTitle}>Tres bloques.<br /><em>Cada uno con un objetivo claro.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {SEMANAS.map(sem => (
              <div
                key={sem.n}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: 40,
                  padding: '36px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(26,111,255,0.5)' }}>Semana {sem.n}</span>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16, color: '#f2efe9' }}>{sem.t}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.5)' }}>{sem.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Planes</p>
            <h2 className={s.sectionTitle}>Formación o Inmersión.<br /><em>Según tu ritmo.</em></h2>
          </div>
          <div className={s.splitGridTight}>
            {PLANES.map(plan => (
              <div
                key={plan.nombre}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  padding: '48px 40px',
                  border: `1px solid ${plan.accentColor}`,
                  background: plan.accentBg,
                  position: 'relative',
                }}
              >
                <p style={{ margin: '0 0 8px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: plan.accentColor }}>
                  {plan.sub}
                </p>
                <h3 style={{ margin: '0 0 32px', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', color: '#f2efe9' }}>{plan.nombre}</h3>
                <ul className={s.panelList} style={{ padding: 0, marginBottom: 36 }}>
                  {plan.items.map(item => (
                    <li key={item} className={s.panelItem}>
                      <span className={s.panelDot} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                  Consultar precio <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Preguntas frecuentes</p>
            <h2 className={s.sectionTitle}>Antes de empezar</h2>
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
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <p className={s.kickerLabel} style={{ marginBottom: 20 }}>Otras líneas de Fuera de Serie</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/fuera-de-serie/capacitacion-equipos-de-venta" className={s.btnGhost}>Capacitación de Equipos</Link>
            <Link href="/fuera-de-serie/incorporar-equipo-comercial" className={s.btnGhost}>Incorporar Equipo Comercial</Link>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Formación o Inmersión?<br /><em>Hablemos y lo definimos.</em></h2>
            <p className={s.ctaSub}>Conversemos para entender cuál de los dos planes tiene más sentido para tu situación.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Consultar <ArrowRight size={15} />
              </a>
              <Link href="/fuera-de-serie/capacitacion-equipos-de-venta" className={s.btnGhost}>
                Capacitación para equipos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
