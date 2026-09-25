import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO, SITE_URL } from '../../_seo';

export const metadata: Metadata = {
  title: SEO.softwareAMedida.title,
  description: SEO.softwareAMedida.description,
  alternates: { canonical: SEO.softwareAMedida.canonical },
  openGraph: {
    title: SEO.softwareAMedida.title,
    description: SEO.softwareAMedida.description,
    url: SEO.softwareAMedida.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.softwareAMedida.title,
    description: SEO.softwareAMedida.description,
  },
};

const WA = waUrl(WA_MSG_SERVICIO);

const DIFERENCIAS = [
  { t: 'A medida', d: 'Se construye sobre cómo trabaja tu empresa. No sobre cómo trabaja una empresa genérica del mismo sector.' },
  { t: 'Sin licencias', d: 'No pagás por funcionalidades que no usás. El costo es de implementación, no de suscripción mensual indefinida.' },
  { t: 'Sin adopción forzada', d: 'El sistema se adapta al proceso existente. No al revés. El equipo no necesita cambiar cómo trabaja para poder usarlo.' },
  { t: 'Evoluciona con vos', d: 'El código es tuyo. Podemos ampliarlo, ajustarlo o traspasarlo a tu equipo técnico en cualquier momento.' },
];

const TIPOS = [
  'Sistemas de gestión comercial (pipeline, seguimiento, cierres)',
  'Tableros de gestión para dirección con indicadores reales',
  'Portales de clientes o proveedores con acceso controlado',
  'Sistemas de seguimiento de entrega y operaciones',
  'Módulos de administración: facturación, cobros, reportes',
  'Integraciones entre sistemas que no se comunican',
];

const FAQ = [
  {
    q: '¿En cuánto tiempo se desarrolla un software a medida?',
    a: 'Depende del alcance definido en el diagnóstico. Un módulo acotado puede estar listo en unas semanas; un sistema que cubre varias áreas lleva más tiempo, pero se implementa en etapas para que el equipo empiece a usar partes del sistema antes de que esté completo.',
  },
  {
    q: '¿Qué diferencia hay con comprar un software ya armado?',
    a: 'Un software ya armado te obliga a adaptar tu proceso a su lógica. El software a medida hace lo contrario: se construye sobre cómo trabaja tu empresa. La contrapartida es que no es instantáneo — requiere el diseño previo del diagnóstico.',
  },
  {
    q: '¿El código queda en propiedad de mi empresa?',
    a: 'Sí. El sistema es tuyo. Podés ampliarlo, ajustarlo con tu propio equipo técnico o pedirnos que sigamos evolucionándolo — la decisión es tuya, no queda atado a nuestra empresa.',
  },
  {
    q: '¿Puedo pedir solo un módulo o tiene que ser todo el sistema?',
    a: 'Se puede empezar por un módulo específico — por ejemplo, el seguimiento comercial o el tablero de indicadores — y sumar otros después. El diagnóstico define qué conviene priorizar primero.',
  },
  {
    q: '¿Qué pasa si mi empresa ya tiene un CRM o ERP?',
    a: 'Podemos integrarlo, complementarlo con módulos a medida donde la herramienta actual no cubre, o reemplazarlo si el diagnóstico muestra que no se ajusta a cómo trabaja realmente el equipo.',
  },
];

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Software a Medida',
  description: SEO.softwareAMedida.description,
  provider: { '@type': 'Organization', name: 'Areté Soluciones', url: SITE_URL },
  areaServed: 'AR',
  serviceType: 'Desarrollo de software a medida',
  url: SEO.softwareAMedida.canonical,
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/empresa` },
    { '@type': 'ListItem', position: 2, name: 'Servicios', item: SEO.servicios.canonical },
    { '@type': 'ListItem', position: 3, name: 'Software a Medida', item: SEO.softwareAMedida.canonical },
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

export default function SoftwareAMedidaPage() {
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
            <span className={s.kickerLabel}>Implementación · Software</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Software a medida<br /><em>para empresas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Construimos el sistema que la empresa necesita, no el que existe en el mercado. Diseñamos sobre el proceso real y elegimos la tecnología como consecuencia del diseño.
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

      {/* ── QUÉ NOS DIFERENCIA ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Por qué a medida</p>
            <h2 className={s.sectionTitle}>El sistema se adapta a la empresa.<br /><em>No al revés.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {DIFERENCIAS.map(d => (
              <div
                key={d.t}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
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

      {/* ── TIPOS DE SISTEMAS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué construimos</p>
                <h2 className={s.sectionTitle}>Sistemas que resuelven<br /><em>problemas reales.</em></h2>
                <p className={s.sectionSub}>
                  No hacemos apps genéricas ni templates. Cada sistema nace de un diagnóstico que entiende qué fricción tiene que desaparecer.
                </p>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <ul className={s.panelList}>
                  {TIPOS.map(item => (
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
                <dt className={s.metaDt}>Rango</dt>
                <dd className={s.metaDd}><em>USD 1.500 – 10.000</em></dd>
              </div>
              <div className={s.metaItem}>
                <dt className={s.metaDt}>Según alcance</dt>
                <dd className={s.metaDd}>de cada proyecto</dd>
              </div>
            </dl>
            <p style={{ marginTop: 24, fontSize: 13, lineHeight: 1.7, color: 'rgba(242,239,233,0.35)' }}>
              El precio se define después del diagnóstico. Nunca cotizamos software sin entender qué problema resuelve.
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
            <Link href="/empresa/servicios/diagnostico-operativo" className={s.btnGhost}>Diagnóstico Operativo</Link>
            <Link href="/empresa/servicios/crm-erp-a-medida" className={s.btnGhost}>CRM y ERP a Medida</Link>
            <Link href="/empresa/servicios/automatizacion-de-procesos" className={s.btnGhost}>Automatización de Procesos</Link>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Tenés un sistema<br /><em>que no funciona como debería?</em></h2>
            <p className={s.ctaSub}>Empezamos con un diagnóstico. Si hay algo para construir, lo construimos.</p>
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
