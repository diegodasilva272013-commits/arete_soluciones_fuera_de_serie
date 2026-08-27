import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from './corp.module.css';
import { RevealObserver } from './_reveal';

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20el%20diagn%C3%B3stico%20de%20Aret%C3%A9%20Soluciones';

const DOLORES = [
  {
    title: 'La información no llega a tiempo',
    body: 'Para saber cómo viene el mes hay que preguntarle a tres personas. Cuando llega la respuesta, ya pasó el momento de decidir.',
  },
  {
    title: 'Las herramientas no se hablan entre sí',
    body: 'Cada área usa algo distinto. La misma información se carga dos o tres veces, en distintos formatos, con distintos criterios.',
  },
  {
    title: 'La operación depende de una persona',
    body: 'Si falta Juan, o se va, algo se frena. El conocimiento está en la cabeza de alguien, no en el sistema.',
  },
  {
    title: 'Crecieron los clientes, no los procesos',
    body: 'Lo que funcionaba con diez clientes no escala a cien. El equipo trabaja más horas para sostener el mismo resultado.',
  },
];

const ETAPAS = [
  { n: '01', title: 'Inmersión', body: 'Entendemos cómo funciona la empresa desde adentro. Hablamos con quien dirige y con quien ejecuta. No partimos de supuestos.' },
  { n: '02', title: 'Auditoría', body: 'Mapeamos la operación completa e identificamos dónde se pierde tiempo, información y dinero.' },
  { n: '03', title: 'Priorización', body: 'Pareto 80/20: dónde está el 20% de problemas que genera el 80% de la pérdida. Eso se resuelve primero.' },
  { n: '04', title: 'Arquitectura', body: 'Diseñamos cómo debería funcionar la empresa. Recién acá se elige tecnología, como consecuencia del diseño.' },
  { n: '05', title: 'Implementación', body: 'Construimos en orden de impacto. Cada entrega genera valor antes de que termine el proyecto.' },
  { n: '06', title: 'Evolución', body: 'Medimos, observamos y ajustamos. Un sistema que no evoluciona deja de ser útil.' },
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
            <span className={s.kickerLabel}>Areté Soluciones · Buenos Aires</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            No hacemos que tu empresa<br />se adapte al software
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Hacemos que el software se adapte a tu empresa.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Hablar con el equipo <ArrowRight size={14} />
            </a>
            <Link href="/empresa/metodologia" className={s.btnGhost}>
              Ver el método
            </Link>
          </div>
        </div>
      </section>

      {/* ── EL PROBLEMA ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El problema que existe en las empresas</p>
                <h2 className={s.sectionTitle}>Creciste, pero los procesos no acompañaron</h2>
                <p className={s.sectionSub}>
                  La mayoría de las empresas que nos contratan no tienen un problema de producto ni de mercado. Tienen un problema operativo que nadie se sentó a diseñar.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {DOLORES.map((d, i) => (
                <div
                  key={d.title}
                  className={`${s.reveal} ${i > 0 ? s.revealDelay1 : ''}`}
                  data-reveal=""
                  style={{
                    padding: '28px 0',
                    borderTop: '1px solid rgba(242,239,233,0.07)',
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr',
                    gap: 20,
                    alignItems: 'start',
                  }}
                >
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'rgba(26,111,255,0.5)', fontWeight: 700, paddingTop: 3 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 15, color: '#f2efe9', letterSpacing: '-0.01em' }}>{d.title}</h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: 'rgba(242,239,233,0.5)' }}>{d.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTE CENTRAL ── */}
      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            "La mayoría de los proveedores parten de una herramienta y buscan dónde ponerla. Nosotros partimos de <em>la empresa</em>."
          </p>
          <span className={s.quoteAuthor}>Areté Soluciones · Forma de trabajar</span>
        </div>
      </section>

      {/* ── MÉTODO — 6 ETAPAS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 60 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El método</p>
            <h2 className={s.sectionTitle}>Seis etapas. El orden no se altera.</h2>
            <p className={s.sectionSub}>
              No empezamos con un documento de requerimientos escrito por el cliente. Empezamos entendiendo la operación.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ETAPAS.map((e, i) => (
              <div
                key={e.n}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 48,
                  padding: '36px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <div>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(26,111,255,0.45)' }}>{e.n}</span>
                  <h3 style={{ margin: '8px 0 0', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: '#f2efe9' }}>{e.title}</h3>
                </div>
                <p style={{ margin: '20px 0 0', fontSize: 15, lineHeight: 1.75, color: 'rgba(242,239,233,0.52)' }}>{e.body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, display: 'flex', gap: 16 }}>
            <Link href="/empresa/metodologia" className={s.btnGhost}>
              Ver el método en detalle <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 ÁREAS ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 60 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Las cuatro áreas</p>
            <h2 className={s.sectionTitle}>Un circuito único,<br />no cuatro silos</h2>
            <p className={s.sectionSub}>
              Ventas, Marketing, Administración y Delivery no son departamentos separados. Son partes de un mismo sistema. Si una falla, las demás lo sienten.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(242,239,233,0.06)' }}>
            {[
              { area: 'Ventas', desc: 'Del primer contacto al cierre. Cómo llegan las oportunidades, cómo se califican y cómo se convierten.' },
              { area: 'Marketing', desc: 'Qué hace que los clientes correctos lleguen solos. Qué se mide, qué no, y qué dice ese número.' },
              { area: 'Administración', desc: 'Facturación, cobros, reportes. Dónde se pierde información y qué tarda más de lo que debería.' },
              { area: 'Delivery', desc: 'Cómo se entrega lo que se vendió. Dónde está el cuelllo de botella entre el sí del cliente y el resultado.' },
            ].map(({ area, desc }, i) => (
              <div
                key={area}
                className={`${s.reveal} ${i > 0 ? s.revealDelay1 : ''}`}
                data-reveal=""
                style={{ padding: '40px 32px', background: '#050505', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <span style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: '#1a6fff',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: '#f2efe9' }}>{area}</h3>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: 'rgba(242,239,233,0.48)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Reconocés alguno de esos problemas?</h2>
            <p className={s.ctaSub}>El diagnóstico empieza con una conversación de 30 minutos. Sin costo.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/servicios" className={s.btnGhost}>
                Ver servicios y precios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
