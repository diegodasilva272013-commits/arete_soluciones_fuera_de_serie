'use client';

import { useEffect, useRef, useState } from 'react';

export function ReclutamientoAudio() {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const [playing,  setPlaying]  = useState(false);
  const [blocked,  setBlocked]  = useState(false); // autoplay bloqueado por el browser
  const [visible,  setVisible]  = useState(false); // fadeIn al montar

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Aparecer el botón con un pequeño delay
    const showTimer = setTimeout(() => setVisible(true), 800);

    // Intentar autoplay
    audio.volume = 0.7;
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => setPlaying(true))
        .catch(() => setBlocked(true)); // browser bloqueó → mostrar botón de play
    }

    return () => {
      clearTimeout(showTimer);
      audio.pause();
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
      setBlocked(false);
    }
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/Reclutamiento.mp3" preload="auto" />

      {/* Botón flotante — siempre visible para que el usuario controle el audio */}
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
          background: 'rgba(5,5,5,0.88)',
          border: `1px solid ${blocked ? 'rgba(47,123,246,.6)' : 'rgba(47,123,246,.25)'}`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#5C9AFF',
          transition: 'opacity 0.4s ease, transform 0.2s ease, border-color 0.3s',
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.8)',
          boxShadow: blocked
            ? '0 0 0 3px rgba(47,123,246,.15)'  // pulsa sutilmente si hay que hacer click
            : '0 4px 20px rgba(0,0,0,.5)',
        }}
      >
        {playing ? (
          /* Ícono pausa */
          <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
            <rect x="2.5" y="1.5" width="4" height="12" rx="1" />
            <rect x="8.5" y="1.5" width="4" height="12" rx="1" />
          </svg>
        ) : (
          /* Ícono play */
          <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden>
            <path d="M3.5 2 L13 7.5 L3.5 13 Z" />
          </svg>
        )}
      </button>
    </>
  );
}
