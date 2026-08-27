import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from './corp.module.css';
import { RevealObserver } from './_reveal';

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const SERVICIOS = [
  {
    num: '01 — Formación',
    title: 'Entrenamiento con estructura',
    body1: 'La conversación comercial desarmada parte por parte: cómo abrir sin sonar a libreto, cómo entender el problema antes de proponer cualquier solución, y qué hacer cuando el precio aparece antes de tiempo.',
    body2: 'Doce semanas de trabajo real. Cada módulo cierra con un ejercicio que se practica. No hay avance por reproducción de video.',
    pull: 'Los guiones que vas a leer son los que usamos nosotros, con las palabras exactas.',
    meta: [
      { dt: 'Formato', dd: 'Manuales + práctica' },
      { dt: 'Duración', dd: <em>12</em> },
      { dt: 'Acceso', dd: 'Permanente' },
    ],
    panel: [
      'Desarmado completo de la conversación comercial',
      'Módulos de apertura, diagnóstico, objeciones y cierre',
      'Ejercicio práctico al final de cada unidad',
      'Revisión de llamadas reales del equipo',
      'Material de referencia de uso permanente',
    ],
    flip: false,
  },
  {
    num: '02 — Mentoría',
    title: 'Acompañamiento individual',
    body1: 'Sesiones 1:1 con alguien que ya atravesó el caso que tenés adelante. Se simula la conversación completa, se corta donde hace falta y se vuelve a empezar desde el punto exacto donde se rompió.',
    body2: 'La sesión no termina cuando se acaba el tiempo, sino cuando la estructura quedó incorporada y podés repetirla sin ayuda.',
    pull: 'El que mira sin hablar no aprende. El que habla sin que lo corrijan tampoco.',
    meta: [
      { dt: 'Modalidad', dd: '1:1 en vivo' },
      { dt: 'Sesiones', dd: <><em>60</em> min</> },
      { dt: 'Cupo', dd: <><em>Máx. 4</em></> },
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
    num: '03 — Corporativo',
    title: 'Sistema para equipos',
    body1: 'Para empresas con diez o más vendedores que necesitan un método común sin perder el estilo de cada persona. Diseñamos e implementamos el sistema desde el diagnóstico inicial hasta el seguimiento post-implementación.',
    body2: 'Incluye formación del equipo, acompañamiento a líderes comerciales y revisiones periódicas para asegurar que el método quede instalado en la cultura.',
    pull: 'La escala no se consigue replicando vendedores, se consigue instalando el método.',
    meta: [
      { dt: 'Equipo', dd: <><em>10+</em> personas</> },
      { dt: 'Plan', dd: 'A medida' },
      { dt: 'Seguimiento', dd: 'Trimestral' },
    ],
    panel: [
      'Diagnóstico inicial del proceso actual',
      'Programa 100% personalizado para tu industria',
      'Formación de líderes comerciales internos',
      'Implementación del método en el CRM',
      'Revisiones trimestrales de resultados',
    ],
    flip: false,
  },
];

export default function EmpresaHome() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ── HERO ── */}
      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Buenos Aires · 100% Remoto</span>
          </div>

          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Transformamos equipos<br />en máquinas de cierre
          </h1>

          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Formación comercial de alto rendimiento para empresas que venden soluciones, no productos.
          </p>

          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Agendar diagnóstico gratuito <ArrowRight size={14} />
            </a>
            <Link href="/empresa/servicios" className={s.btnGhost}>
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ── MANIFIESTO ── */}
      <section style={{ padding: '80px 0', borderTop: '1px solid rgba(242,239,233,0.06)' }}>
        <div className={s.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p style={{ margin: '0 0 16px', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  Por qué existimos
                </p>
                <h2 className={s.sectionTitle}>
                  Los equipos no fallan por falta de ganas
                </h2>
                <p className={s.sectionSub}>
                  Fallan porque nadie les enseñó a entender el problema antes de proponer la solución.
                </p>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.8, color: 'rgba(242,239,233,0.55)' }}>
                Areté nació en 2021 después de ver equipos llenos de energía perder oportunidades que merecían cerrar. No por producto malo, no por precio alto — sino porque la conversación se conducía mal desde el primer mensaje.
              </p>
              <p style={{ margin: '0 0 32px', fontSize: 15, lineHeight: 1.8, color: 'rgba(242,239,233,0.55)' }}>
                Hoy trabajamos con empresas de toda Latinoamérica que entendieron que el verdadero diferencial no está en el pitch, sino en la capacidad de escuchar, diagnosticar y proponer soluciones que el cliente ya quería antes de que abrieras la boca.
              </p>
              <div style={{ display: 'flex', gap: 48 }}>
                {[
                  { n: '+120', l: 'Empresas' },
                  { n: '+850', l: 'Vendedores' },
                  { n: '4.3×', l: 'Mejora promedio' },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <div className={s.bigStat}>
                      <span style={{ fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em', color: '#1a6fff', lineHeight: 1 }}>{n}</span>
                    </div>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.35)', display: 'block', marginTop: 4 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS EN BANDAS ── */}
      {SERVICIOS.map((svc) => (
        <div key={svc.num} className={s.band}>
          <div className={`${s.bandGrid} ${svc.flip ? s.bandGridFlip : ''}`}>
            {/* Texto */}
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.bandNum}>{svc.num}</p>
              <h2 className={s.bandTitle}>{svc.title}</h2>
              <p className={s.bandBody}>{svc.body1}</p>
              <p className={s.bandBody}>{svc.body2}</p>
              <p className={s.bandPull}>{svc.pull}</p>
              <dl className={s.meta}>
                {svc.meta.map((m, i) => (
                  <div key={i} className={s.metaItem}>
                    <dt className={s.metaDt}>{m.dt}</dt>
                    <dd className={s.metaDd}>{m.dd}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Panel */}
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  Incluye
                </p>
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

      {/* ── QUOTE ── */}
      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            "La conversación que cierra es la que <em>resuelve el problema</em> antes de pedir el sí."
          </p>
          <span className={s.quoteAuthor}>Método Areté · Principio fundamental</span>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Cuándo empieza tu equipo?</h2>
            <p className={s.ctaSub}>30 minutos de diagnóstico sin costo. Sin guión de ventas.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Escribinos por WhatsApp <ArrowRight size={15} />
              </a>
              <a href="tel:+541143215678" className={s.btnGhost}>
                Llamanos directo
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
