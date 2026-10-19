'use client';

/**
 * Hero con el video del logo de Providus. Siempre hay movimiento:
 *  1. Se reproduce la revelación del logo (luz que entra, aluminio que aparece).
 *  2. Al terminar, pasa sin cortes a un bucle suave de la luz sobre las letras.
 *  3. Si el celular no deja reproducir (ahorro de batería, datos), se ve el cuadro
 *     final con una respiración lenta y un barrido de luz hechos en CSS, y un toque
 *     sobre la pantalla reintenta el video.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type Modo = 'cargando' | 'intro' | 'bucle' | 'quieto';

export function HeroLogo() {
  const intro = useRef<HTMLVideoElement>(null);
  const bucle = useRef<HTMLVideoElement>(null);
  const [modo, setModo] = useState<Modo>('cargando');

  const reproducir = useCallback(() => {
    const v = intro.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => setModo((m) => (m === 'cargando' ? 'quieto' : m)));
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setModo('quieto');
      return;
    }
    reproducir();
    const espera = setTimeout(() => setModo((m) => (m === 'cargando' ? 'quieto' : m)), 3500);
    return () => clearTimeout(espera);
  }, [reproducir]);

  // Cualquier toque en la pantalla reintenta el video si el navegador lo había frenado.
  useEffect(() => {
    if (modo !== 'quieto') return;
    const reintentar = () => reproducir();
    window.addEventListener('pointerdown', reintentar, { once: true });
    return () => window.removeEventListener('pointerdown', reintentar);
  }, [modo, reproducir]);

  const alTerminarIntro = () => {
    const b = bucle.current;
    if (!b) return;
    b.currentTime = 0;
    void b.play().then(() => setModo('bucle')).catch(() => setModo('quieto'));
  };

  return (
    <div className="absolute inset-0 overflow-hidden" role="img" aria-label="Providus, S.A. de Capitalización y Renta">
      <div className="pv-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/demo-providus/hero-final.jpg"
          alt=""
          className="pv-respira absolute inset-0 h-full w-full object-cover object-[68%_50%] transition-opacity duration-1000"
          style={{ opacity: modo === 'quieto' ? 1 : 0 }}
        />
        <video
          ref={intro}
          src="/demo-providus/hero.mp4"
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          onPlaying={() => setModo((m) => (m === 'cargando' || m === 'quieto' ? 'intro' : m))}
          onEnded={alTerminarIntro}
          className="absolute inset-0 h-full w-full object-cover object-[68%_50%] transition-opacity duration-700"
          style={{ opacity: modo === 'intro' ? 1 : 0 }}
        />
        <video
          ref={bucle}
          src="/demo-providus/hero-loop.mp4"
          muted
          playsInline
          loop
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[68%_50%]"
          style={{ opacity: modo === 'bucle' ? 1 : 0 }}
        />
        <div className="pv-luz" aria-hidden="true" />
      </div>
    </div>
  );
}
