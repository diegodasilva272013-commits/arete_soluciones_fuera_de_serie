'use client';

import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';
import { Mic } from 'lucide-react';

// Botón de llamada real por WebRTC (@11labs/client), igual al que ya
// funciona en /empresa/agentes-ia y en la propuesta de Providus. Widget
// autocontenido: conecta la llamada él mismo, sin depender de que exista
// un widget flotante global en el DOM.
type CallStatus = 'idle' | 'connecting' | 'active' | 'error';

export function AgentWidget({ agentId, label }: { agentId: string; label: string }) {
  const convRef = useRef<Conversation | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');

  const start = useCallback(async () => {
    if (status !== 'idle' && status !== 'error') return;
    setStatus('connecting');
    try {
      const conv = await Conversation.startSession({
        agentId,
        onConnect: () => setStatus('active'),
        onDisconnect: () => { convRef.current = null; setStatus('idle'); },
        onError: () => setStatus('error'),
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
  const isBusy = status === 'connecting';
  const isError = status === 'error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {isActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 36, padding: '0 8px' }}>
          {[0.6, 1, 0.8, 1.2, 0.7, 1, 0.9].map((h, i) => (
            <span key={i} style={{ display: 'block', width: 3, height: `${h * 24}px`, borderRadius: 3, background: 'rgba(47,123,246,0.8)', animation: 'agWave 0.9s ease-in-out infinite alternate', animationDelay: `${i * 0.09}s` }} />
          ))}
        </div>
      )}

      <button
        onClick={isActive ? stop : start}
        disabled={isBusy}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 28px', height: 58, borderRadius: 999,
          background: isActive ? 'rgba(239,68,68,0.12)' : isError ? 'rgba(239,68,68,0.10)' : 'rgba(47,123,246,0.10)',
          border: `1.5px solid ${isActive ? 'rgba(239,68,68,0.6)' : isError ? 'rgba(239,68,68,0.45)' : 'rgba(47,123,246,0.4)'}`,
          color: 'var(--hueso)',
          cursor: isBusy ? 'wait' : 'pointer',
          transition: 'all 0.25s ease',
          fontFamily: 'var(--f-display), Montserrat, sans-serif',
          fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
          whiteSpace: 'nowrap', outline: 'none', position: 'relative',
        }}
      >
        {isActive && (
          <>
            <span style={{ position: 'absolute', inset: -5, borderRadius: 999, border: '1px solid rgba(239,68,68,0.35)', animation: 'agPulse 1.8s ease-out infinite' }} />
            <span style={{ position: 'absolute', inset: -10, borderRadius: 999, border: '1px solid rgba(239,68,68,0.15)', animation: 'agPulse 1.8s ease-out infinite', animationDelay: '0.5s' }} />
          </>
        )}
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: isActive ? 'rgba(239,68,68,0.18)' : isError ? 'rgba(239,68,68,0.12)' : 'rgba(47,123,246,0.15)',
          border: `1px solid ${isActive ? 'rgba(239,68,68,0.5)' : isError ? 'rgba(239,68,68,0.35)' : 'rgba(47,123,246,0.4)'}`,
        }}>
          {isBusy ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(47,123,246,0.8)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'agSpin 0.8s linear infinite' }} />
            </svg>
          ) : isActive ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(239,68,68,0.9)" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          ) : (
            <Mic size={14} color="rgba(47,123,246,1)" strokeWidth={2.5} />
          )}
        </span>
        <span style={{ color: isActive ? 'rgba(239,68,68,0.9)' : isError ? 'rgba(239,68,68,0.8)' : 'var(--hueso)' }}>
          {isBusy ? 'Conectando...' : isActive ? `Colgar a ${label}` : isError ? 'Reintentar' : `Llamar a ${label}`}
        </span>
      </button>

      {isActive && (
        <p style={{ fontSize: 12, color: 'rgba(242,239,233,0.35)', fontFamily: 'var(--f-mono), monospace', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          En llamada · hablá con el agente
        </p>
      )}

      <style>{`
        @keyframes agPulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes agWave { from { transform: scaleY(0.4); } to { transform: scaleY(1.2); } }
        @keyframes agSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
