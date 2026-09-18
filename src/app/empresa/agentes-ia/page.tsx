'use client';

import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import AnimatedGradient from '@/components/ui/animated-gradient';

// ── Tipos ────────────────────────────────────────────────────────────────────

type CallStatus = 'idle' | 'connecting' | 'active' | 'error';

// ── AgentWidget — botón de llamada inline por agente ─────────────────────────

function AgentWidget({ agentId, label }: { agentId: string; label: string }) {
  const convRef = useRef<Conversation | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');

  const start = useCallback(async () => {
    if (status !== 'idle' && status !== 'error') return;
    setStatus('connecting');
    try {
      const conv = await Conversation.startSession({
        agentId,
        onConnect:    () => setStatus('active'),
        onDisconnect: () => { convRef.current = null; setStatus('idle'); },
        onError:      () => setStatus('error'),
      });
      convRef.current = conv;
    } catch {
      setStatus('error');
    }
  }, [agentId, status]);

  const stop = useCallback(async () => {
    await convRef.current?.endSession();
    convRef.current = null;
    setStatus('idle');
  }, []);

  const isActive = status === 'active';
  const isBusy   = status === 'connecting';
  const isError  = status === 'error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Visualizador de ondas — solo cuando está activo */}
      {isActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          height: 36, padding: '0 8px',
        }}>
          {[0.6, 1, 0.8, 1.2, 0.7, 1, 0.9].map((h, i) => (
            <span key={i} style={{
              display: 'block',
              width: 3,
              height: `${h * 24}px`,
              borderRadius: 3,
              background: 'rgba(47,123,246,0.8)',
              animation: `agWave 0.9s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.09}s`,
            }} />
          ))}
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={isActive ? stop : start}
        disabled={isBusy}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 28px', height: 58, borderRadius: 999,
          background: isActive
            ? 'rgba(239,68,68,0.12)'
            : isError
            ? 'rgba(239,68,68,0.10)'
            : 'rgba(47,123,246,0.10)',
          border: `1.5px solid ${
            isActive ? 'rgba(239,68,68,0.6)'  :
            isError  ? 'rgba(239,68,68,0.45)' :
                       'rgba(47,123,246,0.4)'
          }`,
          color: '#F2EFE9',
          cursor: isBusy ? 'wait' : 'pointer',
          transition: 'all 0.25s ease',
          fontFamily: 'var(--f-display, Montserrat, sans-serif)',
          fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          outline: 'none',
          position: 'relative',
        }}
      >
        {/* Pulso cuando activo */}
        {isActive && (
          <>
            <span style={{
              position: 'absolute', inset: -5, borderRadius: 999,
              border: '1px solid rgba(239,68,68,0.35)',
              animation: 'agPulse 1.8s ease-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: -10, borderRadius: 999,
              border: '1px solid rgba(239,68,68,0.15)',
              animation: 'agPulse 1.8s ease-out infinite',
              animationDelay: '0.5s',
            }} />
          </>
        )}

        {/* Ícono */}
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: isActive
            ? 'rgba(239,68,68,0.18)'
            : isError
            ? 'rgba(239,68,68,0.12)'
            : 'rgba(47,123,246,0.15)',
          border: `1px solid ${
            isActive ? 'rgba(239,68,68,0.5)'  :
            isError  ? 'rgba(239,68,68,0.35)' :
                       'rgba(47,123,246,0.4)'
          }`,
        }}>
          {isBusy ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(47,123,246,0.8)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'agSpin 0.8s linear infinite' }}/>
            </svg>
          ) : isActive ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(239,68,68,0.9)" stroke="none">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(47,123,246,1)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8"  y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </span>

        <span style={{
          color: isActive ? 'rgba(239,68,68,0.9)' :
                 isError  ? 'rgba(239,68,68,0.8)' :
                            'rgba(242,239,233,0.9)',
        }}>
          {isBusy  ? 'Conectando...'  :
           isActive ? `Colgar a ${label}` :
           isError  ? 'Reintentar'    :
                      `Llamar a ${label}`}
        </span>
      </button>

      {isActive && (
        <p style={{
          fontSize: 12, color: 'rgba(242,239,233,0.35)',
          fontFamily: 'var(--f-mono)', letterSpacing: '0.1em',
          textTransform: 'uppercase', margin: 0,
        }}>
          En llamada · hablá con el agente
        </p>
      )}

      <style>{`
        @keyframes agPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0;   }
        }
        @keyframes agWave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
        @keyframes agSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Datos de los agentes demo ─────────────────────────────────────────────────

const AGENTS = [
  {
    id:       'agent_2201m2rsjgx9ebyvymfzxgce71ef',
    nombre:   'Yacón',
    tipo:     'Restaurante',
    tagline:  'Atención al cliente · Reservas · Menú del día',
    emoji:    '🍽️',
    desc:     'Asistente de voz para gastronomía. Responde consultas sobre el menú del día, gestiona reservas, informa horarios y captura pedidos en tiempo real — todo sin intervención humana.',
    caps: [
      'Consulta de menú y carta del día',
      'Reservas de mesa con confirmación',
      'Horarios y ubicación del local',
      'Registro automático de pedidos',
    ],
    accentColor: 'rgba(234,88,12,1)',
    accentBg:    'rgba(234,88,12,0.07)',
    accentBorder:'rgba(234,88,12,0.2)',
    label: 'Yacón',
  },
  {
    id:       'agent_3301m2r6j4vdehetg6346v5njx37',
    nombre:   'Payma',
    tipo:     'Inmobiliaria',
    tagline:  'Consulta de propiedades · Disponibilidad · Logística',
    emoji:    '🏢',
    desc:     'Agente inmobiliario de voz. Qualifica prospectos, consulta el catálogo de propiedades, informa disponibilidad, coordina visitas y registra cada interacción automáticamente.',
    caps: [
      'Consulta de propiedades disponibles',
      'Filtro por zona, precio y tipo',
      'Coordinación de visitas',
      'Registro y seguimiento del prospecto',
    ],
    accentColor: 'rgba(99,102,241,1)',
    accentBg:    'rgba(99,102,241,0.07)',
    accentBorder:'rgba(99,102,241,0.2)',
    label: 'Payma',
  },
  {
    id:       'agent_9801m2tg8136e28sbnjptxxq1841',
    nombre:   'Centro Jurídico NOA',
    tipo:     'Estudio Jurídico · Jujuy, Argentina',
    tagline:  'Consultas legales · Turnos · Derivación al abogado',
    emoji:    '⚖️',
    desc:     'Asistente jurídico de voz. Responde consultas legales frecuentes, agenda turnos con abogados, informa las áreas de práctica del estudio y deriva cada caso al profesional indicado — disponible las 24 hs.',
    caps: [
      'Consultas legales y orientación inicial',
      'Agendamiento de turnos con abogados',
      'Información de áreas de práctica',
      'Derivación inteligente por tipo de caso',
    ],
    accentColor: 'rgba(212,175,55,1)',
    accentBg:    'rgba(212,175,55,0.06)',
    accentBorder:'rgba(212,175,55,0.2)',
    label: 'Centro Jurídico NOA',
  },
  {
    id:       'agent_7301m2t40t5je97adt0egfrvb3qc',
    nombre:   'Mejor llama a Saúl',
    tipo:     'Estudio de Abogados · Montevideo, Uruguay',
    tagline:  'Consulta inicial · Calificación · Agenda de entrevistas',
    emoji:    '📋',
    desc:     'Agente de voz para estudio de abogados. Atiende la primera consulta, califica el tipo de caso, coordina la entrevista inicial con el letrado y captura todos los datos del cliente — sin tiempos de espera.',
    caps: [
      'Atención de consulta inicial del caso',
      'Calificación y clasificación por materia',
      'Coordinación de primera entrevista',
      'Captura y registro de datos del cliente',
    ],
    accentColor: 'rgba(16,185,129,1)',
    accentBg:    'rgba(16,185,129,0.06)',
    accentBorder:'rgba(16,185,129,0.2)',
    label: 'Saúl',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentesIAPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ── Hero ── */}
      <section className={s.pageHero} style={{ isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.pageHeroInner} style={{ position: 'relative', zIndex: 1 }}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>IA Conversacional · Demo en vivo</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal=""
            style={{ maxWidth: 720 }}>
            Nuestros agentes<br />de voz en acción
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal=""
            style={{ maxWidth: 560 }}>
            Probá en tiempo real los sistemas que implementamos. Cada agente responde, gestiona y registra — sin guiones, sin esperas, sin intervención humana.
          </p>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 720, marginBottom: 16 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 20 }}>Cómo funciona</p>
            <p style={{
              fontSize: 17, lineHeight: 1.75,
              color: 'rgba(242,239,233,0.65)',
              fontFamily: 'var(--f-texto)',
            }}>
              Estos son agentes reales operando en industrias reales. Hacé clic en <strong style={{ color: '#F2EFE9' }}>"Llamar"</strong> y hablá directamente con el sistema — sin formularios, sin demos grabadas. Lo que escuchás es exactamente lo que recibe el cliente final de cada empresa.
            </p>
          </div>
        </div>
      </section>

      {/* ── Agentes ── */}
      <section style={{ paddingBottom: 96 }}>
        <div className={s.inner}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 28,
          }}>
            {AGENTS.map(agent => (
              <div
                key={agent.id}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  border: `1px solid ${agent.accentBorder}`,
                  background: agent.accentBg,
                  borderRadius: 20,
                  padding: '36px 32px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  backdropFilter: 'blur(6px)',
                }}
              >
                {/* Header del card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{
                    fontSize: 36, lineHeight: 1,
                    background: 'rgba(242,239,233,0.06)',
                    border: `1px solid ${agent.accentBorder}`,
                    borderRadius: 14,
                    width: 64, height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {agent.emoji}
                  </span>
                  <div>
                    <p style={{
                      fontSize: 11, fontFamily: 'var(--f-mono)',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: agent.accentColor, marginBottom: 4,
                    }}>
                      {agent.tipo}
                    </p>
                    <h2 style={{
                      fontSize: 26, fontWeight: 800,
                      fontFamily: 'var(--f-display)',
                      color: '#F2EFE9', margin: 0, lineHeight: 1.1,
                    }}>
                      {agent.nombre}
                    </h2>
                    <p style={{
                      fontSize: 12, color: 'rgba(242,239,233,0.4)',
                      fontFamily: 'var(--f-mono)', letterSpacing: '0.1em',
                      marginTop: 5,
                    }}>
                      {agent.tagline}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <p style={{
                  fontSize: 15, lineHeight: 1.7,
                  color: 'rgba(242,239,233,0.6)',
                  fontFamily: 'var(--f-texto)',
                  margin: 0,
                }}>
                  {agent.desc}
                </p>

                {/* Capacidades */}
                <ul style={{
                  listStyle: 'none', margin: 0, padding: 0,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  {agent.caps.map(cap => (
                    <li key={cap} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 13, color: 'rgba(242,239,233,0.65)',
                      fontFamily: 'var(--f-texto)',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: agent.accentColor,
                      }} />
                      {cap}
                    </li>
                  ))}
                </ul>

                {/* Divisor */}
                <div style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${agent.accentBorder}, transparent)`,
                }} />

                {/* Widget */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <AgentWidget agentId={agent.id} label={agent.label} />
                </div>

                {/* Nota mic */}
                <p style={{
                  fontSize: 11, color: 'rgba(242,239,233,0.25)',
                  fontFamily: 'var(--f-mono)', letterSpacing: '0.08em',
                  textAlign: 'center', margin: 0,
                }}>
                  Requiere micrófono · Esta es una demo real en producción
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.section} style={{
        borderTop: '1px solid var(--linea)',
        background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(47,123,246,0.06) 0%, transparent 70%)',
      }}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="" style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
            <p className={s.kickerLabel} style={{ marginBottom: 20 }}>¿Lo querés para tu empresa?</p>
            <h2 style={{
              fontSize: 36, fontWeight: 800, fontFamily: 'var(--f-display)',
              color: '#F2EFE9', margin: '0 0 20px', lineHeight: 1.2,
            }}>
              Implementamos tu agente de voz en 2 semanas
            </h2>
            <p style={{
              fontSize: 16, lineHeight: 1.7, color: 'rgba(242,239,233,0.55)',
              fontFamily: 'var(--f-texto)', marginBottom: 36,
            }}>
              Diseñamos, entrenamos y desplegamos el sistema adaptado a tu industria, tu tono y tus procesos. Sin fricciones, sin código de tu lado.
            </p>
            <Link
              href="/empresa/contacto"
              className={s.btn}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              Hablemos de tu proyecto
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
