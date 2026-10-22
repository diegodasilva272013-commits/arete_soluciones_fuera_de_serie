'use client';

import { useEffect } from 'react';

/**
 * Activa `revealClass` en los elementos con `data-reveal` la primera vez que entran en
 * viewport (una sola vez por elemento). Se monta una vez por página.
 * Es la única implementación del reveal: empresa/_reveal y components/propuesta la re-exportan.
 */
export function RevealObserver({
  revealClass,
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
}: {
  revealClass: string;
  threshold?: number;
  rootMargin?: string;
}) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add(revealClass);
          io.unobserve(e.target);
        }
      }),
      { threshold, rootMargin }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [revealClass, threshold, rootMargin]);

  return null;
}
