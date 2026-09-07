import type { Metadata } from 'next';
import Link from 'next/link';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import { MaskTitle } from '@/components/empresa/MaskTitle';
import { Founders } from '@/components/empresa/nosotros/Founders';
import { PrincipiosDetalle } from '@/components/empresa/nosotros/PrincipiosDetalle';
import { waLink } from '../constants';

export const metadata: Metadata = {
  title: 'Nosotros — Areté Soluciones',
  description: 'Quiénes somos, el Principio Areté y por qué diseñamos sistemas que se adaptan a la empresa, no al revés.',
};

const WA = waLink('Hola, me interesa saber más sobre Areté Soluciones');

export default function NosotrosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero} style={{ background: 'var(--sombra)' }}>
        <div className={s.pageHeroInner}>
          <MaskTitle
            as="h1"
            trigger="load"
            className={s.heroTitle}
            lines={['Partimos de la empresa.', <em key="e">Siempre.</em>]}
          />
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            No somos una agencia de software. No somos una consultora de procesos. Somos el equipo que diseña cómo
            debería funcionar tu operación y lo construye.
          </p>
        </div>
      </section>

      {/* ── EL NOMBRE ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Por qué &quot;Areté&quot;</p>
                <h2 className={s.sectionTitle}>Una palabra griega que no tiene traducción exacta</h2>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'var(--hueso-mute)' }}>
                En griego antiguo, <em style={{ fontStyle: 'normal', color: 'var(--hueso)' }}>Areté</em> significa
                excelencia en el propio oficio. No excelencia en general, sino la expresión máxima de lo que alguien
                está hecho para hacer.
              </p>
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'var(--hueso-mute)' }}>
                Lo elegimos como nombre porque describe exactamente lo que buscamos en cada proyecto: que la empresa
                funcione de la manera más excelente posible para lo que{' '}
                <em style={{ fontStyle: 'normal', color: 'var(--hueso)' }}>esa empresa en particular</em> necesita.
                No un modelo genérico. Su versión propia de funcionar bien.
              </p>
              <blockquote
                style={{
                  margin: 0,
                  padding: '0 0 0 20px',
                  borderLeft: '2px solid var(--azul)',
                  fontFamily: 'var(--f-texto), Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: 'var(--hueso)',
                }}
              >
                Por eso el sistema se adapta a la empresa, no la empresa al sistema.
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS — retratos, nunca texto encima ── */}
      <Founders />

      {/* ── EL PRINCIPIO ARETÉ, desarrollado ── */}
      <PrincipiosDetalle />

      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            &quot;Empezamos entendiendo la operación real. Recién cuando tenemos ese mapa elegimos las herramientas,
            como <em>consecuencia</em> del diseño.&quot;
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
                  Tenemos un perfil de cliente muy definido. Si no hay un match real, lo decimos en la primera
                  conversación.
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
                  color: 'var(--azul)',
                },
                {
                  title: 'No trabajamos con',
                  items: [
                    'Micro-emprendimientos o proyectos unipersonales',
                    'Empresas sin operación establecida todavía',
                    'Quienes buscan software como solución mágica',
                    'Proyectos donde el problema aún no está definido',
                  ],
                  color: 'var(--gris)',
                },
              ].map(({ title, items, color }) => (
                <div
                  key={title}
                  className={`${s.reveal}`}
                  data-reveal=""
                  style={{ padding: '32px 0', borderTop: '1px solid rgba(242,239,233,0.07)' }}
                >
                  <p style={{ margin: '0 0 16px', fontFamily: 'var(--f-mono), ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color }}>
                    {title}
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.6, color: 'var(--hueso-mute)' }}>
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
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btn}>
                Hablar con el equipo
              </a>
              <Link href="/empresa/servicios" className={s.btnSec}>
                Ver servicios y precios
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
