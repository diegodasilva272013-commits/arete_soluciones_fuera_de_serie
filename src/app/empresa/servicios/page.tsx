import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

export const metadata: Metadata = {
  title: 'Servicios — Areté Soluciones',
  description: 'Diagnóstico operativo e implementación de sistemas para empresas que necesitan volver a crecer sin depender de una persona.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20el%20diagn%C3%B3stico%20operativo%20de%20Aret%C3%A9%20Soluciones';

const AREAS = [
  {
    n: '01',
    area: 'Ventas',
    desc: 'Del primer contacto al cierre: cómo llegan las oportunidades, cómo se califican y cómo se convierten en clientes. Mapeamos dónde se frena el flujo y lo rediseñamos.',
    flip: false,
    items: [
      'Mapeo del proceso de captación y conversión actual',
      'Identificación de puntos de fuga en el embudo',
      'Rediseño del flujo de oportunidades',
      'Herramientas que reflejan cómo trabaja el equipo',
      'Tablero de visibilidad para quién dirige',
    ],
  },
  {
    n: '02',
    area: 'Marketing',
    desc: 'Qué hace que los clientes correctos lleguen solos. Qué se mide, qué no, y qué dice ese número. Construimos el sistema de atracción que deja de depender de la improvisación.',
    flip: true,
    items: [
      'Auditoría de canales y métricas actuales',
      'Definición de qué medir y qué ignorar',
      'Sistema de seguimiento de desempeño',
      'Flujos de atracción y nurturing a medida',
      'Visibilidad de ROI por canal',
    ],
  },
  {
    n: '03',
    area: 'Administración',
    desc: 'Facturación, cobros, reportes. Dónde se pierde información y qué tarda más de lo que debería. Diseñamos el sistema administrativo que funciona sin que nadie lo persiga.',
    flip: false,
    items: [
      'Relevamiento del flujo de información financiera',
      'Identificación de cuellos de botella y redundancias',
      'Diseño del sistema de reportes de gestión',
      'Automatización de tareas repetitivas de alto riesgo',
      'Dashboard de indicadores para dirección',
    ],
  },
  {
    n: '04',
    area: 'Delivery',
    desc: 'Cómo se entrega lo que se vendió. Dónde está el cuello de botella entre el sí del cliente y el resultado. Lo hacemos predecible, escalable y visible desde arriba.',
    flip: true,
    items: [
      'Mapeo del proceso de entrega actual, etapa por etapa',
      'Identificación de dependencias de personas clave',
      'Rediseño del flujo de entrega',
      'Sistema de seguimiento del estado de cada proyecto',
      'Indicadores de capacidad y calidad para dirección',
    ],
  },
];

export default function ServiciosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Servicios</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Cuatro áreas.<br /><em>Un solo sistema.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Trabajamos sobre las áreas que generan fricción operativa. No vendemos tecnología: diseñamos cómo debería funcionar la empresa y elegimos la herramienta como consecuencia.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Pedir diagnóstico <ArrowRight size={14} />
            </a>
            <Link href="/empresa/metodologia" className={s.btnGhost}>
              Ver el método
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRECIOS DIAGNÓSTICO ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Dos etapas de trabajo</p>
            <h2 className={s.sectionTitle}>Diagnóstico primero.<br /><em>Implementación después.</em></h2>
            <p className={s.sectionSub}>
              Nunca implementamos sin entender. El diagnóstico es el primer servicio: un análisis a fondo de la operación que termina en un plan priorizado.
            </p>
          </div>

          <div className={s.splitGridTight}>
            {/* Diagnóstico */}
            <div className={`${s.reveal}`} data-reveal="" style={{ padding: '48px 40px', border: '1px solid rgba(242,239,233,0.08)', borderRight: 'none', position: 'relative' }}>
              <p className={s.bandNum} style={{ marginBottom: 24 }}>Etapa 01</p>
              <h3 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', color: '#f2efe9' }}>Diagnóstico Operativo</h3>
              <p style={{ margin: '0 0 32px', fontSize: 15, lineHeight: 1.75, color: 'rgba(242,239,233,0.5)' }}>
                Analizamos la operación de cada área: procesos, herramientas, flujos de información y puntos de fuga. Entregamos un mapa del estado actual y un plan de acción priorizado.
              </p>
              <dl className={s.meta} style={{ marginTop: 0, marginBottom: 32 }}>
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
              <ul className={s.panelList} style={{ padding: 0 }}>
                {['Inmersión en la operación', 'Entrevistas con equipo y dirección', 'Mapa del estado actual', 'Identificación de prioridades 80/20', 'Plan de acción priorizado'].map(item => (
                  <li key={item} className={s.panelItem}>
                    <span className={s.panelDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 36 }}>
                <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                  Consultar <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Implementación */}
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ padding: '48px 40px', border: '1px solid rgba(26,111,255,0.2)', background: 'rgba(26,111,255,0.03)', position: 'relative' }}>
              <p className={s.bandNum} style={{ marginBottom: 24 }}>Etapa 02</p>
              <h3 style={{ margin: '0 0 16px', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', color: '#f2efe9' }}>Implementación</h3>
              <p style={{ margin: '0 0 32px', fontSize: 15, lineHeight: 1.75, color: 'rgba(242,239,233,0.5)' }}>
                Construimos los sistemas diseñados en el diagnóstico. El orden de implementación sigue las prioridades del plan: primero lo que genera mayor impacto.
              </p>
              <dl className={s.meta} style={{ marginTop: 0, marginBottom: 32 }}>
                <div className={s.metaItem}>
                  <dt className={s.metaDt}>Inversión</dt>
                  <dd className={s.metaDd}><em>USD 1.500–10.000</em></dd>
                </div>
                <div className={s.metaItem}>
                  <dt className={s.metaDt}>Según alcance</dt>
                  <dd className={s.metaDd}>de cada proyecto</dd>
                </div>
              </dl>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {['Construcción en orden de impacto', 'Cada entrega genera valor antes del fin del proyecto', 'Capacitación del equipo en el nuevo sistema', 'Seguimiento de adopción post-entrega', 'Ajuste incluido en los primeros 30 días'].map(item => (
                  <li key={item} className={s.panelItem}>
                    <span className={s.panelDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 36 }}>
                <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                  Consultar <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LAS 4 ÁREAS EN DETALLE ── */}
      {AREAS.map((a) => (
        <div key={a.area} className={s.band}>
          <div className={`${s.bandGrid} ${a.flip ? s.bandGridFlip : ''}`}>
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.bandNum}>{a.n} — Área</p>
              <h2 className={s.bandTitle}>{a.area}</h2>
              <p className={s.bandBody}>{a.desc}</p>
              <div style={{ marginTop: 32 }}>
                <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnGhost}>
                  Consultar esta área <ArrowRight size={14} />
                </a>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  El diagnóstico incluye
                </p>
                <ul className={s.panelList}>
                  {a.items.map(item => (
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
      ))}

      {/* ── QUOTE ── */}
      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            "Micro-emprendimientos no. Trabajamos con empresas que ya tienen operación establecida, múltiples áreas diferenciadas y un CEO que creció más rápido que sus procesos."
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
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/contacto" className={s.btnGhost}>
                Otras formas de contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
