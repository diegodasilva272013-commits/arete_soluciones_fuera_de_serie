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
    name: 'Diego Da Silva',
    role: 'Fundador & Director Comercial',
    bio: '12 años liderando equipos de ventas en empresas B2B de Argentina y Latinoamérica. Fundó Areté después de ver que los equipos no fallaban por falta de esfuerzo, sino por falta de método.',
  },
  {
    name: 'Valeria Ortiz',
    role: 'Mentora Senior — Setter Track',
    bio: 'Ex-directora comercial en una empresa SaaS con 200+ vendedores. Especialista en apertura de conversaciones y calificación de prospectos de alto valor.',
  },
  {
    name: 'Martín Rodas',
    role: 'Mentor Senior — Closer Track',
    bio: '8 años cerrando negocios B2B de ticket alto. Ahora entrena a closers en cómo transformar objeciones en compromisos sin presionar.',
  },
];

const VALUES = [
  {
    title: 'Práctica antes que teoría',
    body: 'Cada concepto va seguido de un ejercicio. Sin práctica guiada no hay incorporación real, solo conocimiento flotante que se olvida.',
  },
  {
    title: 'Casos reales, no simulados',
    body: 'Trabajamos con las conversaciones y leads reales de cada persona. El aprendizaje que no se conecta a la realidad del vendedor no produce cambio.',
  },
  {
    title: 'Resultados medibles',
    body: 'Definimos métricas desde el inicio. Si no podemos medir el impacto, no podemos decir que el trabajo funcionó.',
  },
  {
    title: 'Método, no guion',
    body: 'Un guión memorizado muere ante la primera respuesta inesperada. Un método da respuestas a situaciones que no imaginaste.',
  },
];

export default function NosotrosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* Hero */}
      <div className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.pageHeroLabel} ${s.reveal}`} data-reveal="">
            <span className={s.pageHeroLabelLine} />
            <span className={s.pageHeroLabelText}>Nosotros</span>
          </div>
          <h1 className={`${s.pageHeroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Enseñamos a vender<br />resolviendo problemas
          </h1>
          <p className={`${s.pageHeroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Areté nació de una pregunta simple: ¿por qué los equipos que se esfuerzan no siempre cierran? La respuesta, casi siempre, era la misma: falta de método, no de ganas.
          </p>
        </div>
      </div>

      {/* Historia */}
      <section className={s.section}>
        <div className={s.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div className={`${s.reveal}`} data-reveal="">
              <span className={s.eyebrow}>Nuestra historia</span>
              <h2 className={s.sectionTitle}>Fundada por vendedores, para vendedores</h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(242,239,233,0.55)', margin: '0 0 16px' }}>
                Areté Soluciones nació en 2021 en Buenos Aires con una premisa: el vendedor promedio no falla por falta de producto o precio, sino porque nadie le enseñó a entender el problema del cliente antes de proponer la solución.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(242,239,233,0.55)', margin: '0 0 32px' }}>
                Empezamos trabajando con equipos pequeños de startups argentinas. Hoy acompañamos empresas de toda Latinoamérica, con un método que evolucionó conversación por conversación, error por error.
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
                "Areté" en griego antiguo significa excelencia en el propio oficio. Eso es lo que buscamos: que cada vendedor sea excelente en lo que hace, a su manera.
              </blockquote>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: 'rgba(242,239,233,0.07)',
                clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
              }}>
                {[
                  { num: '2021', label: 'Año de fundación' },
                  { num: '+40', label: 'Países de alcance' },
                  { num: '3', label: 'Mentores senior' },
                  { num: '100%', label: 'Remoto' },
                ].map(({ num, label }) => (
                  <div key={label} style={{ padding: '40px 32px', background: '#050505', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em', color: '#1a6fff', lineHeight: 1 }}>{num}</span>
                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.4)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionHead} ${s.reveal}`} data-reveal="">
            <span className={s.eyebrow}>El equipo</span>
            <h2 className={s.sectionTitle}>Mentores que vendieron antes de enseñar</h2>
            <p className={s.sectionSub}>No contratamos coaches sin experiencia comercial. Cada mentor tiene años de campo encima.</p>
          </div>
          <div className={s.grid3}>
            {TEAM.map((member, i) => (
              <div
                key={member.name}
                className={`${s.card} ${s.reveal} ${i === 1 ? s.revealDelay1 : i === 2 ? s.revealDelay2 : ''}`}
                data-reveal=""
              >
                {/* Avatar placeholder */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(26,111,255,0.12)',
                  border: '1px solid rgba(26,111,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#1a6fff',
                }}>
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className={s.cardTitle}>{member.name}</h3>
                <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a6fff' }}>{member.role}</p>
                <p className={s.cardBody}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionHead} ${s.sectionHeadCenter} ${s.reveal}`} data-reveal="">
            <span className={s.eyebrow}>Cómo pensamos</span>
            <h2 className={s.sectionTitle}>Los principios que guían cada sesión</h2>
          </div>
          <div className={s.grid2}>
            {VALUES.map((val, i) => (
              <div
                key={val.title}
                className={`${s.reveal} ${i % 2 === 1 ? s.revealDelay1 : ''}`}
                data-reveal=""
                style={{
                  display: 'flex',
                  gap: 24,
                  padding: '32px',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                }}
              >
                <span style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'rgba(26,111,255,0.5)',
                  flexShrink: 0,
                  marginTop: 4,
                }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16, color: '#f2efe9' }}>{val.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: 'rgba(242,239,233,0.52)' }}>{val.body}</p>
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
            <h2 className={s.ctaBandTitle}>Conocé el método en persona</h2>
            <p className={s.ctaBandSub}>Una llamada de 30 minutos para ver si hay fit entre lo que necesitás y lo que hacemos.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Agendar llamada <ArrowRight size={15} />
              </a>
              <Link href="/empresa/resultados" className={s.btnGhost}>
                Ver resultados reales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
