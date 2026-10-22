'use client';

import s from '@/app/empresa/corp.module.css';
import { RevealObserver as Reveal } from '@/components/reveal/RevealObserver';

// Reveal de las propuestas: mismo componente unificado con los valores que usan hoy
// (threshold 0.08 y la clase revealOn de corp.module.css). Se monta una sola vez por página.
export function RevealObserver() {
  return <Reveal revealClass={s.revealOn} threshold={0.08} rootMargin="0px 0px -40px 0px" />;
}
