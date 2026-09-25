import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO, SITE_URL } from '../../_seo';

export const metadata: Metadata = {
  title: SEO.diagnosticoOperativo.title,
  description: SEO.diagnosticoOperativo.description,
  alternates: { canonical: SEO.diagnosticoOperativo.canonical },
  openGraph: {
    title: SEO.diagnosticoOperativo.title,
    description: SEO.diagnosticoOperativo.description,
    url: SEO.diagnosticoOperativo.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.diagnosticoOperativo.title,
    description: SEO.diagnosticoOperativo.description,
  },
};

const WA = waUrl(WA_MSG_SERVICIO);

const ENTREGABLES = [
  'Mapa de la operación real: cómo trabaja la empresa hoy, área por área',
  'Identificación de los procesos con mayor costo operativo y mayor riesgo',
  'Priorización 80/20: qué resolver primero para el mayor impacto',
  'Plan de acción con estimaciones de tiempo e inversión por iniciativa',
  'Documento de arquitectura: qué tecnología se recomienda y por qué',
];

const PROCESO = [
  { n: '01', t: 'Inmersión', d: 'Entrevistas con dirección y equipo ejecutor. El CEO sabe el objetivo; el equipo sabe el proceso real. Necesitamos las dos visiones.' },
  { n: '02', t: 'Mapeo', d: 'Documentamos cada proceso: quién lo hace, cómo, qué herramientas usa y dónde se pierde tiempo o información.' },
  { n: '03', t: 'Análisis', d: 'Cruzamos el mapa con los indicadores del negocio. Detectamos qué fricción está costando más y qué tiene solución directa.' },
  { n: '04', t: 'Plan priorizado', d: 'Ordenamos las intervenciones por impacto vs. esfuerzo. Entregamos el plan que se lleva adelante en la etapa de implementación.' },
];

const FAQ = [
  {
    q: '¿Cuánto dura un diagnóstico operativo?',
    a: 'Entre 2 y 3 semanas, según la cantidad de áreas que se relevan. Cada área agrega entrevistas y análisis, pero el proceso completo no suele extenderse más de un mes.',
  },
  {
    q: '¿El diagnóstico incluye la implementación?',
    a: 'No. El diagnóstico es la primera etapa y termina en un plan de acción priorizado. La implementación es un servicio aparte que se cotiza según el alcance definido en ese plan.',
  },
  {
    q: '¿Qué pasa si el diagnóstico no encuentra nada para mejorar?',
    a: 'Te lo decimos directamente. No vendemos diagnósticos para justificar una implementación después: si la operación funciona bien, preferimos decir que no hay nada que intervenir.',
  },
  {
    q: '¿Puedo pedir el diagnóstico de una sola área?',
    a: 'Sí. Se puede hacer por área — ventas, marketing, administración, o entrega y operaciones — o para las cuatro juntas. Siempre recomendamos empezar por donde hay más fricción evidente.',
  },
  {
    q: '¿Quiénes participan del diagnóstico?',
    a: 'Entrevistamos a quien dirige y a quien ejecuta cada proceso. Las dos miradas importan: la dirección conoce el objetivo, el equipo conoce cómo se trabaja en la práctica todos los días.',
  },
  {
    q: '¿Sirve si ya tengo un CRM o ERP implementado?',
    a: 'Sí. Muchas veces el problema no es la falta de herramientas sino que las que ya existen no reflejan cómo trabaja realmente la empresa. El diagnóstico también identifica ese desajuste.',
  },
];

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Diagnóstico Operativo',
  description: SEO.diagnosticoOperativo.description,
  provider: { '@type': 'Organization', name: 'Areté Soluciones', url: SITE_URL },
  areaServed: 'AR',
  serviceType: 'Consultoría de procesos',
  url: SEO.diagnosticoOperativo.canonical,
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/empresa` },
    { '@type': 'ListItem', position: 2, name: 'Servicios', item: SEO.servicios.canonical },
    { '@type': 'ListItem', position: 3, name: 'Diagnóstico Operativo', item: SEO.diagnosticoOperativo.canonical },
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

export default function DiagnosticoOperativoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Etapa 01 · Diagnóstico</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            {SEO.diagnosticoOperativo.h1.split(' para')[0]}.<br />
            <em>para empresas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Antes de construir cualquier cosa, relevamos cómo trabaja la empresa de verdad. El diagnóstico es el único punto de partida que no tiene atajos.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar <ArrowRight size={14} />
            </a>
            <Link href="/empresa/servicios" className={s.btnGhost}>
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ── QUÉ ES ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué hacemos</p>
                <h2 className={s.sectionTitle}>Primero entender.<br /><em>Después construir.</em></h2>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Entramos en la empresa y hablamos con quien dirige, pero también con quien ejecuta. El CEO dice que el proceso funciona perfecto; la secretaria dice que hace lo mismo siete veces por día. Las dos miradas importan.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Del relevamiento sale un mapa de la operación con lo que cada proceso está costando, y el orden en que conviene intervenirlo. Recién ahí se decide qué construir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Cómo funciona</p>
            <h2 className={s.sectionTitle}>Cuatro etapas en 2–3 semanas</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PROCESO.map(p => (
              <div
                key={p.n}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: 40,
                  padding: '36px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(26,111,255,0.5)' }}>{p.n}</span>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16, color: '#f2efe9' }}>{p.t}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.5)' }}>{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTREGABLES ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué entregamos</p>
                <h2 className={s.sectionTitle}>Un plan concreto,<br /><em>no un informe.</em></h2>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <ul className={s.panelList}>
                  {ENTREGABLES.map(item => (
                    <li key={item} className={s.panelItem}>
                      <span className={s.panelDot} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIO ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 600 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 20 }}>Inversión</p>
            <dl className={s.meta}>
              <div className={s.metaItem}>
                <dt className={s.metaDt}>Por área</dt>
                <dd className={s.metaDd}><em>USD 1.500</em></dd>
              </div>
              <div className={s.metaItem}>
                <dt className={s.metaDt}>Las cuatro áreas</dt>
                <dd className={s.metaDd}><em>USD 4.000</em></dd>
              </div>
              <div className={s.metaItem}>
                <dt className={s.metaDt}>Duración</dt>
                <dd className={s.metaDd}>2–3 semanas</dd>
              </div>
            </dl>
            <p style={{ marginTop: 24, fontSize: 13, lineHeight: 1.7, color: 'rgba(242,239,233,0.35)' }}>
              El diagnóstico puede cubrir una sola área o las cuatro. Siempre empieza por donde hay más fricción. Si no encontramos nada que valga la pena intervenir, te lo decimos antes de ir a implementación.
            </p>
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
          <p className={s.kickerLabel} style={{ marginBottom: 20 }}>Servicios relacionados</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/empresa/servicios/software-a-medida" className={s.btnGhost}>Software a Medida</Link>
            <Link href="/empresa/servicios/crm-erp-a-medida" className={s.btnGhost}>CRM y ERP a Medida</Link>
            <Link href="/empresa/servicios/automatizacion-de-procesos" className={s.btnGhost}>Automatización de Procesos</Link>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Tiene sentido empezar<br /><em>con un diagnóstico?</em></h2>
            <p className={s.ctaSub}>30 minutos para ver si hay un problema que podemos diagnosticar.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/servicios" className={s.btnGhost}>
                Ver todos los servicios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
