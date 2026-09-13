'use client';

import { useEffect, useState } from 'react';
import s from './recl.module.css';

/**
 * Player de audio inline para el hero.
 * Anillos concéntricos pulsantes mientras no está reproduciendo → llama la atención.
 * Se calma al reproducir (muestra onda animada + pausa).
 */
export function ReclutamientoAudio() {
  const [audio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === 'undefined') return null;
    const a = new Audio('/Reclutamiento.mp3');
    a.volume = 0.7;
    return a;
  });
  const [playing, setPlaying] = useState(false);
  const [err,     setErr]     = useState('');

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
    if (audio.paused) audio.play().catch((e) => setErr(String(e)));
    else              audio.pause();
  };

  return (
    <div className={s.audioBlock}>
      {/* Botón de play con anillos pulsantes */}
      <button
        onClick={toggle}
        aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}
        className={s.audioBtn}
      >
        {/* Anillos — solo cuando está pausado y sin error */}
        {!playing && !err && (
          <>
            <span className={`${s.audioRing} ${s.audioRing1}`} />
            <span className={`${s.audioRing} ${s.audioRing2}`} />
            <span className={`${s.audioRing} ${s.audioRing3}`} />
          </>
        )}

        {/* Círculo central */}
        <span className={`${s.audioDot} ${err ? s.audioDotErr : playing ? s.audioDotPlaying : ''}`}>
          {err ? (
            /* X si error */
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          ) : playing ? (
            /* Pausa */
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <rect x="4"  y="2" width="4.5" height="16" rx="1.5" />
              <rect x="11.5" y="2" width="4.5" height="16" rx="1.5" />
            </svg>
          ) : (
            /* Play — triángulo desplazado +2px a la derecha para centrado óptico */
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden style={{ transform: 'translateX(2px)' }}>
              <path d="M5 2.5L16.5 10 5 17.5z" />
            </svg>
          )}
        </span>
      </button>

      {/* Texto */}
      <div className={s.audioText}>
        <span className={s.audioEyebrow}>
          {playing ? '▶ Reproduciendo...' : '← Tocá para escuchar'}
        </span>
        <span className={s.audioLabel}>
          Escuchá antes de postularte
        </span>
        {err && (
          <span className={s.audioErr}>No se pudo cargar el audio</span>
        )}
      </div>
    </div>
  );
}
