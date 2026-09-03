'use client';

import { useRef, useEffect } from 'react';

const VIDEOS = ['/video_hero.mp4', '/video_hero2.mp4'];

/**
 * Reproduce video_hero.mp4 y video_hero2.mp4 en secuencia continua,
 * sin corte visible entre uno y otro.
 * Técnica: dos elementos <video> superpuestos. Cuando el activo llega
 * al final, el siguiente ya está listo (preloaded) y se hace visible
 * al instante, mientras el anterior se oculta.
 */
export function HeroVideo() {
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const active = useRef(0); // índice del video que está jugando

  useEffect(() => {
    const [v0, v1] = [refs[0].current!, refs[1].current!];
    if (!v0 || !v1) return;

    // Estado inicial
    v0.src = VIDEOS[0];
    v1.src = VIDEOS[1];
    v0.style.opacity = '1';
    v1.style.opacity = '0';
    v0.play().catch(() => {});

    const swap = () => {
      const next = active.current === 0 ? 1 : 0;
      const curr = active.current;

      refs[next].current!.style.opacity = '1';
      refs[curr].current!.style.opacity = '0';
      refs[next].current!.play().catch(() => {});

      // Cuando termina el siguiente, volvemos al primero (bucle)
      active.current = next;
    };

    // Al terminar cada video → swap
    v0.addEventListener('ended', swap);
    v1.addEventListener('ended', swap);

    return () => {
      v0.removeEventListener('ended', swap);
      v1.removeEventListener('ended', swap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.4s ease',
  };

  return (
    <>
      <video
        ref={refs[0]}
        muted
        playsInline
        preload="auto"
        style={videoStyle}
      />
      <video
        ref={refs[1]}
        muted
        playsInline
        preload="auto"
        style={{ ...videoStyle, opacity: 0 }}
      />
    </>
  );
}
