'use client';

import s from '@/app/empresa/corp.module.css';
import { AgentWidget } from './AgentWidget';
import { LogoVideo } from './LogoVideo';

export type AgentData = {
  id: string;
  nombre: string;
  tipo: string;
  tagline: string;
  emoji: string;
  desc: string;
  caps: string[];
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  label: string;
  /** Si viene, reemplaza el emoji de cabecera — mismo patrón que el video
   * de la oficina de Providus en su propuesta: es la identidad visual de
   * la card, no un adorno aparte. */
  video?: { src: string; poster?: string };
};

// Card de agente con botón de llamada real (WebRTC), igual a la de
// /empresa/agentes-ia y a la de la propuesta de Providus. Si `agent.video`
// viene cargado, el video reemplaza el emoji de cabecera (igual que en
// Providus); si no, cae al patrón con emoji que usan el resto de los
// agentes en /empresa/agentes-ia.
export function AgentCard({ agent }: { agent: AgentData }) {
  return (
    <div
      className={s.reveal}
      data-reveal=""
      style={{
        maxWidth: 620,
        margin: '0 auto',
        border: `1px solid ${agent.accentBorder}`,
        background: agent.accentBg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(6px)',
      }}
    >
      {agent.video && <LogoVideo src={agent.video.src} poster={agent.video.poster} rounded={false} />}

      <div style={{ padding: '32px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {agent.video ? (
        <div>
          <p style={{ fontSize: 11, fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: agent.accentColor, marginBottom: 4 }}>{agent.tipo}</p>
          <h3 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--f-display), Montserrat, sans-serif', color: 'var(--hueso)', margin: 0, lineHeight: 1.1 }}>{agent.nombre}</h3>
          <p style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.1em', marginTop: 5 }}>{agent.tagline}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <span style={{
            fontSize: 36, lineHeight: 1,
            background: 'rgba(242,239,233,0.06)',
            border: `1px solid ${agent.accentBorder}`,
            width: 64, height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {agent.emoji}
          </span>
          <div>
            <p style={{ fontSize: 11, fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: agent.accentColor, marginBottom: 4 }}>{agent.tipo}</p>
            <h3 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--f-display), Montserrat, sans-serif', color: 'var(--hueso)', margin: 0, lineHeight: 1.1 }}>{agent.nombre}</h3>
            <p style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.1em', marginTop: 5 }}>{agent.tagline}</p>
          </div>
        </div>
      )}

      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(242,239,233,0.6)', fontFamily: 'var(--f-texto), Spectral, serif', margin: 0 }}>{agent.desc}</p>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {agent.caps.map((cap) => (
          <li key={cap} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(242,239,233,0.65)', fontFamily: 'var(--f-texto), Spectral, serif' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: agent.accentColor }} />
            {cap}
          </li>
        ))}
      </ul>

      <div style={{ height: 1, background: `linear-gradient(90deg, ${agent.accentBorder}, transparent)` }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AgentWidget agentId={agent.id} label={agent.label} />
      </div>

      <p style={{ fontSize: 11, color: 'rgba(242,239,233,0.25)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.08em', textAlign: 'center', margin: 0 }}>
        Requiere micrófono · Mismo agente que atiende en producción, no es una demo grabada.
      </p>
      </div>
    </div>
  );
}
