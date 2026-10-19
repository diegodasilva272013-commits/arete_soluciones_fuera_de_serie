'use client';

/**
 * Hero con el video del logo de Providus (revelación del isotipo y las letras de
 * aluminio bajo una luz cálida). Se reproduce una vez y queda en el último cuadro.
 * Si el navegador no deja reproducir (ahorro de batería, movimiento reducido o red
 * lenta) se muestra directamente ese cuadro final: la marca nunca queda en negro.
 */

import { useEffect, useRef, useState } from 'react';

export function HeroLogo() {
  const video = useRef<HTMLVideoElement>(null);
  const [modo, setModo] = useState<'cargando' | 'video' | 'quieto'>('cargando');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setModo('quieto');
      return;
    }
    const espera = setTimeout(() => setModo((m) => (m === 'cargando' ? 'quieto' : m)), 3000);
    video.current?.play().catch(() => setModo('quieto'));
    return () => clearTimeout(espera);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--pv-fondo)]" role="img" aria-label="Providus, S.A. de Capitalización y Renta">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo-providus/hero-final.jpg" alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000" style={{ opacity: modo === 'quieto' ? 1 : 0 }} />
      <video
        ref={video}
        src="/demo-providus/hero.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onPlaying={() => setModo('video')}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        style={{ opacity: modo === 'video' ? 1 : 0 }}
      />
    </div>
  );
}
