'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type WordRevealProps = {
  text: string;
  className?: string;
  wordClassName?: string;
};

/**
 * Cada palabra arranca en opacity 0.14 y sube a 1 según posición de scroll
 * (scrub), en un rango de 60svh. Reservado para dos lugares en todo el
 * sitio: el manifiesto de principios y la frase de cierre — no es un
 * efecto de uso general.
 */
export function WordReveal({ text, className = '', wordClassName = '' }: WordRevealProps) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const words = text.split(' ');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const wordEls = root.querySelectorAll<HTMLElement>('[data-word]');
    const ctx = gsap.context(() => {
      gsap.set(wordEls, { opacity: 0.14 });
      gsap.to(wordEls, {
        opacity: 1,
        stagger: 0.5 / Math.max(wordEls.length, 1),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: () => `+=${window.innerHeight * 0.6}`,
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <p ref={rootRef} className={className}>
      {words.map((word, i) => (
        <span key={i} data-word className={wordClassName} style={{ display: 'inline-block' }}>
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
