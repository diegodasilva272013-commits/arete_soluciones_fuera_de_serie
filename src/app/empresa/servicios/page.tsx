import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Formación comercial, mentoría individual y programas corporativos para equipos de ventas de alto rendimiento.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const ITEMS = [
  {
    num: '01',
    tag: 'Equipo · 12 semanas',
    title: 'Formación Comercial',
    lead: 'El método completo para equipos que quieren vender diferente.',
    body1: 'Un programa estructurado que transforma la forma en que tu equipo entiende y conduce una conversación comercial. Nada de guiones de memoria: aprendemos a escuchar, diagnosticar y proponer soluciones que el cliente ya quería antes de que abrieras la boca.',
    body2: 'Cada semana combina contenido teórico, ejercicios prácticos en vivo y revisión de casos reales del equipo. El avance se mide por resultados, no por tiempo en pantalla.',
    pull: 'La conversación que cierra es la que resuelve el problema antes de pedir el sí.',
    meta: [
      { dt: 'Duración', dd: '12 semanas' },
      { dt: 'Módulos', dd: '12 unidades' },
      { dt: 'Acceso', dd: 'Permanente' },
    ],
    panel: [
      'Desarmado de la conversación comercial en partes',
      'Módulos de apertura, diagnóstico, objeciones y cierre',
      'Ejercicio práctico al final de cada unidad',
      'Revisión de llamadas reales del equipo',
      'Material de referencia de uso permanente',
    ],
    flip: false,
  },
  {
    num: '02',
    tag: 'Individual · Ongoing',
    title: 'Mentoría 1:1',
    lead: 'Para quienes ya saben vender y quieren llegar al siguiente nivel.',
    body1: 'Sesiones individuales con un mentor que ya atravesó los mismos casos que tenés adelante. No es coaching genérico: es análisis de situaciones concretas, simulación de conversaciones y ajuste fino de tu estilo comercial.',
    body2: 'Trabajamos sobre tus leads reales, tus objeciones reales y tu forma de comunicar. La sesión no termina cuando se acaba el tiempo, sino cuando la estructura quedó incorporada.',
    pull: 'El que mira sin hablar no aprende. El que habla sin que lo corrijan tampoco.',
    meta: [
      { dt: 'Modalidad', dd: '1:1 en vivo' },
      { dt: 'Duración', dd: '60 min' },
      { dt: 'Cupo', dd: 'Máx. 4' },
    ],
    panel: [
      'Análisis de conversaciones propias del setter',
      'Roleplay con corrección en tiempo real',
      'WhatsApp de seguimiento entre sesiones',
      'Grabación disponible para revisión',
      'Plan de trabajo personalizado por caso',
    ],
    flip: true,
  },
  {
    num: '03',
    tag: 'Diagnóstico · 2–3 semanas',
    title: 'Auditoría Comercial',
    lead: 'Antes de cambiar algo, entendé qué está fallando y dónde.',
    body1: 'Analizamos en profundidad tu proceso de ventas actual: desde cómo llegan los leads hasta por qué se caen antes del cierre. Revisamos llamadas, mensajes, propuestas y el sistema de seguimiento.',
    body2: 'Entregamos un informe con los puntos de fuga identificados y un plan de acción con prioridades claras. Sin tecnicismos, sin consultant-speak: acciones para ejecutar la semana siguiente.',
    pull: 'Los equipos que más venden no tienen más leads — tienen menos fugas.',
    meta: [
      { dt: 'Entrega', dd: '2–3 semanas' },
      { dt: 'Informe', dd: 'Detallado' },
      { dt: 'Plan', dd: 'Priorizado' },
    ],
    panel: [
      'Análisis de llamadas y mensajes existentes',
      'Mapeo del proceso de ventas actual',
      'Identificación de puntos de fuga específicos',
      'Informe ejecutivo con hallazgos',
      'Plan de acción priorizado para 30/60/90 días',
    ],
    flip: false,
  },
  {
    num: '04',
    tag: 'Empresa · A medida',
    title: 'Programa Corporativo',
    lead: 'Para equipos de 10+ vendedores que necesitan un sistema, no un curso.',
    body1: 'Diseñamos e implementamos un programa de formación completamente personalizado para tu empresa, tu industria y tu proceso de ventas. Desde el diagnóstico inicial hasta el seguimiento post-implementación.',
    body2: 'Incluye formación del equipo, acompañamiento a líderes comerciales y revisiones periódicas para asegurar que el método quede instalado en la cultura del equipo.',
    pull: 'La escala no se consigue replicando vendedores — se consigue instalando el método.',
    meta: [
      { dt: 'Equipo', dd: '10+ personas' },
      { dt: 'Plan', dd: 'Personalizado' },
      { dt: 'Revisión', dd: 'Trimestral' },
    ],
    panel: [
      'Diagnóstico inicial gratuito',
      'Programa 100% personalizado por industria',
      'Formación de líderes comerciales internos',
      'Implementación del método en herramientas actuales',
      'Seguimiento trimestral de métricas incluido',
    ],
    flip: true,
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
            No vendemos el mismo<br />programa a todos
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Cada servicio responde a un momento distinto de tu equipo. Empezamos siempre entendiendo dónde estás parado.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="">
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Diagnóstico gratuito <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {ITEMS.map((svc) => (
        <div key={svc.num} className={s.band}>
          <div className={`${s.bandGrid} ${svc.flip ? s.bandGridFlip : ''}`}>
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.bandNum}>{svc.num} — {svc.tag}</p>
              <h2 className={s.bandTitle}>{svc.title}</h2>
              <p style={{ margin: '0 0 20px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, lineHeight: 1.6, color: 'rgba(242,239,233,0.72)' }}>{svc.lead}</p>
              <p className={s.bandBody}>{svc.body1}</p>
              <p className={s.bandBody}>{svc.body2}</p>
              <p className={s.bandPull}>{svc.pull}</p>
              <dl className={s.meta}>
                {svc.meta.map((m) => (
                  <div key={m.dt} className={s.metaItem}>
                    <dt className={s.metaDt}>{m.dt}</dt>
                    <dd className={s.metaDd}>{m.dd}</dd>
                  </div>
                ))}
              </dl>
              <div style={{ marginTop: 32 }}>
                <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                  Consultar <ArrowRight size={14} />
                </a>
              </div>
            </div>

            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>Incluye</p>
                <ul className={s.panelList}>
                  {svc.panel.map((item) => (
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

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿No sabés por dónde empezar?</h2>
            <p className={s.ctaSub}>Hablemos 30 minutos. Te decimos qué tiene más sentido para tu situación.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Escribinos por WhatsApp <ArrowRight size={15} />
              </a>
              <Link href="/empresa/contacto" className={s.btnGhost}>
                Ver formas de contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
