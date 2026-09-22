'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { checkPassword, notifyAcceptance } from './actions';
import { ElevenLabsWidget } from '@/components/ui/elevenlabs-widget';

// ── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, style = {} }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const { ref, visible } = useReveal();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, to]);
  return (
    <span ref={ref}>
      {prefix}{val.toLocaleString('es-AR')}{suffix}
    </span>
  );
}

// ── Password gate ────────────────────────────────────────────────────────────
function PasswordGate() {
  const [pwd, setPwd]   = useState('');
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
    <div style={{
      minHeight: '100dvh',
      background: '#05050A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,111,255,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(242,239,233,0.08)',
        padding: '52px 44px',
        position: 'relative',
        animation: shake ? 'shake 0.4s ease' : 'none',
        clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Lock icon */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, marginBottom: 24,
            background: 'rgba(26,111,255,0.1)',
            border: '1px solid rgba(26,111,255,0.25)',
            clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#1a6fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ margin: '0 0 8px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#1a6fff' }}>
            Areté Soluciones
          </p>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#F2EFE9', letterSpacing: '-0.03em' }}>
            Propuesta Dax Cards
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(242,239,233,0.38)' }}>
            Documento confidencial · Solo para Santino
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(242,239,233,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Clave de acceso
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError(false); }}
              placeholder="••••••••"
              required
              autoFocus
              style={{
                display: 'block',
                width: '100%',
                padding: '15px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(242,239,233,0.1)'}`,
                color: '#F2EFE9',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                letterSpacing: '0.12em',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(239,68,68,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Clave incorrecta. Revisá con el equipo de Areté.
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !pwd}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '15px',
              background: pending ? 'rgba(26,111,255,0.3)' : !pwd ? 'rgba(26,111,255,0.2)' : '#1a6fff',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: pending ? 'wait' : !pwd ? 'default' : 'pointer',
              transition: 'background 0.25s',
              fontFamily: 'inherit',
              clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
            }}
          >
            {pending ? 'Verificando…' : 'Ver propuesta →'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
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

// ── Proposal ─────────────────────────────────────────────────────────────────
const WHAT_IT_DOES = [
  { icon: '🎙️', title: 'Escucha en tiempo real', desc: 'Procesa la voz del usuario sin lag, con comprensión del contexto de la conversación.' },
  { icon: '⚡', title: 'Resuelve al instante', desc: 'Activación de tarjetas, orientación de uso, preguntas frecuentes — sin esperar a nadie.' },
  { icon: '🎫', title: 'Genera tickets automáticos', desc: 'Los casos complejos se derivan al equipo humano con contexto completo de la llamada.' },
  { icon: '🔒', title: 'Solo información real', desc: 'El agente responde únicamente con información confirmada. No inventa, no improvisa.' },
];

const INCLUDES = [
  'Base de datos propia del agente',
  'Grabación y transcripción de cada llamada (30 días)',
  'Encriptación de datos end-to-end',
  'Panel de visualización de conversaciones',
  'Sistema de gestión de tickets para casos complejos',
];

const DEV_ITEMS = ['Diseño y entrenamiento del agente', 'Integración en la web de Dax', 'Panel de visualización', 'Sistema de tickets'];
const MAINT_ITEMS = ['Infraestructura y API de voz', 'Actualizaciones del agente', 'Soporte técnico', 'Acceso al panel 24/7'];

function ProposalContent({ agentId }: { agentId: string }) {
  const [accepted,  setAccepted]  = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [pending, start] = useTransition();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAccept = () => {
    setAccepting(true);
    start(async () => {
      await notifyAcceptance();
      setAccepted(true);
      setAccepting(false);
    });
  };

  const headerScrolled = scrollY > 60;

  return (
    <div style={{ minHeight: '100dvh', background: '#05050A', color: '#F2EFE9', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 32px',
        height: headerScrolled ? 52 : 68,
        background: headerScrolled ? 'rgba(5,5,10,0.96)' : 'transparent',
        borderBottom: headerScrolled ? '1px solid rgba(242,239,233,0.06)' : '1px solid transparent',
        backdropFilter: headerScrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: 'rgba(26,111,255,0.15)', border: '1px solid rgba(26,111,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)',
            flexShrink: 0,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.6)' }}>
            Areté Soluciones
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '4px 12px', fontSize: 11, fontWeight: 600,
            background: 'rgba(26,111,255,0.1)', border: '1px solid rgba(26,111,255,0.25)',
            color: '#1a6fff', letterSpacing: '0.08em',
            clipPath: 'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)',
          }}>
            CONFIDENCIAL
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Animated grid background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(26,111,255,0.08)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        {/* Gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,111,255,0.12) 0%, transparent 65%)',
            top: '-10%', left: '-5%',
            animation: 'float1 8s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)',
            bottom: '5%', right: '10%',
            animation: 'float2 10s ease-in-out infinite',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '120px 32px 80px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
          <div style={{ animation: 'fadeUp 0.8s ease 0.1s both' }}>
            <p style={{ margin: '0 0 24px', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(26,111,255,0.1)', border: '1px solid rgba(26,111,255,0.25)', fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a6fff' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a6fff', animation: 'blink 1.5s ease-in-out infinite' }} />
              Propuesta técnica · Dax Cards
            </p>
          </div>

          <div style={{ animation: 'fadeUp 0.8s ease 0.2s both' }}>
            <h1 style={{ margin: '0 0 28px', fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: '#F2EFE9' }}>
              Soporte por voz.<br />
              <span style={{ background: 'linear-gradient(135deg, #1a6fff 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                24 horas al día.
              </span>
            </h1>
          </div>

          <div style={{ animation: 'fadeUp 0.8s ease 0.35s both' }}>
            <p style={{ margin: '0 0 48px', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.7, color: 'rgba(242,239,233,0.55)', maxWidth: 560 }}>
              Un agente de inteligencia artificial entrenado sobre Dax Cards que atiende a tus usuarios por voz, en tiempo real, sin esperas y sin horario.
            </p>
          </div>

          <div style={{ animation: 'fadeUp 0.8s ease 0.5s both', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 24px',
              background: 'rgba(26,111,255,0.12)', border: '1px solid rgba(26,111,255,0.3)',
              clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em' }}>USD&nbsp;1.500</span>
              <span style={{ fontSize: 13, color: 'rgba(242,239,233,0.45)', lineHeight: 1.4 }}>inversión<br />de desarrollo</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 24px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(242,239,233,0.08)',
              clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
            }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em' }}>USD&nbsp;150</span>
              <span style={{ fontSize: 13, color: 'rgba(242,239,233,0.45)', lineHeight: 1.4 }}>por mes<br />mantenimiento</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeUp 1s ease 1.2s both' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.25)' }}>scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(26,111,255,0.6), transparent)', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── Stats band ── */}
      <section style={{ padding: '80px 32px', borderTop: '1px solid rgba(242,239,233,0.06)', borderBottom: '1px solid rgba(242,239,233,0.06)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: 'rgba(242,239,233,0.05)' }}>
          {[
            { val: 0, label: 'Tiempo de espera', suffix: ' seg', prefix: '' },
            { val: 24, label: 'Horas disponible', suffix: '/7', prefix: '' },
            { val: 30, label: 'Días de transcripciones', suffix: ' días', prefix: '' },
            { val: 2,  label: 'Semanas de implementación', suffix: ' sem', prefix: '~' },
          ].map(({ val, label, suffix, prefix }) => (
            <Reveal key={label} style={{ background: '#05050A', padding: '36px 32px' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#F2EFE9', marginBottom: 8 }}>
                <Counter to={val} prefix={prefix} suffix={suffix} />
              </div>
              <p style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.3)' }}>{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Qué hace ── */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a6fff' }}>01 — Capacidades</p>
            <h2 style={{ margin: '0 0 64px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Qué hace el agente
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {WHAT_IT_DOES.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div style={{
                  padding: '36px 32px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(242,239,233,0.07)',
                  clipPath: 'polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)',
                  transition: 'background 0.2s, border-color 0.2s',
                  height: '100%',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
                  <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{item.title}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.45)' }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Qué incluye ── */}
      <section style={{ padding: '100px 32px', background: 'rgba(26,111,255,0.02)', borderTop: '1px solid rgba(26,111,255,0.08)', borderBottom: '1px solid rgba(26,111,255,0.08)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <Reveal>
            <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a6fff' }}>02 — Entregables</p>
            <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Todo lo que<br />incluye
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: 'rgba(242,239,233,0.45)' }}>
              El desarrollo incluye infraestructura propia, no dependencias de plataformas externas que puedan cambiar precios o condiciones.
            </p>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INCLUDES.map((item, i) => (
              <Reveal key={item} delay={i * 70}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 24px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(242,239,233,0.07)',
                  clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
                }}>
                  <div style={{ width: 24, height: 24, flexShrink: 0, background: 'rgba(26,111,255,0.12)', border: '1px solid rgba(26,111,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a6fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(242,239,233,0.7)' }}>{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inversión ── */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a6fff' }}>03 — Inversión</p>
            <h2 style={{ margin: '0 0 64px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Precio claro,<br />sin sorpresas
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {/* Desarrollo */}
            <Reveal delay={0}>
              <div style={{
                padding: '48px 40px',
                border: '1px solid rgba(242,239,233,0.1)',
                clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)',
                height: '100%', boxSizing: 'border-box',
              }}>
                <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.35)' }}>Desarrollo</p>
                <div style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: 4 }}>
                  USD 1.500
                </div>
                <p style={{ margin: '0 0 32px', fontSize: 13, color: 'rgba(242,239,233,0.4)' }}>50% al inicio · 50% al entregar</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {DEV_ITEMS.map(i => (
                    <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'rgba(242,239,233,0.5)', alignItems: 'center' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a6fff', flexShrink: 0 }} />{i}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Mantenimiento */}
            <Reveal delay={120}>
              <div style={{
                padding: '48px 40px',
                border: '1px solid rgba(26,111,255,0.35)',
                background: 'rgba(26,111,255,0.05)',
                clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)',
                position: 'relative', overflow: 'hidden',
                height: '100%', boxSizing: 'border-box',
              }}>
                <div style={{ position: 'absolute', top: 16, right: 20 }}>
                  <span style={{ padding: '3px 10px', background: 'rgba(26,111,255,0.2)', border: '1px solid rgba(26,111,255,0.4)', fontSize: 10, fontWeight: 700, color: '#1a6fff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mensual</span>
                </div>
                <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a6fff' }}>Mantenimiento</p>
                <div style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: 4 }}>
                  USD 150
                </div>
                <p style={{ margin: '0 0 32px', fontSize: 13, color: 'rgba(242,239,233,0.4)' }}>por mes · desde el segundo mes</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MAINT_ITEMS.map(i => (
                    <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'rgba(242,239,233,0.5)', alignItems: 'center' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a6fff', flexShrink: 0 }} />{i}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Plazo ── */}
      <section style={{ padding: '80px 32px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(242,239,233,0.05)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Reveal>
            <p style={{ margin: '0 0 12px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a6fff' }}>04 — Tiempo</p>
            <h2 style={{ margin: '0 0 48px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em' }}>
              1 a 2 semanas
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 620 }}>
            {[
              { week: 'Semana 1', desc: 'Entrenamiento del agente e integración técnica en la web de Dax.' },
              { week: 'Semana 2', desc: 'Pruebas con casos reales, ajustes y entrega final operativa.' },
            ].map((w, i) => (
              <Reveal key={w.week} delay={i * 100}>
                <div style={{ padding: '28px 28px', border: '1px solid rgba(242,239,233,0.07)', clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}>
                  <p style={{ margin: '0 0 10px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#1a6fff' }}>{w.week}</p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.45)' }}>{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(242,239,233,0.25)', fontFamily: 'ui-monospace, monospace' }}>
              * El plazo corre desde la confirmación y el primer pago.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', width: 800, height: 800, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,111,255,0.07) 0%, transparent 65%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          }} />
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {accepted ? (
            <Reveal>
              <div style={{
                padding: '56px 48px',
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.25)',
                clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)',
              }}>
                <div style={{
                  width: 64, height: 64, margin: '0 auto 24px',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Propuesta aceptada</h2>
                <p style={{ margin: 0, fontSize: 16, color: 'rgba(242,239,233,0.5)', lineHeight: 1.65 }}>
                  El equipo de Areté fue notificado. Te contactamos en las próximas horas para coordinar el inicio.
                </p>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <p style={{ margin: '0 0 16px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a6fff' }}>¿Arrancamos?</p>
              <h2 style={{ margin: '0 0 20px', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                Tu soporte,<br />sin límite de horario.
              </h2>
              <p style={{ margin: '0 0 48px', fontSize: 16, color: 'rgba(242,239,233,0.45)', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.65 }}>
                Al aceptar notificamos al equipo. En las próximas horas coordinamos inicio, primer pago y kickoff.
              </p>
              <button
                onClick={handleAccept}
                disabled={accepting || pending}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '20px 48px',
                  background: accepting || pending
                    ? 'rgba(26,111,255,0.3)'
                    : 'linear-gradient(135deg, #1a6fff 0%, #2563eb 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 16, fontWeight: 700, letterSpacing: '0.04em',
                  cursor: accepting || pending ? 'wait' : 'pointer',
                  transition: 'opacity 0.2s, transform 0.15s',
                  fontFamily: 'inherit',
                  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
                  boxShadow: '0 0 40px rgba(26,111,255,0.3)',
                }}
              >
                {accepting || pending ? 'Enviando…' : 'Acepto la propuesta'}
                {!accepting && !pending && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 32px', borderTop: '1px solid rgba(242,239,233,0.06)', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 24, height: 24, background: 'rgba(26,111,255,0.12)', border: '1px solid rgba(26,111,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'rgba(242,239,233,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Areté Soluciones
            </span>
          </div>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'rgba(242,239,233,0.2)' }}>
            aretesoluciones.space · Confidencial
          </span>
        </div>
      </footer>

      {/* ── ElevenLabs widget ── */}
      {agentId && <ElevenLabsWidget agentId={agentId} />}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%,100% { transform: translate(-5%, -10%) scale(1); }
          50%      { transform: translate(-5%, -10%) scale(1.06); }
        }
        @keyframes float2 {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        @keyframes scrollLine {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50%  { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(1) translateY(20px); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        @media (max-width: 640px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function DaxCardsClient({ unlocked, agentId }: { unlocked: boolean; agentId: string }) {
  if (!unlocked) return <PasswordGate />;
  return <ProposalContent agentId={agentId} />;
}
