import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Quiénes somos, cómo trabajamos y por qué el método Areté produce resultados que se mantienen.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const TEAM = [
  {
    initials: 'DD',
    name: 'Diego Da Silva',
    role: 'Fundador & Director Comercial',
    body1: '12 años liderando equipos de ventas en empresas B2B de Argentina y Latinoamérica. Diseñó el método Areté después de ver que los equipos que fracasaban no lo hacían por falta de esfuerzo, sino por falta de estructura.',
    body2: 'Su especialidad es la apertura: cómo entrar en una conversación sin sonar a vendedor, y cómo hacer que el prospecto sienta que la solución fue idea suya.',
  },
  {
    initials: 'VO',
    name: 'Valeria Ortiz',
    role: 'Mentora Senior — Setter Track',
    body1: 'Ex-directora comercial en una empresa SaaS con más de 200 vendedores distribuidos en cinco países. Especialista en calificación de prospectos de alto valor y en la transición setter-closer.',
    body2: 'Formó equipos completos de outbound desde cero, incluyendo los procesos de onboarding que reducen el tiempo de ramping de 90 a 30 días.',
  },
  {
    initials: 'MR',
    name: 'Martín Rodas',
    role: 'Mentor Senior — Closer Track',
    body1: '8 años cerrando negocios B2B de ticket alto en sectores de tecnología, consultoría y servicios financieros. Hoy entrena a closers en cómo transformar objeciones en compromisos sin presionar.',
    body2: 'Su mayor contribución al método es el protocolo de manejo de objeciones: una estructura que no esquiva el "está caro" sino que lo convierte en una conversación sobre valor.',
  },
];

const PRINCIPIOS = [
  { n: '01', title: 'Práctica antes que teoría', body: 'Cada concepto va seguido de un ejercicio. Sin práctica guiada no hay incorporación real, solo conocimiento flotante que se olvida en la primera conversación difícil.' },
  { n: '02', title: 'Casos reales, no simulados', body: 'Trabajamos con las conversaciones y leads reales de cada persona. El aprendizaje que no se conecta a la realidad del vendedor no produce cambio.' },
  { n: '03', title: 'Resultados medibles', body: 'Definimos métricas desde el inicio. Si no podemos medir el impacto, no podemos decir que el trabajo funcionó.' },
  { n: '04', title: 'Método, no guion', body: 'Un guión memorizado muere ante la primera respuesta inesperada. Un método da respuestas a situaciones que no imaginaste.' },
];

export default function NosotrosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Nosotros</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Enseñamos a vender<br />resolviendo problemas
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Areté nació de una pregunta simple: ¿por qué los equipos que se esfuerzan no siempre cierran?
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className={s.section}>
        <div className={s.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#1a6fff' }}>2021 — Buenos Aires</p>
                <h2 className={s.sectionTitle}>Fundada por vendedores, para vendedores</h2>
                <p className={s.sectionSub}>No contratamos coaches sin experiencia comercial. Cada mentor tiene años de campo encima.</p>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.8, color: 'rgba(242,239,233,0.55)' }}>
                Areté Soluciones nació con una premisa: el vendedor promedio no falla por falta de producto o precio, sino porque nadie le enseñó a entender el problema del cliente antes de proponer la solución.
              </p>
              <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.8, color: 'rgba(242,239,233,0.55)' }}>
                Empezamos trabajando con equipos pequeños de startups argentinas. Hoy acompañamos empresas de toda Latinoamérica con un método que evolucionó conversación por conversación, error por error.
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
                "Areté" en griego antiguo significa excelencia en el propio oficio. Eso es lo que buscamos en cada vendedor: que sea excelente a su manera.
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo — bandas */}
      {TEAM.map((member, i) => (
        <div key={member.name} className={s.band}>
          <div className={`${s.bandGrid} ${i % 2 === 1 ? s.bandGridFlip : ''}`}>
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.bandNum}>{member.role}</p>
              <h2 className={s.bandTitle}>{member.name}</h2>
              <p className={s.bandBody}>{member.body1}</p>
              <p className={s.bandBody}>{member.body2}</p>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: 'rgba(26,111,255,0.1)',
                  border: '1px solid rgba(26,111,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 28,
                  color: '#1a6fff',
                  letterSpacing: '-0.02em',
                }}>
                  {member.initials}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Principios */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.34em', textTransform: 'uppercase', color: '#1a6fff' }}>Cómo pensamos</p>
            <h2 className={s.sectionTitle}>Los principios que guían cada sesión</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {PRINCIPIOS.map((p, i) => (
              <div
                key={p.n}
                className={`${s.reveal} ${i % 2 === 1 ? s.revealDelay1 : ''}`}
                data-reveal=""
                style={{
                  display: 'flex',
                  gap: 24,
                  padding: '36px 32px',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  borderRight: i % 2 === 0 ? '1px solid rgba(242,239,233,0.07)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, color: 'rgba(26,111,255,0.45)', flexShrink: 0, marginTop: 3 }}>{p.n}</span>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: '#f2efe9' }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: 'rgba(242,239,233,0.5)' }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>Conocé el método en persona</h2>
            <p className={s.ctaSub}>Una llamada de 30 minutos para ver si hay fit.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Agendar llamada <ArrowRight size={15} />
              </a>
              <Link href="/empresa/resultados" className={s.btnGhost}>
                Ver resultados
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
