'use client';

import { useEffect } from 'react';
import s from '@/app/empresa/corp.module.css';

// Observa todo [data-reveal] del documento y le agrega s.revealOn la primera
// vez que entra en viewport (una sola vez por elemento). Idéntico al de la
// propuesta de Providus — se monta una sola vez por página.
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add(s.revealOn); io.unobserve(e.target); }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
