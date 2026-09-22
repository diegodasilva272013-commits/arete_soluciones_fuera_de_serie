'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { checkPassword, notifyAcceptance } from './actions';
import { ElevenLabsWidget } from '@/components/ui/elevenlabs-widget';

// ── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#05050A',
  surface:  'rgba(255,255,255,0.03)',
  border:   'rgba(242,239,233,0.08)',
  blue:     '#1a6fff',
  blueDim:  'rgba(26,111,255,0.15)',
  blueBrd:  'rgba(26,111,255,0.3)',
  text:     '#F2EFE9',
  muted:    'rgba(242,239,233,0.45)',
  faint:    'rgba(242,239,233,0.22)',
  green:    '#22c55e',
  greenBg:  'rgba(34,197,94,0.08)',
  greenBrd: 'rgba(34,197,94,0.3)',
} as const;

// ── Password gate ────────────────────────────────────────────────────────────
function PasswordGate() {
  const [pwd, setPwd]       = useState('');
  const [error, setError]   = useState(false);
  const [pending, start]    = useTransition();
  const router              = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    start(async () => {
      const res = await checkPassword(pwd);
      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
        setPwd('');
      }
    });
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: C.surface,
        border: `1px solid ${C.border}`,
        padding: '48px 40px',
        clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)',
      }}>
        {/* Logo area */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, marginBottom: 20,
            background: C.blueDim, border: `1px solid ${C.blueBrd}`,
            clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.blue }}>
            Areté Soluciones
          </p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>
            Propuesta Dax Cards
          </h1>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Clave de acceso
          </label>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="••••••••"
            required
            autoFocus
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : C.border}`,
              color: C.text,
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
              animation: error ? 'shake 0.3s ease' : 'none',
            }}
          />
          {error && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(239,68,68,0.8)' }}>
              Clave incorrecta. Revisá con el equipo de Areté.
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !pwd}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '14px',
              background: pending ? C.blueDim : C.blue,
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: pending ? 'wait' : 'pointer',
              transition: 'background 0.2s, opacity 0.2s',
              opacity: !pwd ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {pending ? 'Verificando…' : 'Ver propuesta'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ── Proposal ─────────────────────────────────────────────────────────────────
const INCLUDES = [
  'Base de datos propia del agente',
  'Grabación y transcripción de cada llamada (30 días)',
  'Encriptación de datos',
  'Panel de visualización de conversaciones',
  'Sistema de gestión de tickets para casos complejos',
];

const WHAT_IT_DOES = [
  'Escucha y entiende la consulta del usuario en tiempo real',
  'Resuelve consultas simples: activación de tarjetas, orientación de uso',
  'Genera un ticket interno para problemas que requieren intervención humana',
  'Responde solo con información confirmada — no inventa ni improvisa',
];

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '56px 0', borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <p style={{ margin: '0 0 8px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.blue }}>
          {n}
        </p>
        <h2 style={{ margin: '0 0 32px', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function ProposalContent({ agentId }: { agentId: string }) {
  const [accepted,  setAccepted]  = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [pending, start] = useTransition();

  const handleAccept = () => {
    setAccepting(true);
    start(async () => {
      await notifyAcceptance();
      setAccepted(true);
      setAccepting(false);
    });
  };

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        background: 'rgba(5,5,10,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.blue }}>
              Areté Soluciones
            </span>
            <span style={{ color: C.faint }}>·</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Propuesta técnica</span>
          </div>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: C.faint }}>
            Sept 2026
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ padding: '72px 24px 56px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ margin: '0 0 16px', fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.blue }}>
            Confidencial · Solo para Dax Cards
          </p>
          <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Agente de soporte<br />
            <span style={{ color: C.blue }}>por voz, 24/7.</span>
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: C.muted, maxWidth: 560 }}>
            Un sistema de inteligencia artificial que atiende las consultas de los usuarios de Dax Cards por voz, en tiempo real, integrado directamente en la web.
          </p>
        </div>
      </div>

      {/* ── Sección 01: Qué es ── */}
      <Section n="01" title="Qué es">
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.muted, maxWidth: 600, margin: '0 0 24px' }}>
          Un agente conversacional de IA entrenado específicamente sobre Dax Cards. Cualquier usuario que ingrese a la web puede iniciar una llamada de voz y recibir asistencia inmediata, sin esperas, sin turnos, sin horario.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 1, background: C.border, border: `1px solid ${C.border}`,
        }}>
          {[
            ['Modalidad', 'Voz (tiempo real)'],
            ['Disponibilidad', '24 / 7'],
            ['Idioma', 'Español · Argentina'],
            ['Integración', 'Web Dax Cards'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: C.bg, padding: '20px 24px' }}>
              <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.faint }}>{label}</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Sección 02: Qué hace ── */}
      <Section n="02" title="Qué hace">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {WHAT_IT_DOES.map(item => (
            <li key={item} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Check />
              <span style={{ fontSize: 15, lineHeight: 1.6, color: C.muted }}>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Sección 03: Qué incluye ── */}
      <Section n="03" title="Qué incluye">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {INCLUDES.map(item => (
            <li key={item} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Check />
              <span style={{ fontSize: 15, lineHeight: 1.6, color: C.muted }}>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Sección 04: Alcance ── */}
      <Section n="04" title="Alcance inicial">
        <p style={{ fontSize: 16, lineHeight: 1.75, color: C.muted, maxWidth: 600 }}>
          El agente está entrenado para atención en <strong style={{ color: C.text }}>español, variante Argentina</strong>. El sistema está diseñado para ampliarse a otros idiomas o regiones en etapas posteriores sin rediseño de la arquitectura base.
        </p>
      </Section>

      {/* ── Sección 05: Inversión ── */}
      <Section n="05" title="Inversión">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Desarrollo */}
          <div style={{
            padding: '36px 32px',
            border: `1px solid ${C.border}`,
            clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
          }}>
            <p style={{ margin: '0 0 8px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.faint }}>Desarrollo</p>
            <p style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', color: C.text }}>
              USD 1.500
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: C.muted }}>Pago 50 % al inicio · 50 % al entregar</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Diseño y entrenamiento del agente', 'Integración en la web de Dax', 'Panel de visualización', 'Gestión de tickets'].map(i => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: C.muted, alignItems: 'flex-start' }}>
                  <Check />{i}
                </li>
              ))}
            </ul>
          </div>

          {/* Mantenimiento */}
          <div style={{
            padding: '36px 32px',
            border: `1px solid ${C.blueBrd}`,
            background: C.blueDim,
            clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
          }}>
            <p style={{ margin: '0 0 8px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.blue }}>Mantenimiento mensual</p>
            <p style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', color: C.text }}>
              USD 150
              <span style={{ fontSize: 16, fontWeight: 500, color: C.muted }}> / mes</span>
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: C.muted }}>A partir del segundo mes</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Infraestructura y API de voz', 'Actualizaciones del agente', 'Soporte técnico', 'Acceso al panel de conversaciones'].map(i => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: C.muted, alignItems: 'flex-start' }}>
                  <Check />{i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Sección 06: Plazo ── */}
      <Section n="06" title="Plazo de implementación">
        <div style={{ display: 'flex', gap: 1, background: C.border, border: `1px solid ${C.border}`, maxWidth: 480 }}>
          {[
            ['Semana 1', 'Entrenamiento del agente e integración técnica'],
            ['Semana 2', 'Pruebas, ajustes y entrega final'],
          ].map(([week, desc]) => (
            <div key={week} style={{ flex: 1, background: C.bg, padding: '24px 20px' }}>
              <p style={{ margin: '0 0 6px', fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.blue }}>{week}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.muted }}>{desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20, fontSize: 14, color: C.faint }}>
          El plazo corre desde la confirmación y el pago del 50 % inicial.
        </p>
      </Section>

      {/* ── CTA: Aceptar ── */}
      <section style={{ padding: '56px 24px 80px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {accepted ? (
            <div style={{
              padding: '36px 40px',
              background: C.greenBg,
              border: `1px solid ${C.greenBrd}`,
              clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 48, height: 48, flexShrink: 0,
                background: 'rgba(34,197,94,0.12)', border: `1px solid ${C.greenBrd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: C.text }}>
                  Propuesta aceptada
                </p>
                <p style={{ margin: 0, fontSize: 14, color: C.muted }}>
                  El equipo de Areté fue notificado. Te contactamos para coordinar el inicio.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>
                ¿Arrancamos?
              </h2>
              <p style={{ margin: '0 0 32px', fontSize: 16, color: C.muted, maxWidth: 480 }}>
                Al aceptar notificamos al equipo de Areté. En las próximas horas coordinamos el inicio del desarrollo.
              </p>
              <button
                onClick={handleAccept}
                disabled={accepting || pending}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '16px 32px',
                  background: accepting || pending ? C.blueDim : C.blue,
                  border: 'none',
                  color: '#fff',
                  fontSize: 15, fontWeight: 700, letterSpacing: '0.04em',
                  cursor: accepting || pending ? 'wait' : 'pointer',
                  transition: 'background 0.2s',
                  fontFamily: 'inherit',
                  clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
                }}
              >
                {accepting || pending ? 'Enviando…' : 'Acepto la propuesta'}
                {!accepting && !pending && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── ElevenLabs widget (solo si hay agentId) ── */}
      {agentId && <ElevenLabsWidget agentId={agentId} />}
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function DaxCardsClient({ unlocked, agentId }: { unlocked: boolean; agentId: string }) {
  if (!unlocked) return <PasswordGate />;
  return <ProposalContent agentId={agentId} />;
}
