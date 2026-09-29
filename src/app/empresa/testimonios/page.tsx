import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import { AutoplayVideo } from '../_autoplay-video';
import { waUrl, WA_MSG_GENERAL } from '../_content';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { LogoVideo } from '@/components/propuesta/LogoVideo';

const WA = waUrl(WA_MSG_GENERAL);

export default function TestimoniosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ── Hero ── */}
      <section className={s.pageHero} style={{ isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.pageHeroInner} style={{ position: 'relative', zIndex: 1 }}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Casos reales</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ maxWidth: 720 }}>
            No lo contamos nosotros.<br /><em>Lo cuenta quien trabaja con nosotros.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="" style={{ maxWidth: 560 }}>
            Un caso real: qué construimos para Centro Jurídico NOA, y qué dice Rodrigo Reyes sobre trabajar con Areté.
          </p>
        </div>
      </section>

      {/* ── Caso: Centro Jurídico NOA ── */}
      <div className={s.band}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48, maxWidth: 760 }}>
            <p className={s.bandNum}>Centro Jurídico NOA · Jujuy, Argentina</p>
            <h2 className={s.sectionTitle}>Excel, Notion, Calendar y WhatsApp.<br /><em>Ahora, una sola pantalla.</em></h2>
          </div>

          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ maxWidth: 760, margin: '0 auto 64px' }}>
            <div className={s.glowCard}>
              <span className={s.glowCardBadge}>Testimonio real</span>
              <div className={s.glowCardInner}>
                <LogoVideo
                  src="/testimonios/noa-testimonio.mp4"
                  poster="/testimonios/noa-testimonio-poster.jpg"
                  rounded={false}
                />
              </div>
            </div>
            <p className={s.bandNum} style={{ margin: '20px 0 0', textAlign: 'center' }}>Rodrigo Reyes — Centro Jurídico NOA</p>
          </div>
        </div>

        <div className={s.bandGrid}>
          <div className={`${s.reveal} ${s.revealDelay2}`} data-reveal="">
            <p className={s.bandBody}>
              Centro Jurídico NOA llevaba cada caso en Excel, coordinaba al equipo por WhatsApp,
              agendaba en Google Calendar y guardaba notas en Notion. Cuatro herramientas, cuatro
              lugares distintos — y nadie con la foto completa del estudio.
            </p>
            <p className={s.bandBody}>
              Le construimos un ERP a medida que junta todo eso en un solo sistema: cada caso
              asignado a su abogado, las tareas repartidas entre empleados, secretaría y
              procuradores, y las finanzas del estudio — mensuales, gastos, salidas y cobros —
              controladas desde el mismo lugar donde se gestiona el caso.
            </p>
          </div>

          <div className={`${s.reveal} ${s.revealDelay2}`} data-reveal="">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Gestión de casos por abogado',
                'Tareas asignadas a empleados, secretaría y procuradores',
                'Toda la información del estudio, centralizada',
                'Control financiero: mensuales, gastos, salidas y cobros',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(242,239,233,0.65)', fontFamily: 'var(--f-texto)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6" stroke="rgba(47,123,246,0.5)" strokeWidth="1.2" />
                    <path d="M4.5 7l1.8 1.8L9.5 5" stroke="rgba(47,123,246,1)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 28 }}>
              <Link href="/empresa/agentes-ia" className={s.btnGhost}>
                Probar el agente en desarrollo <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Antes / Ahora ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.bandNum}>El cambio</p>
            <h2 className={s.sectionTitle}>Cuatro herramientas sueltas.<br /><em>Un solo sistema.</em></h2>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(242,239,233,0.04)' }}>
              {[
                { before: 'Excel', after: 'Gestión de casos por abogado' },
                { before: 'WhatsApp', after: 'Tareas asignadas al equipo' },
                { before: 'Google Calendar', after: 'Agenda dentro del mismo sistema' },
                { before: 'Notion', after: 'Toda la información centralizada' },
              ].map((row) => (
                <div key={row.before} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'center',
                  padding: '18px 24px', borderBottom: '1px solid rgba(242,239,233,0.06)',
                }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: 'rgba(242,239,233,0.32)', textDecoration: 'line-through', textAlign: 'right' }}>{row.before}</span>
                  <ArrowRight size={14} color="rgba(47,123,246,0.5)" />
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 700, color: '#5C9AFF' }}>{row.after}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── El estudio, por fuera ── */}
      <div className={s.band}>
        <div className={`${s.bandGrid} ${s.bandGridFlip}`} style={{ alignItems: 'center' }}>
          <div className={`${s.bandRight} ${s.reveal}`} data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={s.glowCard} style={{ maxWidth: 220 }}>
              <div className={s.glowCardInner} style={{ aspectRatio: '9/16' }}>
                <AutoplayVideo
                  src="/testimonios/noa-demo.mp4"
                  poster="/testimonios/noa-demo-poster.jpg"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <p className={s.bandNum}>El estudio</p>
            <h2 className={s.bandTitle}>Así es Centro Jurídico NOA,<br /><em>por fuera.</em></h2>
            <p className={s.bandBody}>
              El estudio donde antes convivían cuatro herramientas sueltas, y ahora hay un ERP a
              medida que ordena cada caso, cada tarea y cada peso. El agente de voz con
              inteligencia artificial es el siguiente paso, y ya está en desarrollo.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Querés ser el próximo caso?</h2>
            <p className={s.ctaSub}>Empezamos con un diagnóstico. Sin compromiso, sin presión.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar por WhatsApp <ArrowRight size={15} />
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
