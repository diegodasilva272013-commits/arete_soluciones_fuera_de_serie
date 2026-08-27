import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

export const metadata: Metadata = {
  title: 'Resultados',
  description: 'Casos reales, números concretos y testimonios de equipos que transformaron su performance comercial con Areté.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const STATS = [
  { num: '+120', label: 'Empresas formadas', sub: 'En 5 años de operación' },
  { num: '+850', label: 'Vendedores entrenados', sub: 'De Argentina, México, Colombia y más' },
  { num: '4.3×', label: 'Mejora en tasa de cierre', sub: 'Promedio 90 días post-programa' },
  { num: '98%', label: 'Satisfacción de clientes', sub: 'NPS medido al finalizar cada programa' },
];

const CASES = [
  {
    company: 'SaaS B2B · Argentina',
    size: 'Equipo de 8 vendedores',
    challenge: 'El equipo generaba muchos leads pero cerraba menos del 12%. Los vendedores seguían guiones y las conversaciones se sentían artificiales.',
    solution: 'Programa de Formación Comercial de 12 semanas con foco en diagnóstico de problemas y manejo de objeciones sin presión.',
    result: 'La tasa de cierre subió al 31% en los primeros 90 días. El ciclo de venta se redujo de 45 días promedio a 22.',
    metrics: [
      { label: 'Tasa de cierre', before: '12%', after: '31%' },
      { label: 'Ciclo de venta', before: '45 días', after: '22 días' },
      { label: 'Ticket promedio', before: '$4.200', after: '$6.800' },
    ],
  },
  {
    company: 'Consultora · Colombia',
    size: 'Equipo de 3 setters',
    challenge: 'Los setters agendaban reuniones pero los leads llegaban mal calificados al closer. El 60% de las reuniones no llegaban a propuesta.',
    solution: 'Programa de Mentoría Individual durante 2 meses con foco en calificación y en cómo transferir contexto entre setter y closer.',
    result: 'Las reuniones bien calificadas subieron del 40% al 78%. El revenue del equipo creció 2.1× en el trimestre siguiente.',
    metrics: [
      { label: 'Reuniones calificadas', before: '40%', after: '78%' },
      { label: 'Revenue trimestral', before: 'Base', after: '+110%' },
      { label: 'Tiempo de calificación', before: '40 min', after: '18 min' },
    ],
  },
  {
    company: 'Agencia de Marketing · México',
    size: '15 vendedores regionales',
    challenge: 'Equipo grande, sin metodología común. Cada vendedor tenía su propio estilo y los resultados variaban enormemente entre personas.',
    solution: 'Programa Corporativo con diagnóstico inicial, implementación del método Areté y formación de 2 líderes comerciales internos.',
    result: 'Se estandarizó el proceso sin perder el estilo personal de cada vendedor. La variación entre el mejor y peor vendedor se redujo 60%.',
    metrics: [
      { label: 'Variación de resultados', before: 'Alta (8×)', after: 'Reducida (3×)' },
      { label: 'Vendedores sobre meta', before: '4/15', after: '11/15' },
      { label: 'Onboarding nuevos', before: '90 días', after: '30 días' },
    ],
  },
];

const TESTIMONIALS = [
  {
    text: 'Lo que más me sorprendió fue que en dos semanas mis setters ya mostraban resultados. No es un curso de ideas: es un sistema que se puede implementar de inmediato.',
    name: 'Gerente Comercial',
    company: 'SaaS · Buenos Aires',
  },
  {
    text: 'Venía de entrenamientos que me enseñaban qué decir. Areté me enseñó cómo pensar. La diferencia es brutal cuando estás en una conversación real.',
    name: 'Setter Senior',
    company: 'Agencia Digital · Bogotá',
  },
  {
    text: 'El diagnóstico que hicieron antes de arrancar fue más valioso que muchos cursos. Identificaron exactamente dónde se caían nuestros leads.',
    name: 'Fundador',
    company: 'Consultora B2B · Ciudad de México',
  },
];

export default function ResultadosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* Hero */}
      <div className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.pageHeroLabel} ${s.reveal}`} data-reveal="">
            <span className={s.pageHeroLabelLine} />
            <span className={s.pageHeroLabelText}>Resultados</span>
          </div>
          <h1 className={`${s.pageHeroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Números reales de equipos reales
          </h1>
          <p className={`${s.pageHeroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            No prometemos resultados mágicos. Te mostramos lo que lograron otros equipos y cómo lo midieron.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={`${s.statsGrid} ${s.reveal}`} data-reveal="">
        {STATS.map(({ num, label, sub }) => (
          <div key={label} className={s.statItem}>
            <span className={s.statNum}><em>{num}</em></span>
            <span className={s.statLabel}>{label}</span>
            <span style={{ fontSize: 11, color: 'rgba(242,239,233,0.3)', letterSpacing: '0.04em' }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Casos */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionHead} ${s.reveal}`} data-reveal="">
            <span className={s.eyebrow}>Casos de estudio</span>
            <h2 className={s.sectionTitle}>Tres equipos, tres situaciones distintas</h2>
            <p className={s.sectionSub}>El contexto importa. Por eso mostramos el problema, la solución y el resultado en cada caso.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {CASES.map((c, i) => (
              <div
                key={c.company}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  padding: '48px 48px',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                  border: '1px solid rgba(242,239,233,0.06)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 60,
                  alignItems: 'start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: 'rgba(26,111,255,0.1)',
                      border: '1px solid rgba(26,111,255,0.25)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#1a6fff',
                    }}>{c.company}</span>
                    <span style={{
                      padding: '4px 12px',
                      border: '1px solid rgba(242,239,233,0.1)',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(242,239,233,0.4)',
                    }}>{c.size}</span>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.3)' }}>El problema</p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(242,239,233,0.58)' }}>{c.challenge}</p>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.3)' }}>La solución</p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(242,239,233,0.58)' }}>{c.solution}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#1a6fff' }}>El resultado</p>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(242,239,233,0.78)', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{c.result}</p>
                  </div>
                </div>

                {/* Métricas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {c.metrics.map(m => (
                    <div key={m.label} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: 16,
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: 'rgba(5,5,5,0.6)',
                      borderTop: '1px solid rgba(242,239,233,0.06)',
                    }}>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.4)' }}>{m.label}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: 'rgba(242,239,233,0.35)', textDecoration: 'line-through' }}>{m.before}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, fontWeight: 700, color: '#1a6fff' }}>{m.after}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionHead} ${s.sectionHeadCenter} ${s.reveal}`} data-reveal="">
            <span className={s.eyebrow}>Lo que dicen</span>
            <h2 className={s.sectionTitle}>En sus propias palabras</h2>
          </div>
          <div className={s.grid3}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`${s.reveal} ${i === 1 ? s.revealDelay1 : i === 2 ? s.revealDelay2 : ''}`}
                data-reveal=""
                style={{
                  padding: '32px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(242,239,233,0.07)',
                  clipPath: 'polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <span style={{ color: '#1a6fff', fontSize: 28, lineHeight: 1, fontFamily: 'Georgia, serif' }}>"</span>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(242,239,233,0.72)', fontFamily: 'Georgia, serif', fontStyle: 'italic', flex: 1 }}>{t.text}</p>
                <div style={{ borderTop: '1px solid rgba(242,239,233,0.07)', paddingTop: 16 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#f2efe9' }}>{t.name}</p>
                  <p style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.35)' }}>{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaBandTitle}>¿Cuándo es el turno de tu equipo?</h2>
            <p className={s.ctaBandSub}>Empezamos con un diagnóstico gratuito. Sin compromiso, sin presión.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Agendar diagnóstico <ArrowRight size={15} />
              </a>
              <Link href="/empresa/contacto" className={s.btnGhost}>
                Más formas de contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
