'use client';

import { useEffect, useState } from 'react';

export function ReclutamientoAudio() {
  // useState lazy init: crea el objeto Audio en el primer render CLIENT-SIDE.
  // Garantiza que `audio` exista cuando el usuario hace click — sin depender de refs ni useEffect.
  const [audio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === 'undefined') return null;
    const a = new Audio('/Reclutamiento.mp3');
    a.volume = 0.7;
    return a;
  });

  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!audio) return;
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    audio.addEventListener('play',  onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play',  onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [audio]);

  const toggle = () => {
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch((e) => setErr(String(e)));
    } else {
      audio.pause();
    }
  };

  return (
    <button
      onClick={toggle}
      title={err || (playing ? 'Pausar' : 'Reproducir')}
      aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: err
          ? 'rgba(200,50,50,0.90)'
          : 'rgba(5,5,5,0.90)',
        border: `1px solid ${err ? 'rgba(255,80,80,.5)' : 'rgba(47,123,246,.35)'}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: err ? '#ff9999' : '#5C9AFF',
        boxShadow: '0 4px 20px rgba(0,0,0,.6)',
        padding: 0,
      }}
    >
      {err ? (
        // X roja si error
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <line x1="2" y1="2" x2="12" y2="12" />
          <line x1="12" y1="2" x2="2" y2="12" />
        </svg>
      ) : playing ? (
        // Pausa
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <rect x="2" y="1" width="4" height="12" rx="1" />
          <rect x="8" y="1" width="4" height="12" rx="1" />
        </svg>
      ) : (
        // Play
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <path d="M3 1.5L12 7 3 12.5z" />
        </svg>
      )}
    </button>
  );
}
