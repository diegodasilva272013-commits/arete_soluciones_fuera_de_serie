'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './LaPrueba.module.css';
import { MediaFrame } from '../MediaFrame';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Plano general, media a sangre completa sin una palabra encima — el copy
 * va antes y después, nunca sobre el video. Debajo, un track horizontal
 * corto (no pineado, a diferencia del de /metodologia) con las capturas
 * de la plataforma.
 */
export function LaPrueba() {
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth * 0.35),
        ease: 'none',
        scrollTrigger: {
          trigger: viewport,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className={s.section}>
      <div className={s.copyBlock}>
        <h2 className={s.title}>La plataforma que usamos la construimos nosotros</h2>
      </div>

      <div className={s.bleed}>
        <MediaFrame
          videoSrc="/video_plataforma.mp4"
          aspect="full"
          light="center"
          bevel={false}
          description="La plataforma de entrenamiento de Fuera de Serie en uso: simulador de campo, matriz de evaluación e historial de evidencia por persona."
        />
      </div>

      <div className={s.copyBlock}>
        <p className={s.body}>
          El sistema de entrenamiento de Fuera de Serie es, literalmente, un sistema empresarial a medida hecho por
          Areté Soluciones. Simulador de campo, matriz de evaluación, historial de evidencia por persona y detección
          de patrones. No hay mejor demostración de lo que hacemos que mostrar lo que construimos para nosotros mismos.
        </p>
      </div>

      <div ref={viewportRef} className={s.trackViewport}>
        <div ref={trackRef} className={s.track}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={s.panel}>
              <MediaFrame aspect="16/10" light={i === 1 ? 'top' : i === 0 ? 'left' : 'right'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
