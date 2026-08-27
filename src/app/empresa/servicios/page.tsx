import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Formación comercial, mentoría individual, auditoría y programas corporativos para equipos de ventas de alto rendimiento.',
};

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const SERVICES = [
  {
    num: '01',
    tag: 'Equipo · 12 semanas',
    title: 'Formación Comercial',
    headline: 'El método completo para equipos que quieren vender diferente.',
    body: 'Un programa estructurado que transforma la forma en que tu equipo entiende y conduce una conversación comercial. Nada de guiones de memoria: aprendemos a escuchar, diagnosticar y proponer soluciones que el cliente ya quería antes de que abrieras la boca.',
    body2: 'Cada semana combina contenido teórico, ejercicios prácticos en vivo y revisión de casos reales del equipo. El avance se mide por resultados, no por tiempo en pantalla.',
    pull: 'La conversación que cierra es la que resuelve el problema antes de pedir el sí.',
    items: ['12 módulos progresivos', 'Ejercicios prácticos semanales', 'Revisión de llamadas reales', 'Acceso de por vida al material'],
  },
  {
    num: '02',
    tag: 'Individual · Ongoing',
    title: 'Mentoría 1:1',
    headline: 'Para quienes ya saben vender y quieren llegar al siguiente nivel.',
    body: 'Sesiones individuales con un mentor que ya atravesó los mismos casos que tenés adelante. No es coaching genérico: es análisis de situaciones concretas, simulación de conversaciones y ajuste fino de tu estilo comercial.',
    body2: 'Trabajamos sobre tus leads reales, tus objeciones reales y tu forma de comunicar. La sesión no termina cuando se acaba el tiempo, sino cuando la estructura quedó incorporada.',
    pull: 'El que mira sin hablar no aprende. El que habla sin que lo corrijan tampoco.',
    items: ['Sesiones de 60 minutos', 'Roleplay de conversaciones', 'Análisis de llamadas propias', 'WhatsApp de seguimiento entre sesiones'],
  },
  {
    num: '03',
    tag: 'Diagnóstico · 2-3 semanas',
    title: 'Auditoría Comercial',
    headline: 'Antes de cambiar algo, entendé qué está fallando y dónde.',
    body: 'Analizamos en profundidad tu proceso de ventas actual: desde cómo llegan los leads hasta por qué se caen antes del cierre. Revisamos llamadas, mensajes, propuestas y el sistema de seguimiento.',
    body2: 'Entregamos un informe detallado con los puntos de fuga identificados y un plan de acción con prioridades claras. Sin tecnicismos, sin consultora-speak: acciones concretas para la semana siguiente.',
    pull: 'Los equipos que más venden no tienen más leads — tienen menos fugas.',
    items: ['Análisis de llamadas y mensajes', 'Mapeo del proceso actual', 'Informe de puntos de fuga', 'Plan de acción priorizado'],
  },
  {
    num: '04',
    tag: 'Empresa · A medida',
    title: 'Programa Corporativo',
    headline: 'Para equipos de 10 o más vendedores que necesitan un sistema, no un curso.',
    body: 'Diseñamos e implementamos un programa de formación completamente personalizado para tu empresa, tu industria y tu proceso de ventas. Desde el diagnóstico inicial hasta el seguimiento post-implementación.',
    body2: 'Incluye formación del equipo, acompañamiento a líderes comerciales y revisiones periódicas para asegurar que el método quede instalado en la cultura del equipo.',
    pull: 'La escala no se consigue replicando vendedores — se consigue instalando el método.',
    items: ['Diagnóstico inicial gratuito', 'Programa 100% personalizado', 'Formación de líderes comerciales', 'Seguimiento trimestral incluido'],
  },
];

export default function ServiciosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* Hero */}
      <div className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.pageHeroLabel} ${s.reveal}`} data-reveal="">
            <span className={s.pageHeroLabelLine} />
            <span className={s.pageHeroLabelText}>Servicios</span>
          </div>
          <h1 className={`${s.pageHeroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            No vendemos el mismo programa a todos
          </h1>
          <p className={`${s.pageHeroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Cada servicio responde a un momento distinto de tu equipo. Empezamos siempre entendiendo dónde estás parado.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="">
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Agendar diagnóstico gratuito <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Servicios — bandas */}
      {SERVICES.map((svc, i) => (
        <section
          key={svc.num}
          className={s.section}
          style={{ borderTop: '1px solid rgba(242,239,233,0.06)' }}
        >
          <div className={s.inner}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
              gap: 80,
              alignItems: 'start',
            }}>
              {/* Número + kicker */}
              <div
                className={`${s.reveal}`}
                data-reveal=""
                style={{ order: i % 2 === 0 ? 0 : 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <span style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 48,
                    fontWeight: 800,
                    color: 'rgba(26,111,255,0.15)',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                  }}>{svc.num}</span>
                  <div>
                    <span style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      color: '#1a6fff',
                    }}>{svc.tag}</span>
                    <h2 style={{
                      margin: '6px 0 0',
                      fontWeight: 800,
                      fontSize: 'clamp(22px, 2.4vw, 30px)',
                      letterSpacing: '-0.03em',
                      color: '#f2efe9',
                    }}>{svc.title}</h2>
                  </div>
                </div>

                <p style={{
                  margin: '0 0 20px',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: 'rgba(242,239,233,0.7)',
                }}>{svc.headline}</p>

                <p style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.75, color: 'rgba(242,239,233,0.52)' }}>{svc.body}</p>
                <p style={{ margin: '0 0 28px', fontSize: 15, lineHeight: 1.75, color: 'rgba(242,239,233,0.52)' }}>{svc.body2}</p>

                <blockquote style={{
                  margin: '0 0 36px',
                  padding: '0 0 0 20px',
                  borderLeft: '1px solid rgba(242,239,233,0.12)',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'rgba(242,239,233,0.72)',
                }}>{svc.pull}</blockquote>

                <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                  Consultar por este servicio <ArrowRight size={14} />
                </a>
              </div>

              {/* Lista de incluidos */}
              <div
                className={`${s.reveal} ${s.revealDelay1}`}
                data-reveal=""
                style={{ order: i % 2 === 0 ? 1 : 0 }}
              >
                <div style={{
                  padding: '40px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(242,239,233,0.07)',
                  clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
                }}>
                  <p style={{
                    margin: '0 0 24px',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: '#1a6fff',
                  }}>Incluye</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {svc.items.map((item) => (
                      <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: 15, color: 'rgba(242,239,233,0.7)', lineHeight: 1.5 }}>
                        <span style={{
                          marginTop: 5,
                          width: 6,
                          height: 6,
                          background: '#1a6fff',
                          flexShrink: 0,
                          clipPath: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
                        }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaBandTitle}>¿No sabés por dónde empezar?</h2>
            <p className={s.ctaBandSub}>Hablemos 30 minutos. Te decimos qué servicio tiene más sentido para tu situación.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Escribinos por WhatsApp <ArrowRight size={15} />
              </a>
              <Link href="/empresa/contacto" className={s.btnGhost}>
                Ver opciones de contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
