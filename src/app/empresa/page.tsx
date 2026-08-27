import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from './corp.module.css';
import { RevealObserver } from './_reveal';

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const SERVICES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    tag: 'Equipo',
    title: 'Formación Comercial',
    body: 'Programa estructurado de 12 semanas para equipos de ventas. Método real, ejercicios prácticos y seguimiento semanal.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    tag: 'Individual',
    title: 'Mentoría 1:1',
    body: 'Acompañamiento personalizado para setters y closers. Sesiones enfocadas en los casos reales que tenés adelante hoy.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    tag: 'Diagnóstico',
    title: 'Auditoría Comercial',
    body: 'Análisis completo de tu proceso de ventas actual. Identificamos los puntos de fuga y entregamos un plan de acción concreto.',
  },
];

const STATS = [
  { num: '+120', unit: '', label: 'Empresas formadas' },
  { num: '+850', unit: '', label: 'Vendedores entrenados' },
  { num: '4.3×', unit: '', label: 'Mejora promedio en cierre' },
  { num: '98', unit: '%', label: 'Satisfacción de clientes' },
];

const STEPS = [
  { n: '01', title: 'Diagnóstico', body: 'Analizamos tu equipo, proceso actual y principales bloqueos en 30 minutos.' },
  { n: '02', title: 'Plan a medida', body: 'Diseñamos el programa específico para tu realidad, no una plantilla genérica.' },
  { n: '03', title: 'Implementación', body: 'Arrancamos en la semana siguiente con sesiones prácticas y material real.' },
  { n: '04', title: 'Seguimiento', body: 'Acompañamiento continuo para que los resultados se consoliden en el tiempo.' },
];

export default function EmpresaHome() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        padding: '96px 0 80px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 90% at 15% 55%, rgba(26,111,255,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div className={s.inner} style={{ position: 'relative' }}>
          <p style={{
            margin: '0 0 24px',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: '#1a6fff',
          }}>
            Areté Soluciones · Buenos Aires
          </p>
          <h1 style={{
            margin: '0 0 28px',
            fontWeight: 800,
            fontSize: 'clamp(40px, 6vw, 76px)',
            lineHeight: 1.02,
            letterSpacing: '-0.045em',
            color: '#f2efe9',
            maxWidth: 740,
          }}>
            Transformamos equipos en<br />
            <span style={{ color: '#1a6fff' }}>máquinas de cierre</span>
          </h1>
          <p style={{
            margin: '0 0 48px',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(17px, 2vw, 22px)',
            lineHeight: 1.6,
            color: 'rgba(242,239,233,0.5)',
            maxWidth: 540,
          }}>
            Formación comercial de alto rendimiento para empresas que venden soluciones, no productos.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Agendar diagnóstico <ArrowRight size={15} />
            </a>
            <Link href="/empresa/servicios" className={s.btnGhost}>
              Ver servicios
            </Link>
          </div>
          <ul style={{
            margin: '48px 0 0',
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            gap: 32,
            flexWrap: 'wrap',
          }}>
            {['Sin guiones de memoria', 'Práctica real desde el día 1', '100% remoto'].map((item) => (
              <li key={item} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'rgba(242,239,233,0.45)',
              }}>
                <span style={{ width: 5, height: 5, background: '#1a6fff', flexShrink: 0, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className={`${s.statsGrid} ${s.reveal}`} data-reveal="">
        {STATS.map(({ num, unit, label }) => (
          <div key={label} className={s.statItem}>
            <span className={s.statNum}><em>{num}</em>{unit}</span>
            <span className={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── SERVICIOS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionHead} ${s.reveal}`} data-reveal="">
            <span className={s.eyebrow}>Qué hacemos</span>
            <h2 className={s.sectionTitle}>Tres formas de trabajar juntos</h2>
            <p className={s.sectionSub}>Cada modalidad responde a un momento distinto del equipo. No vendemos el mismo programa a todos.</p>
          </div>
          <div className={s.grid3}>
            {SERVICES.map((svc, i) => (
              <div
                key={svc.title}
                className={`${s.card} ${s.reveal} ${i === 1 ? s.revealDelay1 : i === 2 ? s.revealDelay2 : ''}`}
                data-reveal=""
              >
                <div className={s.cardIcon}>{svc.icon}</div>
                <h3 className={s.cardTitle}>{svc.title}</h3>
                <p className={s.cardBody}>{svc.body}</p>
                <span className={s.cardTag}>{svc.tag}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <Link href="/empresa/servicios" className={s.btnGhost}>
              Ver todos los servicios <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionHead} ${s.sectionHeadCenter} ${s.reveal}`} data-reveal="">
            <span className={s.eyebrow}>Cómo trabajamos</span>
            <h2 className={s.sectionTitle}>Del diagnóstico al resultado en 4 pasos</h2>
          </div>
          <div className={s.steps}>
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={`${s.step} ${s.reveal} ${i > 0 ? (i === 1 ? s.revealDelay1 : i === 2 ? s.revealDelay2 : s.revealDelay3) : ''}`}
                data-reveal=""
              >
                <div className={s.stepNum}>{step.n}</div>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="">
            <h2 className={s.ctaBandTitle}>¿Listo para escalar tu equipo?</h2>
            <p className={s.ctaBandSub}>
              30 minutos de diagnóstico sin costo. Sin presión, sin guión de ventas.
            </p>
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
