'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LazyMotion, domAnimation } from 'framer-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Monta Lenis (inercia de scroll) y lo conecta al ticker de GSAP, una sola
 * vez, en el layout de /empresa. Con prefers-reduced-motion no se monta
 * Lenis — scroll nativo — y tampoco corre el RAF de GSAP para ScrollTrigger
 * scrub/pin (los componentes individuales ya chequean el media query antes
 * de crear sus propios tweens, esto solo evita el motor de scroll suave).
 *
 * LazyMotion + domAnimation acá afuera: `m` en vez de `motion` en todo
 * /empresa baja el peso de Framer de ~34kb a ~6kb gzip.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, []);

  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
