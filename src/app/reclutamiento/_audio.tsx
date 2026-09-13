'use client';

import { useEffect, useRef, useState } from 'react';

export function ReclutamientoAudio() {
  const ref     = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);

  // Intenta autoplay al montar
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={ref}
        src="/Reclutamiento.mp3"
        preload="auto"
        onPlay={() => setOn(true)}
        onPause={() => setOn(false)}
        onEnded={() => setOn(false)}
      />

      <button
        onClick={toggle}
        aria-label={on ? 'Pausar' : 'Reproducir audio'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(5,5,5,0.90)',
          border: '1px solid rgba(47,123,246,.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#5C9AFF',
          boxShadow: '0 4px 20px rgba(0,0,0,.6)',
        }}
      >
        {on ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
            <rect x="2" y="1" width="4" height="12" rx="1" />
            <rect x="8" y="1" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
            <path d="M3 1.5 L12 7 L3 12.5 Z" />
          </svg>
        )}
      </button>
    </>
  );
}
