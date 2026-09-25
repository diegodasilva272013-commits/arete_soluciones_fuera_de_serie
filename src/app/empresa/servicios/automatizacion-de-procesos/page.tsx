import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO, SITE_URL } from '../../_seo';

export const metadata: Metadata = {
  title: SEO.automatizacion.title,
  description: SEO.automatizacion.description,
  alternates: { canonical: SEO.automatizacion.canonical },
  openGraph: {
    title: SEO.automatizacion.title,
    description: SEO.automatizacion.description,
    url: SEO.automatizacion.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.automatizacion.title,
    description: SEO.automatizacion.description,
  },
};

const WA = waUrl(WA_MSG_SERVICIO);

const CUANDO_AUTOMATIZAR = [
  { t: 'El proceso está claro', d: 'Automatizar un proceso mal definido solo produce errores más rápido. Primero diseñamos, después automatizamos.' },
  { t: 'El volumen lo justifica', d: 'Una tarea que se hace tres veces por semana no necesita automatización. Una que se repite 50 veces por día, sí.' },
  { t: 'Hay un costo real', d: 'Tiempo del equipo, errores frecuentes, información que se pierde. La automatización tiene que generar un retorno medible.' },
];

const EJEMPLOS = [
  'Envío automático de propuestas, recordatorios y seguimientos de cobro',
  'Sincronización entre sistemas que no se hablan (CRM, facturación, logística)',
  'Carga automática de datos desde formularios o emails al sistema interno',
  'Notificaciones al equipo cuando un estado cambia o vence un plazo',
  'Generación automática de reportes diarios o semanales para dirección',
  'Asignación automática de tareas por reglas de negocio del proceso real',
];

const FAQ = [
  {
    q: '¿Cómo sé si un proceso de mi empresa está listo para automatizarse?',
    a: 'Tres señales: el proceso está claro y documentado, se repite con volumen suficiente para justificar la inversión, y tiene un costo real medible en tiempo o errores. El diagnóstico evalúa esto antes de automatizar nada.',
  },
  {
    q: '¿Automatizar un proceso desordenado lo mejora?',
    a: 'No. Automatizar un proceso mal diseñado solo produce los mismos errores más rápido y a mayor escala. Por eso primero simplificamos y recién después automatizamos.',
  },
  {
    q: '¿Qué herramientas usan para automatizar?',
    a: 'La herramienta se elige según el caso: integraciones entre sistemas existentes, scripts a medida o plataformas de automatización, lo que tenga más sentido para el proceso específico. No vendemos una herramienta fija de antemano.',
  },
  {
    q: '¿La automatización reemplaza personas del equipo?',
    a: 'El objetivo es sacar a las personas de tareas repetitivas y de bajo valor, no reemplazar su criterio. La automatización libera tiempo para el trabajo que sí requiere una decisión humana.',
  },
  {
    q: '¿Cuánto tiempo lleva ver resultados de una automatización?',
    a: 'Depende de la complejidad del proceso y de cuántos sistemas hay que integrar. Automatizaciones puntuales pueden implementarse en días; integraciones entre varios sistemas llevan más tiempo de diseño y prueba.',
  },
];

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Automatización de Procesos',
  description: SEO.automatizacion.description,
  provider: { '@type': 'Organization', name: 'Areté Soluciones', url: SITE_URL },
  areaServed: 'AR',
  serviceType: 'Automatización de procesos empresariales',
  url: SEO.automatizacion.canonical,
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/empresa` },
    { '@type': 'ListItem', position: 2, name: 'Servicios', item: SEO.servicios.canonical },
    { '@type': 'ListItem', position: 3, name: 'Automatización de Procesos', item: SEO.automatizacion.canonical },
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

export default function AutomatizacionDeProcesosPage() {
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
            <span className={s.kickerLabel}>Implementación · Automatización</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Automatización de procesos<br /><em>para empresas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Automatizamos las tareas repetitivas que consumen tiempo del equipo e integramos los sistemas que no se hablan. Pero primero nos aseguramos de que el proceso valga la pena automatizar.
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

      {/* ── CUÁNDO AUTOMATIZAR ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El criterio</p>
            <h2 className={s.sectionTitle}>Primero simplificar.<br /><em>Después automatizar.</em></h2>
            <p className={s.sectionSub}>
              Automatizar un proceso malo produce errores a mayor velocidad. El diagnóstico define qué se simplifica antes y qué se automatiza después.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {CUANDO_AUTOMATIZAR.map(c => (
              <div
                key={c.t}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: 40,
                  padding: '32px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a6fff' }}>{c.t}</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EJEMPLOS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué automatizamos</p>
                <h2 className={s.sectionTitle}>Tareas repetitivas<br /><em>con alto costo operativo.</em></h2>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <ul className={s.panelList}>
                  {EJEMPLOS.map(item => (
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
            <Link href="/empresa/servicios/diagnostico-operativo" className={s.btnGhost}>Diagnóstico Operativo</Link>
            <Link href="/empresa/servicios/software-a-medida" className={s.btnGhost}>Software a Medida</Link>
            <Link href="/empresa/servicios/crm-erp-a-medida" className={s.btnGhost}>CRM y ERP a Medida</Link>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Hay procesos en tu empresa<br /><em>que todavía dependen de alguien?</em></h2>
            <p className={s.ctaSub}>Si una persona se va y el proceso se frena, ese proceso tiene solución.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/servicios/diagnostico-operativo" className={s.btnGhost}>
                Ver el diagnóstico primero
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
