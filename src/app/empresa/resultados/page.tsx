import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

export const metadata: Metadata = {
  title: 'Resultados',
  description: 'Casos reales, métricas concretas y lo que dicen quienes pasaron por el método Areté.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const CASES = [
  {
    label: 'SaaS B2B · Argentina · 8 vendedores',
    challenge: 'El equipo generaba leads pero cerraba menos del 12%. Los vendedores seguían guiones y las conversaciones se sentían artificiales.',
    solution: 'Formación Comercial de 12 semanas con foco en diagnóstico de problemas y manejo de objeciones sin presión.',
    pull: 'La conversación dejó de sentirse como una venta y empezó a sentirse como una solución.',
    metrics: [
      { label: 'Tasa de cierre', before: '12%', after: '31%' },
      { label: 'Ciclo de venta', before: '45 días', after: '22 días' },
      { label: 'Ticket promedio', before: '$4.200', after: '$6.800' },
    ],
    flip: false,
  },
  {
    label: 'Consultora · Colombia · 3 setters',
    challenge: 'Los setters agendaban reuniones pero los leads llegaban mal calificados al closer. El 60% de las reuniones no llegaban a propuesta.',
    solution: 'Mentoría individual durante 2 meses con foco en calificación y transferencia de contexto setter-closer.',
    pull: 'La calidad del lead que llegaba al closer valía más que duplicar el volumen de reuniones.',
    metrics: [
      { label: 'Reuniones calificadas', before: '40%', after: '78%' },
      { label: 'Revenue trimestral', before: 'Base', after: '+110%' },
      { label: 'Tiempo de calificación', before: '40 min', after: '18 min' },
    ],
    flip: true,
  },
  {
    label: 'Agencia · México · 15 vendedores',
    challenge: 'Sin metodología común. Cada vendedor tenía su propio estilo y los resultados variaban enormemente entre personas.',
    solution: 'Programa Corporativo con diagnóstico inicial e implementación del método Areté en todo el equipo.',
    pull: 'Estandarizar el proceso no eliminó los estilos personales — los hizo más efectivos.',
    metrics: [
      { label: 'Vendedores sobre meta', before: '4 / 15', after: '11 / 15' },
      { label: 'Variación de resultados', before: '8× entre extremos', after: '3× entre extremos' },
      { label: 'Onboarding nuevos', before: '90 días', after: '30 días' },
    ],
    flip: false,
  },
];

const TESTIMONIOS = [
  { text: 'Lo que más me sorprendió fue que en dos semanas mis setters ya mostraban resultados. No es un curso de ideas: es un sistema que se puede implementar de inmediato.', firma: 'Gerente Comercial · SaaS · Buenos Aires' },
  { text: 'Venía de entrenamientos que me enseñaban qué decir. Areté me enseñó cómo pensar. La diferencia es brutal cuando estás en una conversación real.', firma: 'Setter Senior · Agencia Digital · Bogotá' },
  { text: 'El diagnóstico que hicieron antes de arrancar fue más valioso que muchos cursos. Identificaron exactamente dónde se caían nuestros leads.', firma: 'Fundador · Consultora B2B · Ciudad de México' },
];

export default function ResultadosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Resultados</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Números reales<br />de equipos reales
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            No prometemos resultados mágicos. Te mostramos lo que lograron otros equipos y cómo lo midieron.
          </p>
        </div>
      </section>

      {/* Casos en bandas */}
      {CASES.map((c) => (
        <div key={c.label} className={s.band}>
          <div className={`${s.bandGrid} ${c.flip ? s.bandGridFlip : ''}`}>
            {/* Contexto + pull */}
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.bandNum}>{c.label}</p>

              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.28)' }}>El problema</p>
                <p className={s.bandBody}>{c.challenge}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.28)' }}>La solución</p>
                <p className={s.bandBody}>{c.solution}</p>
              </div>

              <p className={s.bandPull}>{c.pull}</p>
            </div>

            {/* Métricas */}
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 24px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>Resultados medidos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(242,239,233,0.04)' }}>
                  {c.metrics.map((m) => (
                    <div key={m.label} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: 20,
                      alignItems: 'center',
                      padding: '16px 0',
                      borderBottom: '1px solid rgba(242,239,233,0.06)',
                    }}>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.38)' }}>{m.label}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.28)', textDecoration: 'line-through' }}>{m.before}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, fontWeight: 700, color: '#1a6fff' }}>{m.after}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Testimonios — quotes grandes */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 64 }}>
            <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#1a6fff' }}>Lo que dicen</p>
            <h2 className={s.sectionTitle}>En sus propias palabras</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TESTIMONIOS.map((t, i) => (
              <div
                key={t.firma}
                className={`${s.reveal} ${i % 2 === 1 ? s.revealDelay1 : ''}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  gap: 32,
                  padding: '48px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 48, color: 'rgba(26,111,255,0.4)', lineHeight: 1, marginTop: -8 }}>"</span>
                <div>
                  <p style={{ margin: '0 0 20px', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(17px, 2.2vw, 22px)', lineHeight: 1.55, color: 'rgba(242,239,233,0.82)' }}>{t.text}</p>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.3)' }}>{t.firma}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Cuándo es el turno de tu equipo?</h2>
            <p className={s.ctaSub}>Empezamos con un diagnóstico. Sin compromiso, sin presión.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Agendar diagnóstico <ArrowRight size={15} />
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
