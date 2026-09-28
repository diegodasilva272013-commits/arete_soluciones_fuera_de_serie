'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// Arquitectura del progreso (punto 2 de la orden): UN solo ScrollTrigger con
// pin sobre el hero, scrub:1, que escribe un único valor 0..1 en una ref.
// La escena 3D lee esa ref en useFrame — nunca dispara un re-render de React
// por frame. Lenis maneja el scroll suave; el ticker de GSAP alimenta a
// Lenis (no al revés), y Lenis avisa a ScrollTrigger cuando se mueve.
export function useScrollProgress(pinTargetRef: React.RefObject<HTMLElement>, disabled: boolean) {
  const progressRef = useRef(0);

  useEffect(() => {
    if (disabled) return; // sin WebGL o prefers-reduced-motion: hero estático, sin pin ni scrub

    const pinTarget = pinTargetRef.current;
    if (!pinTarget) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const st = ScrollTrigger.create({
      trigger: pinTarget,
      start: 'top top',
      end: '+=600%', // 600vh de scroll total para todo el recorrido
      pin: true,
      scrub: 1,
      onUpdate: (self) => { progressRef.current = self.progress; },
    });

    return () => {
      st.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return progressRef;
}
