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
  {
    id:       'agent_3801m2tym6e2etat5aypjqykydty',
    nombre:   'Providus',
    tipo:     'Renta y Capitalización',
    tagline:  'Inversiones · Rendimientos · Planificación financiera',
    emoji:    '📈',
    desc:     'Asesor financiero de voz. Explica instrumentos de renta y capitalización, orienta sobre rendimientos, responde consultas de inversión y agenda reuniones con el equipo — disponible las 24 hs.',
    caps: [
      'Consultas sobre instrumentos de inversión',
      'Información de rendimientos y plazos',
      'Orientación en planificación financiera',
      'Agendamiento con asesores del equipo',
    ],
    accentColor: 'rgba(250,204,21,1)',
    accentBg:    'rgba(250,204,21,0.06)',
    accentBorder:'rgba(250,204,21,0.2)',
    label: 'Providus',
  },
  {
    id:       'agent_7801m2wntrk7ez2v2m3nyen8q66a',
    nombre:   'Rodrigo Reyes',
    tipo:     'Abogado · Consultor Patrimonial',
    tagline:  'Consultoría legal · Patrimonio · Protección de activos',
    emoji:    '🏛️',
    desc:     'Consultor patrimonial de voz. Asesora sobre protección de activos, planificación patrimonial y estrategias legales — responde consultas iniciales, orienta el encuadre del caso y coordina la primera reunión con el estudio.',
    caps: [
      'Consultoría en protección de activos',
      'Orientación en planificación patrimonial',
      'Estrategias legales personalizadas',
      'Coordinación de reunión con el estudio',
    ],
    accentColor: 'rgba(147,112,219,1)',
    accentBg:    'rgba(147,112,219,0.06)',
    accentBorder:'rgba(147,112,219,0.2)',
    label: 'Rodrigo',
  },
  {
    id:       'agent_8101m32e9cv1ehpa5w66m6kwxt5v',
    nombre:   'Dax Card',
    tipo:     'Fintech · Tarjeta de Crédito',
    tagline:  'Atención al cliente · Límites · Consultas de cuenta',
    emoji:    '💳',
    desc:     'Asistente financiero de voz para tarjetas de crédito. Responde consultas de saldo y límites, gestiona solicitudes de aumento, informa movimientos recientes y deriva al equipo cuando el caso lo requiere — sin tiempos de espera.',
    caps: [
      'Consulta de saldo, límite y movimientos',
      'Solicitudes de aumento de límite',
      'Información de beneficios y promociones',
      'Derivación al equipo de soporte humano',
    ],
    accentColor: 'rgba(6,182,212,1)',
    accentBg:    'rgba(6,182,212,0.06)',
    accentBorder:'rgba(6,182,212,0.2)',
    label: 'Dax',
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

      {/* ── PRECIOS ── */}
      <section className={s.section} style={{ paddingBottom: 0 }}>
        <div className={s.inner}>

          {/* Header */}
          <div className={`${s.reveal}`} data-reveal="" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
            <p className={s.kickerLabel} style={{ marginBottom: 16 }}>Planes y precios</p>
            <h2 style={{
              fontSize: 38, fontWeight: 800, fontFamily: 'var(--f-display)',
              color: '#F2EFE9', margin: '0 0 20px', lineHeight: 1.15,
              letterSpacing: '-0.03em',
            }}>
              Tu agente IA,<br /><em>listo en 2 semanas.</em>
            </h2>
            <p style={{
              fontSize: 16, lineHeight: 1.7, color: 'rgba(242,239,233,0.5)',
              fontFamily: 'var(--f-texto)',
            }}>
              Tres niveles de implementación según el tamaño de tu operación y los canales que necesitás cubrir.
            </p>
          </div>

          {/* Cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            alignItems: 'stretch',
          }}>

            {/* ── Esencial ── */}
            <div
              className={`${s.reveal} pricing-card`}
              data-reveal=""
              style={{
                border: '1px solid rgba(47,123,246,0.25)',
                background: 'rgba(47,123,246,0.04)',
                borderRadius: 24,
                padding: '40px 36px 44px',
                display: 'flex', flexDirection: 'column', gap: 0,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(47,123,246,0.5), transparent)',
              }} />
              <p style={{
                fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(47,123,246,0.8)',
                marginBottom: 20,
              }}>Esencial</p>
              <h3 style={{
                fontSize: 22, fontWeight: 800, fontFamily: 'var(--f-display)',
                color: '#F2EFE9', margin: '0 0 12px', lineHeight: 1.2,
              }}>
                Un canal.<br />Atención 24/7.
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.45)',
                fontFamily: 'var(--f-texto)', marginBottom: 32,
              }}>
                Para negocios que quieren atender, cualificar y agendar por un canal.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono)' }}>Puesta en marcha</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#F2EFE9', fontFamily: 'var(--f-display)' }}>USD 1.200 – 2.000</span>
                </div>
                <div style={{ height: 1, background: 'rgba(47,123,246,0.12)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono)' }}>Por mes</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(47,123,246,0.9)', fontFamily: 'var(--f-display)' }}>USD 180 – 300</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: '0 0 36px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '300 a 800 conversaciones / mes',
                  'Un agente por WhatsApp o web',
                  'Responde con la info de tu negocio',
                  'Cualifica y agenda',
                  'Cada consulta queda registrada',
                  'Panel básico',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(242,239,233,0.6)', fontFamily: 'var(--f-texto)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                      <circle cx="7" cy="7" r="6" stroke="rgba(47,123,246,0.5)" strokeWidth="1.2"/>
                      <path d="M4.5 7l1.8 1.8L9.5 5" stroke="rgba(47,123,246,0.9)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto' }}>
                <a
                  href="/empresa/contacto"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 24px', borderRadius: 12,
                    border: '1.5px solid rgba(47,123,246,0.4)',
                    background: 'rgba(47,123,246,0.08)',
                    color: 'rgba(242,239,233,0.85)',
                    fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-display)',
                    letterSpacing: '0.04em', textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(47,123,246,0.18)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,123,246,0.7)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(47,123,246,0.08)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(47,123,246,0.4)';
                  }}
                >
                  Contanos qué necesitás
                </a>
              </div>
            </div>

            {/* ── Profesional (destacado) ── */}
            <div
              className={`${s.reveal} ${s.revealDelay1} pricing-card pricing-card-featured`}
              data-reveal=""
              style={{
                border: '1px solid rgba(212,175,55,0.4)',
                background: 'linear-gradient(160deg, rgba(212,175,55,0.07) 0%, rgba(47,123,246,0.05) 100%)',
                borderRadius: 24,
                padding: '40px 36px 44px',
                display: 'flex', flexDirection: 'column', gap: 0,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Glow top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), rgba(47,123,246,0.6), transparent)',
              }} />
              {/* Badge */}
              <span style={{
                position: 'absolute', top: 20, right: 20,
                fontSize: 9, fontFamily: 'var(--f-mono)', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#040404',
                background: 'rgba(212,175,55,1)',
                padding: '4px 10px', borderRadius: 999, fontWeight: 700,
              }}>Más popular</span>

              <p style={{
                fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(212,175,55,0.9)',
                marginBottom: 20,
              }}>Profesional</p>
              <h3 style={{
                fontSize: 22, fontWeight: 800, fontFamily: 'var(--f-display)',
                color: '#F2EFE9', margin: '0 0 12px', lineHeight: 1.2,
              }}>
                Voz + WhatsApp.<br />Pipeline completo.
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.45)',
                fontFamily: 'var(--f-texto)', marginBottom: 32,
              }}>
                Para empresas que reciben consultas por campañas y quieren cubrir voz y WhatsApp.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono)' }}>Puesta en marcha</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#F2EFE9', fontFamily: 'var(--f-display)' }}>USD 3.000 – 5.500</span>
                </div>
                <div style={{ height: 1, background: 'rgba(212,175,55,0.15)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono)' }}>Por mes</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(212,175,55,0.95)', fontFamily: 'var(--f-display)' }}>USD 450 – 750</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: '0 0 36px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '250–600 min de voz + 500–1.500 conversaciones',
                  'Voz y WhatsApp en la misma base de conocimiento',
                  'Cualifica, agenda y deriva a una persona',
                  'Conexión con tu CRM',
                  'Panel completo: consultas, agenda y campañas',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(242,239,233,0.65)', fontFamily: 'var(--f-texto)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                      <circle cx="7" cy="7" r="6" stroke="rgba(212,175,55,0.5)" strokeWidth="1.2"/>
                      <path d="M4.5 7l1.8 1.8L9.5 5" stroke="rgba(212,175,55,1)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto' }}>
                <a
                  href="/empresa/contacto"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 24px', borderRadius: 12,
                    border: '1.5px solid rgba(212,175,55,0.7)',
                    background: 'rgba(212,175,55,0.15)',
                    color: '#F2EFE9',
                    fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-display)',
                    letterSpacing: '0.04em', textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.28)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.15)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.7)';
                  }}
                >
                  Contanos qué necesitás
                </a>
              </div>
            </div>

            {/* ── Empresa ── */}
            <div
              className={`${s.reveal} ${s.revealDelay2} pricing-card`}
              data-reveal=""
              style={{
                border: '1px solid rgba(242,239,233,0.1)',
                background: 'rgba(242,239,233,0.02)',
                borderRadius: 24,
                padding: '40px 36px 44px',
                display: 'flex', flexDirection: 'column', gap: 0,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(242,239,233,0.3), transparent)',
              }} />
              <p style={{
                fontSize: 10, fontFamily: 'var(--f-mono)', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(242,239,233,0.5)',
                marginBottom: 20,
              }}>Empresa</p>
              <h3 style={{
                fontSize: 22, fontWeight: 800, fontFamily: 'var(--f-display)',
                color: '#F2EFE9', margin: '0 0 12px', lineHeight: 1.2,
              }}>
                Operación completa.<br />Todos los canales.
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.45)',
                fontFamily: 'var(--f-texto)', marginBottom: 32,
              }}>
                Para organizaciones con varios equipos, sedes o líneas de negocio.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono)' }}>Puesta en marcha</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#F2EFE9', fontFamily: 'var(--f-display)' }}>USD 6.500 – 12.000</span>
                </div>
                <div style={{ height: 1, background: 'rgba(242,239,233,0.06)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono)' }}>Por mes</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(242,239,233,0.8)', fontFamily: 'var(--f-display)' }}>USD 1.200 – 2.500</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: '0 0 36px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '1.000–2.500 min de voz + 2.000–5.000 conversaciones',
                  'Varios agentes especializados por área o producto',
                  'Todos los canales integrados',
                  'Integración con tu ERP o CRM',
                  'Software a medida para ver y decidir',
                  'Soporte con tiempos de respuesta acordados',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(242,239,233,0.6)', fontFamily: 'var(--f-texto)' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                      <circle cx="7" cy="7" r="6" stroke="rgba(242,239,233,0.3)" strokeWidth="1.2"/>
                      <path d="M4.5 7l1.8 1.8L9.5 5" stroke="rgba(242,239,233,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto' }}>
                <a
                  href="/empresa/contacto"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '14px 24px', borderRadius: 12,
                    border: '1.5px solid rgba(242,239,233,0.2)',
                    background: 'rgba(242,239,233,0.04)',
                    color: 'rgba(242,239,233,0.8)',
                    fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-display)',
                    letterSpacing: '0.04em', textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(242,239,233,0.1)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,239,233,0.45)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(242,239,233,0.04)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,239,233,0.2)';
                  }}
                >
                  Contanos qué necesitás
                </a>
              </div>
            </div>

          </div>

          {/* Letra chica */}
          <p style={{
            marginTop: 36, marginBottom: 64,
            fontSize: 12, lineHeight: 1.7, color: 'rgba(242,239,233,0.28)',
            fontFamily: 'var(--f-texto)', textAlign: 'center', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Precios en dólares, más IVA. Los mensajes de WhatsApp (Meta) y la telefonía se pagan a costo, sin comisión nuestra.
            Fuera del volumen incluido, el minuto de voz cuesta USD 0,20 a 0,30 y la conversación de WhatsApp USD 0,15 a 0,25.
            El precio final se confirma después de una llamada corta donde entendemos cómo trabajás.
          </p>

        </div>
      </section>

      {/* Estilos: hover cards + animación glow en el plan destacado */}
      <style>{`
        .pricing-card {
          transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 60px -16px rgba(0,0,0,0.55);
        }
        @keyframes featuredGlow {
          from { box-shadow: 0 0 24px -4px rgba(212,175,55,0.12); }
          to   { box-shadow: 0 0 48px -4px rgba(212,175,55,0.28); }
        }
        .pricing-card-featured {
          animation: featuredGlow 2.8s ease-in-out infinite alternate;
        }
        .pricing-card-featured:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 64px -16px rgba(212,175,55,0.2);
          animation: none;
        }
        @media (max-width: 640px) {
          .pricing-card:hover { transform: none; box-shadow: none; }
          .pricing-card-featured { animation: none; }
        }
      `}</style>

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
