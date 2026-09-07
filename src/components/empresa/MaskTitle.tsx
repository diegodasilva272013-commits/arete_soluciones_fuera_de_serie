'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type MaskTitleProps = {
  /** Una entrada del array = una línea. Cada línea vive en su propio overflow:hidden. */
  lines: ReactNode[];
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  lineClassName?: string;
  /** 'load': anima apenas monta (hero). 'scroll': anima al entrar en viewport (bandas). */
  trigger?: 'load' | 'scroll';
  delay?: number;
};

/**
 * Máscara de línea: cada línea del titular entra desde translateY(110%) a 0,
 * 800ms, --ease-out, stagger 70ms. Solo para titulares — nunca párrafos ni
 * listas (sección 07 / v3): es el único momento orquestado, no una regla
 * general de entrada.
 *
 * El contenido está siempre presente y legible en el DOM (accesibilidad);
 * el estado oculto lo aplica GSAP en cuanto monta, así que sin JS o con
 * prefers-reduced-motion el titular queda simplemente visible.
 */
export function MaskTitle({
  lines,
  as: Tag = 'h2',
  className = '',
  lineClassName = '',
  trigger = 'scroll',
  delay = 0,
}: MaskTitleProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const lineEls = root.querySelectorAll<HTMLElement>('[data-mask-line]');
    const ctx = gsap.context(() => {
      gsap.set(lineEls, { yPercent: 110 });

      const tween = () =>
        gsap.to(lineEls, {
          yPercent: 0,
          duration: 0.8,
          ease: 'cubic-bezier(0.16, 1, 0.30, 1)',
          stagger: 0.07,
          delay,
        });

      if (trigger === 'scroll') {
        ScrollTrigger.create({
          trigger: root,
          start: 'top 85%',
          once: true,
          onEnter: tween,
        });
      } else {
        tween();
      }
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag ref={rootRef} className={className}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
          <span data-mask-line style={{ display: 'block' }} className={lineClassName}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
