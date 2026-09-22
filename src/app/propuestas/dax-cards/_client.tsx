'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { checkPassword, notifyAcceptance } from './actions';
import { ElevenLabsWidget } from '@/components/ui/elevenlabs-widget';
import AnimatedGradient from '@/components/ui/animated-gradient';
import s from '../../empresa/corp.module.css';

// ── Scroll reveals (replica de RevealObserver para usar fuera de /empresa) ──
function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add(s.revealOn);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

// ── Password gate ────────────────────────────────────────────────────────────
function PasswordGate() {
  const [pwd, setPwd]     = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [pending, start]  = useTransition();
  const router            = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    start(async () => {
      const res = await checkPassword(pwd);
      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
        setShake(true);
        setPwd('');
        setTimeout(() => setShake(false), 500);
      }
    });
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <AnimatedGradient config={{ preset: 'Prism' }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: 'rgba(5,5,5,0.88)',
        border: '1px solid var(--linea)',
        padding: '52px 44px',
        backdropFilter: 'blur(24px)',
        clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
        animation: shake ? 'propShake 0.4s ease' : 'none',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image
            src="/LOGO_ARETE.png"
            alt="Areté Soluciones"
            width={160}
            height={46}
            style={{ height: 36, width: 'auto', objectFit: 'contain', margin: '0 auto 20px' }}
            priority
          />
          <p className={s.kickerLabel} style={{ marginBottom: 8 }}>Propuesta técnica confidencial</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display), Montserrat, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--hueso)' }}>
            Dax Cards
          </h1>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--ceniza)', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'var(--f-mono), monospace' }}>
            Clave de acceso
          </label>
          <input
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setError(false); }}
            placeholder="••••••••"
            required
            autoFocus
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box',
              padding: '15px 18px',
              background: 'rgba(242,239,233,0.03)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--linea)'}`,
              color: 'var(--hueso)',
              fontSize: 16,
              outline: 'none',
              fontFamily: 'inherit',
              letterSpacing: '0.1em',
              transition: 'border-color 0.2s',
            }}
          />

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(239,68,68,0.85)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.04em' }}>
              Clave incorrecta. Revisá con el equipo de Areté.
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !pwd}
            className={s.btnPrimary}
            style={{ marginTop: 12, justifyContent: 'center', opacity: !pwd ? 0.45 : 1, cursor: pending ? 'wait' : !pwd ? 'default' : 'pointer' }}
          >
            {pending ? 'Verificando…' : 'Ver propuesta'}
            {!pending && <ArrowRight size={13} />}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes propShake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

// ── Proposal content ─────────────────────────────────────────────────────────
const QUE_HACE = [
  { n: '01', t: 'Escucha en tiempo real',     d: 'Procesa la voz del usuario al instante, con comprensión completa del contexto de cada conversación.' },
  { n: '02', t: 'Resuelve al instante',        d: 'Activación de tarjetas, orientación de uso, preguntas frecuentes — sin esperar a ninguna persona.' },
  { n: '03', t: 'Tickets automáticos',         d: 'Los casos complejos se derivan al equipo humano con el contexto completo de la llamada grabada.' },
  { n: '04', t: 'Solo información real',       d: 'El agente responde únicamente con información confirmada sobre Dax Cards. No inventa, no improvisa.' },
];

const QUE_INCLUYE = [
  'Base de datos propia del agente',
  'Grabación y transcripción de cada llamada (30 días de historial)',
  'Encriptación de datos end-to-end',
  'Panel de visualización de conversaciones',
  'Sistema de gestión de tickets para casos complejos',
];

function ProposalContent({ agentId }: { agentId: string }) {
  const [accepted,  setAccepted]  = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleAccept = () => {
    setAccepting(true);
    start(async () => {
      await notifyAcceptance();
      setAccepted(true);
      setAccepting(false);
    });
  };

  return (
    <>
      <RevealObserver />

      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        height: scrolled ? 56 : 68,
        background: scrolled ? 'rgba(5,5,5,0.96)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--linea)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16,0.84,0.28,1)',
      }}>
        <Image
          src="/LOGO_ARETE.png"
          alt="Areté Soluciones"
          width={140}
          height={40}
          style={{ height: 30, width: 'auto', objectFit: 'contain' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className={s.kickerLabel}>Propuesta técnica · Dax Cards</span>
          <span style={{
            padding: '4px 12px', fontSize: 9, fontWeight: 500,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            fontFamily: 'var(--f-mono), monospace',
            color: 'var(--azul-luz)',
            border: '1px solid rgba(92,154,255,0.3)',
          }}>
            Confidencial
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={s.pageHero} style={{ paddingTop: 140, paddingBottom: 100, isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.pageHeroInner} style={{ position: 'relative', zIndex: 1 }}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Dax Cards · Septiembre 2026</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Soporte por voz,<br /><em>24 horas al día.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Un agente de inteligencia artificial entrenado sobre Dax Cards que atiende a tus usuarios por voz, en tiempo real, sin esperas y sin horario.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 1, background: 'var(--linea)' }}>
              {[
                { val: 'USD 1.500', sub: 'desarrollo' },
                { val: 'USD 150', sub: 'por mes' },
                { val: '1–2 sem.', sub: 'implementación' },
              ].map(({ val, sub }) => (
                <div key={val} style={{ padding: '16px 24px', background: '#050505' }}>
                  <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(17px,2vw,22px)', letterSpacing: '-0.03em', color: 'var(--hueso)' }}>{val}</div>
                  <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ceniza)', marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 01: Qué es ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>01 — Qué es</p>
            <h2 className={s.sectionTitle}>Un asesor de Dax<br /><em>que nunca duerme.</em></h2>
            <p className={s.sectionSub}>
              Cualquier usuario que ingrese a la web de Dax puede iniciar una llamada de voz y recibir asistencia inmediata. Sin turnos. Sin colas. Sin horario. Disponible en español, para Argentina, con ampliación posterior a otros idiomas o regiones.
            </p>
          </div>

          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 1, background: 'var(--linea)' }}>
            {[
              { label: 'Modalidad',       val: 'Voz · tiempo real' },
              { label: 'Disponibilidad',  val: '24 / 7' },
              { label: 'Idioma inicial',  val: 'Español · Argentina' },
              { label: 'Integración',     val: 'Web de Dax Cards' },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: '#050505', padding: '28px 32px' }}>
                <p className={s.bandNum} style={{ marginBottom: 8 }}>{label}</p>
                <p style={{ margin: 0, fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.025em', color: 'var(--hueso)' }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sección 02: Qué hace (bands) ── */}
      {QUE_HACE.map((item, i) => (
        <div key={item.n} className={s.band}>
          <div className={`${s.bandGrid} ${i % 2 === 1 ? s.bandGridFlip : ''}`}>
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.bandNum}>{item.n} — Capacidad</p>
              <h2 className={s.bandTitle}>{item.t}</h2>
              <p className={s.bandBody}>{item.d}</p>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p className={s.bandNum} style={{ marginBottom: 16, color: 'var(--azul)' }}>El agente</p>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, Georgia, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: '#B4B1AB' }}>
                  {item.d}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Sección 03: Qué incluye ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="">
              <p className={s.kickerLabel} style={{ marginBottom: 14 }}>03 — Entregables</p>
              <h2 className={s.sectionTitle}>Todo lo que<br /><em>incluye el proyecto.</em></h2>
              <p className={s.sectionSub}>
                El desarrollo incluye infraestructura propia — sin depender de plataformas externas que puedan cambiar precios o condiciones en el futuro.
              </p>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ padding: '40px', background: 'rgba(47,123,246,.04)', border: '1px solid rgba(47,123,246,.14)', clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)' }}>
              <p className={s.bandNum} style={{ marginBottom: 20, color: 'var(--azul)' }}>Incluido en el desarrollo</p>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {QUE_INCLUYE.map(item => (
                  <li key={item} className={s.panelItem}>
                    <span className={s.panelDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 04: Inversión ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>04 — Inversión</p>
            <h2 className={s.sectionTitle}>Precio claro,<br /><em>sin sorpresas.</em></h2>
          </div>

          <div className={s.splitGridTight}>
            {/* Desarrollo */}
            <div className={`${s.reveal}`} data-reveal="" style={{ padding: '48px 40px', border: '1px solid var(--linea)', borderRight: 'none', position: 'relative' }}>
              <p className={s.bandNum} style={{ marginBottom: 24 }}>Desarrollo</p>
              <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,52px)', letterSpacing: '-0.05em', color: 'var(--hueso)', marginBottom: 6 }}>
                USD 1.500
              </div>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.08em' }}>
                50% al inicio · 50% al entregar
              </p>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {['Diseño y entrenamiento del agente', 'Integración en la web de Dax', 'Panel de visualización', 'Sistema de gestión de tickets'].map(item => (
                  <li key={item} className={s.panelItem}>
                    <span className={s.panelDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mantenimiento */}
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ padding: '48px 40px', border: '1px solid rgba(47,123,246,.25)', background: 'rgba(47,123,246,.03)', position: 'relative' }}>
              <p className={s.bandNum} style={{ marginBottom: 24, color: 'var(--azul)' }}>Mantenimiento mensual</p>
              <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(36px,5vw,52px)', letterSpacing: '-0.05em', color: 'var(--hueso)', marginBottom: 6 }}>
                USD 150<span style={{ fontSize: 18, fontWeight: 500, color: 'rgba(242,239,233,0.4)' }}> /mes</span>
              </div>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.08em' }}>
                A partir del segundo mes
              </p>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {['Infraestructura y API de voz', 'Actualizaciones del agente', 'Soporte técnico incluido', 'Acceso al panel de conversaciones'].map(item => (
                  <li key={item} className={s.panelItem}>
                    <span className={s.panelDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 05: Plazo ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>05 — Plazo</p>
            <h2 className={s.sectionTitle}>1 a 2 semanas<br /><em>desde la confirmación.</em></h2>
          </div>

          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 1, background: 'var(--linea)', maxWidth: 680 }}>
            {[
              { n: 'Semana 1', t: 'Entrenamiento e integración', d: 'Entrenamiento del agente con información de Dax e integración técnica en la web.' },
              { n: 'Semana 2', t: 'Pruebas y entrega',           d: 'Pruebas con casos reales, ajustes finales y entrega operativa del sistema.' },
            ].map((e) => (
              <div key={e.n} style={{ background: '#050505', padding: '36px 32px' }}>
                <p className={s.bandNum} style={{ marginBottom: 10 }}>{e.n}</p>
                <p style={{ margin: '0 0 10px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--hueso)' }}>{e.t}</p>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, Georgia, serif', fontWeight: 300, fontSize: 15, lineHeight: 1.65, color: '#B4B1AB' }}>{e.d}</p>
              </div>
            ))}
          </div>
          <p className={`${s.reveal}`} data-reveal="" style={{ marginTop: 20, fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ceniza)' }}>
            * El plazo corre desde la confirmación y el pago del 50% inicial.
          </p>
        </div>
      </section>

      {/* ── CTA / Aceptar ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          {accepted ? (
            <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 560, margin: '0 auto', padding: '48px 40px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.22)', clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 24px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className={s.ctaTitle} style={{ fontSize: 'clamp(26px,4vw,40px)', marginBottom: 12 }}>Propuesta aceptada</h2>
              <p className={s.ctaSub} style={{ marginBottom: 0 }}>El equipo de Areté fue notificado. Te contactamos en las próximas horas para coordinar el inicio.</p>
            </div>
          ) : (
            <div className={`${s.reveal}`} data-reveal="">
              <h2 className={s.ctaTitle}>¿Arrancamos?</h2>
              <p className={s.ctaSub}>Al aceptar notificamos al equipo. En las próximas horas coordinamos inicio, primer pago y kickoff.</p>
              <div className={s.ctaRow}>
                <button
                  onClick={handleAccept}
                  disabled={accepting || pending}
                  className={s.btnPrimary}
                  style={{ fontSize: 12, padding: '18px 40px', cursor: accepting || pending ? 'wait' : 'pointer', opacity: accepting || pending ? 0.6 : 1 }}
                >
                  {accepting || pending ? 'Enviando…' : 'Acepto la propuesta'}
                  {!accepting && !pending && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '36px 40px', borderTop: '1px solid var(--linea)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Image
          src="/LOGO_ARETE.png"
          alt="Areté Soluciones"
          width={100}
          height={28}
          style={{ height: 24, width: 'auto', objectFit: 'contain', opacity: 0.6 }}
        />
        <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ceniza)' }}>
          aretesoluciones.space · Documento confidencial
        </span>
      </footer>

      {agentId && <ElevenLabsWidget agentId={agentId} />}
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function DaxCardsClient({ unlocked, agentId }: { unlocked: boolean; agentId: string }) {
  if (!unlocked) return <PasswordGate />;
  return <ProposalContent agentId={agentId} />;
}
