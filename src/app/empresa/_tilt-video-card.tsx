'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AutoplayVideo } from './_autoplay-video';
import s from './corp.module.css';

/**
 * Adaptado de un componente pegado que en realidad era un reproductor
 * de música completo (lista de tracks, sonido de click sintetizado,
 * controles de play/next/prev, toggle de tema, fullscreen). Nada de
 * eso aplica a un hero de "Nosotros" — se rescata solo la pieza que sí
 * tiene sentido acá: una pantalla flotante con el video que se inclina
 * levemente hacia el cursor. Sin tracks falsos, sin audio sintetizado,
 * sin controles que no hacen nada en este contexto.
 *
 * Gateado igual que el resto del sitio: nada de tilt en touch/pointer
 * grueso, y nada de tilt con prefers-reduced-motion (se muestra el
 * video quieto, sin inclinación).
 */
export function TiltVideoCard({ src }: { src: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCanTilt(hoverMq.matches && !motionMq.matches);
    update();
    hoverMq.addEventListener('change', update);
    motionMq.addEventListener('change', update);
    return () => {
      hoverMq.removeEventListener('change', update);
      motionMq.removeEventListener('change', update);
    };
  }, []);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = 'transform 0.05s linear';
    el.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 12}deg)`;
  }, [canTilt]);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.6s cubic-bezier(.2,.8,.2,1)';
    el.style.transform = 'rotateY(0deg) rotateX(0deg)';
  }, []);

  return (
    <div className={s.tiltStage}>
      <div className={s.tiltGlow} aria-hidden="true" />
      <div
        ref={cardRef}
        className={s.tiltCard}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className={s.tiltCardInner}>
          <AutoplayVideo src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>
    </div>
  );
}
