import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import MusicHero, { type Track } from '@/components/ui/scroll-locked-video-hero';

export const metadata: Metadata = {
  title: 'Nosotros — Areté Soluciones',
  description: 'Quiénes somos, el Principio Areté y por qué diseñamos sistemas que se adaptan a la empresa, no al revés.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const PRINCIPIOS = [
  {
    n: '01',
    title: 'Si no entendemos el proceso, no podemos automatizarlo',
    body: 'Cada proyecto empieza con inmersión en la operación real. Nunca con un documento de requerimientos escrito por el cliente.',
  },
  {
    n: '02',
    title: 'Si no sabemos qué problema resolvemos, no desarrollamos',
    body: 'Antes de construir cualquier cosa, sabemos exactamente qué fricción va a desaparecer y quién va a sentir la diferencia.',
  },
  {
    n: '03',
    title: 'Si una tecnología no genera impacto, no la implementamos',
    body: 'No vendemos herramientas. Si la solución más efectiva para un problema es una planilla bien diseñada, eso entregamos.',
  },
  {
    n: '04',
    title: 'Si podemos simplificar antes de automatizar, simplificamos',
    body: 'Automatizar un proceso mal diseñado solo produce errores más rápido. El orden correcto es: diseñar, simplificar, automatizar.',
  },
  {
    n: '05',
    title: 'Si el sistema obliga a la empresa a trabajar peor para poder usarlo, diseñamos mal',
    body: 'Un sistema que no adopta el equipo es un gasto, no una inversión. Si no funciona en la práctica real, volvemos al diseño.',
  },
];

// Mismos 5 principios de mas abajo en esta pagina, reusados como
// contenido real de la lista del hero — el componente pegado traia
// nombres de bandas/canciones inventados, que no tienen nada que ver
// con Areté. Nada de contenido nuevo: es texto que ya existe en esta
// misma pagina, solo que tambien se muestra aca.
const NOSOTROS_TRACKS: Track[] = PRINCIPIOS.map((p) => ({
  id: p.n,
  title: p.title,
  artist: `Principio ${p.n}`,
  colorA: '#5C9AFF',
  colorB: '#0b407d',
}));

export default function NosotrosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <MusicHero
        videoSrc="/video_hero_nosotros.mp4"
        backgroundSrc="/1.png"
        title="Partimos de la empresa. Siempre."
        tracks={NOSOTROS_TRACKS}
        signature={false}
      />

      {/* ── EL NOMBRE ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Por qué "Areté"</p>
                <h2 className={s.sectionTitle}>Una palabra griega que no tiene traducción exacta</h2>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                En griego antiguo, <em style={{ fontStyle: 'normal', color: '#f2efe9' }}>Areté</em> significa excelencia en el propio oficio. No excelencia en general, sino la expresión máxima de lo que alguien está hecho para hacer.
              </p>
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Lo elegimos como nombre porque describe exactamente lo que buscamos en cada proyecto: que la empresa funcione de la manera más excelente posible para lo que <em style={{ fontStyle: 'normal', color: '#f2efe9' }}>esa empresa en particular</em> necesita. No un modelo genérico. No una plantilla de industria. Su versión propia de funcionar bien.
              </p>
              <blockquote style={{
                margin: 0,
                padding: '0 0 0 20px',
                borderLeft: '2px solid #1a6fff',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: 17,
                lineHeight: 1.6,
                color: 'rgba(242,239,233,0.78)',
              }}>
                Por eso el sistema se adapta a la empresa, no la empresa al sistema.
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRINCIPIO ARETÉ ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El Principio Areté</p>
            <h2 className={s.sectionTitle}>Cinco reglas que no se negocian</h2>
            <p className={s.sectionSub}>
              Cada proyecto que tomamos cumple estos cinco criterios. Son la diferencia entre entregar algo que funciona y entregar algo que parece que funciona.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PRINCIPIOS.map((p, i) => (
              <div
                key={p.n}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: 48,
                  padding: '40px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <div>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(26,111,255,0.5)' }}>{p.n}</span>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', color: '#f2efe9', lineHeight: 1.3, textWrap: 'balance' } as React.CSSProperties}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.5)' }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            "Empezamos entendiendo la operación real. Recién cuando tenemos ese mapa elegimos las herramientas, como <em>consecuencia</em> del diseño."
          </p>
          <span className={s.quoteAuthor}>Areté Soluciones · Forma de trabajar</span>
        </div>
      </section>

      {/* ── PARA QUIÉN TRABAJAMOS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El cliente que buscamos</p>
                <h2 className={s.sectionTitle}>No trabajamos con todos</h2>
                <p className={s.sectionSub}>
                  Tenemos un perfil de cliente muy definido. Si no hay un match real, lo decimos en la primera conversación.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                {
                  title: 'Sí trabajamos con',
                  items: [
                    'Empresas mid-market con múltiples áreas diferenciadas',
                    'CEOs que sienten que la operación los controla a ellos',
                    'Negocios que crecieron y los procesos no acompañaron',
                    'Organizaciones con equipo establecido y operación en marcha',
                  ],
                  color: '#1a6fff',
                },
                {
                  title: 'No trabajamos con',
                  items: [
                    'Micro-emprendimientos o proyectos unipersonales',
                    'Empresas sin operación establecida todavía',
                    'Quienes buscan software como solución mágica',
                    'Proyectos donde el problema aún no está definido',
                  ],
                  color: 'rgba(242,239,233,0.2)',
                },
              ].map(({ title, items, color }) => (
                <div
                  key={title}
                  className={`${s.reveal}`}
                  data-reveal=""
                  style={{
                    padding: '32px 0',
                    borderTop: '1px solid rgba(242,239,233,0.07)',
                  }}
                >
                  <p style={{ margin: '0 0 16px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color }}>{title}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(item => (
                      <li key={item} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.6, color: 'rgba(242,239,233,0.58)' }}>
                        <span style={{ width: 5, height: 5, background: color, flexShrink: 0, marginTop: 7, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Tiene sentido hablar?</h2>
            <p className={s.ctaSub}>30 minutos para entender si hay un problema que podemos resolver.</p>
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
