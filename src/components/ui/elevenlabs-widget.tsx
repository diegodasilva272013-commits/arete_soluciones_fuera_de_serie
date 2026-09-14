'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
      };
    }
  }
}

const AGENT_ID = 'agent_0701m2fyqzbffg3v5x1s94xckhpc';

export function ElevenLabsWidget() {
  const widgetRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Carga el script de ElevenLabs si no existe
    if (!document.querySelector('script[src*="elevenlabs.io/convai-widget"]')) {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }

    // Oculta el widget original con CSS global
    const style = document.createElement('style');
    style.id = 'el-hide-default';
    style.textContent = `
      elevenlabs-convai {
        position: fixed !important;
        bottom: -9999px !important;
        right: -9999px !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    `;
    if (!document.getElementById('el-hide-default')) {
      document.head.appendChild(style);
    }
  }, []);

  function handleClick() {
    const widget = document.querySelector('elevenlabs-convai') as HTMLElement & {
      startConversation?: () => void;
    };
    if (!widget) return;

    if (active) {
      // Intenta terminar la conversación
      try {
        const btn = widget.shadowRoot?.querySelector('button');
        btn?.click();
      } catch {}
      setActive(false);
      return;
    }

    // Activa el widget: restaura posición temporalmente para que funcione,
    // luego lo volvemos a ocultar visualmente
    widget.style.cssText = `
      position: fixed !important;
      bottom: 80px !important;
      left: 28px !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      z-index: 9999 !important;
    `;

    // Hace click en el botón interno del widget
    setTimeout(() => {
      try {
        const btn = widget.shadowRoot?.querySelector('button');
        btn?.click();
        setActive(true);
      } catch {}
    }, 100);
  }

  return (
    <>
      {/* Widget ElevenLabs oculto — funcional pero invisible */}
      <elevenlabs-convai agent-id={AGENT_ID} ref={widgetRef as any} />

      {/* Botón custom Areté — esquina inferior izquierda */}
      <button
        onClick={handleClick}
        aria-label={active ? 'Terminar llamada' : 'Hablar con nuestra IA'}
        style={{
          position: 'fixed',
          bottom: 28,
          left: 28,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px 0 16px',
          height: 52,
          borderRadius: 999,
          background: active ? 'rgba(26,111,255,0.18)' : 'rgba(5,5,5,0.92)',
          border: `1.5px solid ${active ? 'rgba(26,111,255,0.7)' : 'rgba(26,111,255,0.35)'}`,
          color: '#F2EFE9',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: active
            ? '0 0 24px rgba(26,111,255,0.35), 0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'all 0.25s ease',
          fontFamily: 'var(--f-display, Montserrat, sans-serif)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Ícono mic con anillo pulsante cuando activo */}
        <span style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
          {active && (
            <span style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              border: '1.5px solid rgba(26,111,255,0.5)',
              animation: 'elPulse 1.5s ease-out infinite',
            }} />
          )}
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: active ? 'rgba(26,111,255,0.25)' : 'rgba(26,111,255,0.15)',
            border: '1px solid rgba(26,111,255,0.4)',
          }}>
            {active ? (
              /* Ícono phone-off cuando activo */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(26,111,255,1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 2 2 0 01-.45-2.11 12.84 12.84 0 00.7-2.81 2 2 0 00-.45-1.67z"/>
                <line x1="23" y1="1" x2="1" y2="23"/>
              </svg>
            ) : (
              /* Ícono mic */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(26,111,255,1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </span>
        </span>

        <span style={{ color: active ? 'rgba(26,111,255,1)' : 'rgba(242,239,233,0.85)' }}>
          {active ? 'Terminar llamada' : 'Hablar con la IA'}
        </span>
      </button>

      <style>{`
        @keyframes elPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
