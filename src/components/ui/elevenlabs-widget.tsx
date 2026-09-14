'use client';

import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';

const AGENT_ID = 'agent_0701m2fyqzbffg3v5x1s94xckhpc';

type Status = 'idle' | 'connecting' | 'active' | 'error';

export function ElevenLabsWidget() {
  const convRef = useRef<Conversation | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const start = useCallback(async () => {
    if (status !== 'idle' && status !== 'error') return;
    setStatus('connecting');
    try {
      const conv = await Conversation.startSession({
        agentId: AGENT_ID,
        onConnect: () => setStatus('active'),
        onDisconnect: () => {
          convRef.current = null;
          setStatus('idle');
        },
        onError: () => setStatus('error'),
      });
      convRef.current = conv;
    } catch {
      setStatus('error');
    }
  }, [status]);

  const stop = useCallback(async () => {
    await convRef.current?.endSession();
    convRef.current = null;
    setStatus('idle');
  }, []);

  const handleClick = () => {
    if (status === 'active') stop();
    else start();
  };

  const isActive   = status === 'active';
  const isBusy     = status === 'connecting';
  const isError    = status === 'error';

  return (
    <button
      onClick={handleClick}
      disabled={isBusy}
      aria-label={isActive ? 'Colgar' : 'Llamar a un asesor'}
      style={{
        position: 'fixed',
        bottom: 28,
        left: 28,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px 0 14px',
        height: 52,
        borderRadius: 999,
        background: isActive
          ? 'rgba(26,111,255,0.18)'
          : isError
          ? 'rgba(239,68,68,0.12)'
          : 'rgba(5,5,5,0.92)',
        border: `1.5px solid ${
          isActive ? 'rgba(26,111,255,0.7)' :
          isError  ? 'rgba(239,68,68,0.5)'  :
                     'rgba(26,111,255,0.35)'
        }`,
        color: '#F2EFE9',
        cursor: isBusy ? 'wait' : 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isActive
          ? '0 0 24px rgba(26,111,255,0.3), 0 4px 20px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.25s ease',
        fontFamily: 'var(--f-display, Montserrat, sans-serif)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        outline: 'none',
      }}
    >
      {/* Ícono */}
      <span style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
        {isActive && (
          <>
            <span style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: '1.5px solid rgba(26,111,255,0.5)',
              animation: 'elPulse 1.5s ease-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              border: '1px solid rgba(26,111,255,0.25)',
              animation: 'elPulse 1.5s ease-out infinite',
              animationDelay: '0.4s',
            }} />
          </>
        )}
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%',
          background: isActive ? 'rgba(26,111,255,0.25)' :
                      isError  ? 'rgba(239,68,68,0.15)'  :
                                 'rgba(26,111,255,0.12)',
          border: `1px solid ${isActive ? 'rgba(26,111,255,0.5)' :
                                isError  ? 'rgba(239,68,68,0.4)'  :
                                           'rgba(26,111,255,0.35)'}`,
        }}>
          {isBusy ? (
            /* Spinner conectando */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(26,111,255,0.8)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: 'spin 0.8s linear infinite' }}/>
            </svg>
          ) : isActive ? (
            /* End call */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(26,111,255,1)"
              stroke="none">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : isError ? (
            /* Error */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(239,68,68,0.9)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          ) : (
            /* Mic */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(26,111,255,1)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8"  y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </span>
      </span>

      {/* Label */}
      <span style={{
        color: isActive ? 'rgba(26,111,255,1)' :
               isError  ? 'rgba(239,68,68,0.9)' :
                          'rgba(242,239,233,0.85)',
      }}>
        {isBusy  ? 'Conectando…' :
         isActive ? 'Colgar'      :
         isError  ? 'Reintentar' :
                    'Llamar a un asesor'}
      </span>

      <style>{`
        @keyframes elPulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
