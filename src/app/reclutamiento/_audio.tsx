'use client';

import { useEffect, useRef, useState } from 'react';

export function ReclutamientoAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Crear el objeto Audio en JS — más confiable que <audio ref={...}>
    const audio = new Audio('/Reclutamiento.mp3');
    audio.volume = 0.7;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('ended', () => setPlaying(false));
    audio.addEventListener('pause',  () => setPlaying(false));
    audio.addEventListener('play',   () => setPlaying(true));

    // Mostrar el botón con fadeIn
    const showTimer = setTimeout(() => setVisible(true), 600);

    // 1. Intentar autoplay inmediato
    // 2. Si el browser lo bloquea, reproducir en la primera interacción
    const playOnce = async () => {
      try {
        await audio.play();
      } catch { /* silencioso si falla el segundo intento también */ }
      // Limpiar todos los listeners de "primera interacción"
      document.removeEventListener('click',      playOnce);
      document.removeEventListener('touchstart', playOnce);
      document.removeEventListener('scroll',     playOnce, true);
      document.removeEventListener('keydown',    playOnce);
    };

    audio.play().catch(() => {
      // Autoplay bloqueado → reproducir en cuanto el usuario haga algo
      document.addEventListener('click',      playOnce, { once: true });
      document.addEventListener('touchstart', playOnce, { once: true });
      document.addEventListener('scroll',     playOnce, { once: true, capture: true });
      document.addEventListener('keydown',    playOnce, { once: true });
    });

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener('click',      playOnce);
      document.removeEventListener('touchstart', playOnce);
      document.removeEventListener('scroll',     playOnce, true);
      document.removeEventListener('keydown',    playOnce);
      audio.pause();
      audio.src = '';
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (!audio.paused) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (err) {
      console.warn('Audio toggle error:', err);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}
      title={playing ? 'Pausar' : 'Reproducir audio de bienvenida'}
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
        transition: 'opacity 0.4s ease, transform 0.2s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        boxShadow: '0 4px 20px rgba(0,0,0,.6)',
      }}
    >
      {playing ? (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
          <rect x="2.5" y="1.5" width="4" height="12" rx="1" />
          <rect x="8.5" y="1.5" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
          <path d="M3.5 2 L13 7.5 L3.5 13 Z" />
        </svg>
      )}
    </button>
  );
}
