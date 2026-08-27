'use client';

import { useEffect } from 'react';

/** Activa la clase .revealOn en elementos con data-reveal al entrar en viewport */
export function RevealObserver({ revealClass }: { revealClass: string }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add(revealClass);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [revealClass]);

  return null;
}
