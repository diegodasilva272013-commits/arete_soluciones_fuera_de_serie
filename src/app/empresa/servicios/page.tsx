import type { Metadata } from 'next';
import Link from 'next/link';
import s from '../corp.module.css';
import layout from '@/components/empresa/servicios/AreaSection.module.css';
import { RevealObserver } from '../_reveal';
import { MaskTitle } from '@/components/empresa/MaskTitle';
import { StickyNav } from '@/components/empresa/servicios/StickyNav';
import { ArrowLink } from '@/components/empresa/ArrowLink';
import { waLink } from '../constants';

export const metadata: Metadata = {
  title: 'Servicios — Areté Soluciones',
  description:
    'Diagnóstico operativo por área desde USD 1.500 e implementación de sistemas para empresas que necesitan volver a crecer sin depender de una persona.',
};

const WA = waLink('Hola, me interesa el diagnóstico operativo de Areté Soluciones');

const AREAS = [
  {
    id: 'ventas',
    title: 'Ventas',
    signals: [
      'Los leads llegan pero nadie sabe en qué etapa está cada uno.',
      'Cada vendedor califica distinto — el pronóstico del mes es un invento.',
    ],
    items: ['Mapeo del proceso de captación y conversión actual', 'Identificación de puntos de fuga en el embudo', 'Rediseño del flujo de oportunidades', 'Tablero de visibilidad para quien dirige'],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    signals: [
      'Se gasta en canales sin saber cuál trae al cliente que compra, no al que solo hace clic.',
      'Nadie puede explicar por qué bajó un mes sin revisar cinco planillas distintas.',
    ],
    items: ['Auditoría de canales y métricas actuales', 'Definición de qué medir y qué ignorar', 'Sistema de seguimiento de desempeño', 'Visibilidad de ROI por canal'],
  },
  {
    id: 'administracion',
    title: 'Administración',
    signals: [
      'Un cobro se factura, se ingresa a mano en otro sistema y se vuelve a chequear a fin de mes.',
      'El reporte de gestión lo arma una persona y tarda tres días en tenerlo listo.',
    ],
    items: ['Relevamiento del flujo de información financiera', 'Identificación de cuellos de botella y redundancias', 'Diseño del sistema de reportes de gestión', 'Dashboard de indicadores para dirección'],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    signals: [
      'Entre que el cliente dice que sí y recibe el resultado, nadie sabe en qué paso está.',
      'Si la persona que coordina se enferma, la entrega se atrasa una semana.',
    ],
    items: ['Mapeo del proceso de entrega, etapa por etapa', 'Identificación de dependencias de personas clave', 'Sistema de seguimiento del estado de cada proyecto', 'Indicadores de capacidad y calidad para dirección'],
  },
];

export default function ServiciosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* Hero sin media — plano detalle empieza directo en negro */}
      <section className={s.pageHero} style={{ background: 'var(--sombra)' }}>
        <div className={s.pageHeroInner}>
          <MaskTitle
            as="h1"
            trigger="load"
            className={s.heroTitle}
            lines={['Cuatro áreas.', <em key="e">Un solo sistema.</em>]}
          />
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Trabajamos sobre las áreas que generan fricción operativa. El diagnóstico se cobra por área relevada y es
            deducible de la implementación.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btn}>
              Pedir diagnóstico
            </a>
            <ArrowLink
              href="/empresa/metodologia"
              style={{
                color: 'var(--hueso-mute)',
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Ver el método
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* Precios del diagnóstico — sostenidos por el criterio, no solo el numero */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 40 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Dos etapas de trabajo</p>
            <h2 className={s.sectionTitle}>Diagnóstico primero.<br /><em>Implementación después.</em></h2>
            <p className={s.sectionSub}>
              Nunca implementamos sin entender. Analizamos la operación de cada área, y el costo de ese diagnóstico
              se descuenta si avanzamos a construir.
            </p>
          </div>
          <div className={s.splitGridTight}>
            <div style={{ padding: '32px 36px', border: '1px solid rgba(242,239,233,0.08)' }}>
              <p className={s.bandNum}>Diagnóstico</p>
              <p style={{ margin: '8px 0 0', fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 26, color: 'var(--hueso)' }}>USD 1.500 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--hueso-mute)' }}>por área</span></p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gris)' }}>USD 4.000 las cuatro áreas · 2–3 semanas</p>
            </div>
            <div style={{ padding: '32px 36px', border: '1px solid rgba(var(--azul-rgb),0.2)', background: 'rgba(var(--azul-rgb),0.03)' }}>
              <p className={s.bandNum}>Implementación</p>
              <p style={{ margin: '8px 0 0', fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 26, color: 'var(--hueso)' }}>USD 1.500–10.000</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gris)' }}>Según alcance de cada proyecto · deducible del diagnóstico</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cuatro áreas ancladas */}
      <section className={s.section} style={{ paddingTop: 0 }}>
        <div className={layout.layout}>
          <StickyNav />
          <div className={layout.areas}>
            {AREAS.map((a) => (
              <div key={a.id} id={a.id} className={layout.area}>
                <div>
                  <h3 className={layout.title}>{a.title}</h3>
                  <ul className={layout.signals}>
                    {a.signals.map((sig) => (
                      <li key={sig}>{sig}</li>
                    ))}
                  </ul>
                  <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnGhost}>
                    Consultar {a.title.toLowerCase()}
                  </a>
                </div>
                <div>
                  <div className={layout.price} style={{ marginBottom: 20 }}>
                    <span className={layout.priceLabel}>Diagnóstico de {a.title.toLowerCase()}</span>
                    <span className={layout.priceValue}>USD 1.500</span>
                  </div>
                  <ul className={layout.items}>
                    {a.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            "Micro-emprendimientos no. Trabajamos con empresas que ya tienen operación establecida, múltiples áreas
            diferenciadas y un CEO que creció más rápido que sus procesos."
          </p>
          <span className={s.quoteAuthor}>Areté Soluciones · Perfil de cliente</span>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Por dónde empezamos?</h2>
            <p className={s.ctaSub}>Una conversación de 30 minutos para entender tu situación. Sin costo.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btn}>
                Hablar con el equipo
              </a>
              <Link href="/empresa/contacto" className={s.btnSec}>
                Otras formas de contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
