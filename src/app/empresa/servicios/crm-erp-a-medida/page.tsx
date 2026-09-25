import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO, SITE_URL } from '../../_seo';

export const metadata: Metadata = {
  title: SEO.crmErpAMedida.title,
  description: SEO.crmErpAMedida.description,
  alternates: { canonical: SEO.crmErpAMedida.canonical },
  openGraph: {
    title: SEO.crmErpAMedida.title,
    description: SEO.crmErpAMedida.description,
    url: SEO.crmErpAMedida.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.crmErpAMedida.title,
    description: SEO.crmErpAMedida.description,
  },
};

const WA = waUrl(WA_MSG_SERVICIO);

const MODULOS_CRM = [
  'Pipeline de ventas adaptado al proceso real de cierre',
  'Seguimiento de oportunidades con historial completo',
  'Asignación y rotación de leads entre el equipo',
  'Alertas y recordatorios sin depender de la memoria',
  'Tablero de métricas comerciales para dirección',
];

const MODULOS_ERP = [
  'Facturación y cobros integrados al proceso administrativo',
  'Gestión de órdenes y entrega por proyecto o cliente',
  'Control de stock o avance de servicio en tiempo real',
  'Reportes financieros sin copiar datos a mano',
  'Roles y permisos por área o función',
];

const FAQ = [
  {
    q: '¿Cuál es la diferencia entre un CRM y un ERP a medida?',
    a: 'El CRM cubre el proceso comercial: pipeline, seguimiento de oportunidades y métricas de ventas. El ERP cubre la operación: facturación, cobros, stock y reportes. Muchas empresas necesitan ambos conectados en un solo sistema.',
  },
  {
    q: '¿Puedo migrar los datos de mi CRM o ERP actual?',
    a: 'Sí. La migración de datos históricos forma parte del alcance que se define en el diagnóstico previo, según el volumen y la calidad de la información existente.',
  },
  {
    q: '¿Qué pasa si mi empresa crece y necesito agregar módulos después?',
    a: 'El sistema se diseña para poder ampliarse. Podés sumar módulos nuevos — otro canal de ventas, otra línea de negocio — sin tener que rehacer lo que ya funciona.',
  },
  {
    q: '¿Necesito reemplazar todos mis sistemas actuales de una vez?',
    a: 'No necesariamente. Muchas veces conviene integrar el CRM o ERP a medida con herramientas que ya funcionan bien, y reemplazar solo las que generan fricción real.',
  },
  {
    q: '¿Cuánto cuesta un CRM o ERP a medida?',
    a: 'Depende del alcance definido en el diagnóstico: cuántos módulos, cuántos usuarios y qué nivel de integración con otros sistemas. Por eso nunca cotizamos sin el diagnóstico previo.',
  },
];

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'CRM y ERP a Medida',
  description: SEO.crmErpAMedida.description,
  provider: { '@type': 'Organization', name: 'Areté Soluciones', url: SITE_URL },
  areaServed: 'AR',
  serviceType: 'Desarrollo de CRM y ERP a medida',
  url: SEO.crmErpAMedida.canonical,
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/empresa` },
    { '@type': 'ListItem', position: 2, name: 'Servicios', item: SEO.servicios.canonical },
    { '@type': 'ListItem', position: 3, name: 'CRM y ERP a Medida', item: SEO.crmErpAMedida.canonical },
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

export default function CrmErpAMedidaPage() {
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
            <span className={s.kickerLabel}>Implementación · CRM · ERP</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            CRM y ERP a medida<br /><em>para pymes.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Un solo sistema que conecta ventas, clientes, facturación y operación. Diseñado sobre cómo trabaja tu empresa, no sobre cómo trabaja un cliente genérico del proveedor.
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

      {/* ── POR QUÉ A MEDIDA ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El problema con los CRM y ERP genéricos</p>
                <h2 className={s.sectionTitle}>Sin licencias que<br /><em>no vas a usar.</em></h2>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Los CRM y ERP genéricos están diseñados para el cliente promedio de su mercado. Si tu proceso de ventas o tu operación no encaja en ese molde, terminás pagando por un sistema que obliga a la empresa a trabajar peor para poder usarlo.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Un sistema a medida empieza por el diagnóstico: entendemos cómo trabaja la empresa de verdad y construimos sobre eso. Sin funcionalidades que nunca vas a usar. Sin licencias que se renuevan aunque el sistema no resuelva nada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Módulos habituales</p>
            <h2 className={s.sectionTitle}>CRM y ERP: dos sistemas,<br /><em>un solo criterio.</em></h2>
          </div>
          <div className={s.splitGridTight}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.bandPanel} style={{ height: '100%' }}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  CRM · Módulo comercial
                </p>
                <ul className={s.panelList}>
                  {MODULOS_CRM.map(item => (
                    <li key={item} className={s.panelItem}>
                      <span className={s.panelDot} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel} style={{ height: '100%' }}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  ERP · Módulo operativo
                </p>
                <ul className={s.panelList}>
                  {MODULOS_ERP.map(item => (
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
            <Link href="/empresa/servicios/automatizacion-de-procesos" className={s.btnGhost}>Automatización de Procesos</Link>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Cuánto cuesta un sistema<br /><em>que funcione de verdad?</em></h2>
            <p className={s.ctaSub}>Primero el diagnóstico, después la cotización. Sin diagnóstico no cotizamos.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/servicios/diagnostico-operativo" className={s.btnGhost}>
                Ver el diagnóstico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
