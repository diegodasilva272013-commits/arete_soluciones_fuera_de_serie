'use client';

/**
 * Magnificación tipo dock: cada ítem crece según la distancia horizontal
 * al puntero. Es la misma matemática y el mismo resorte que el dock de
 * episodios de fuera-de-serie/temporada-1/_efectos.tsx (DockEpisodio):
 * distancia al centro del ítem → useTransform sobre un rango ±`alcance`
 * → useSpring { mass 0.1, stiffness 160, damping 15 }. Extraída acá para
 * reusarla sin acoplar otras pantallas a la landing.
 *
 * Uso: el contenedor hace mouseX.set(e.clientX) en onPointerMove y
 * mouseX.set(Infinity) en onPointerLeave; cada ítem llama a este hook
 * con su propio ref.
 */

import { useRef } from 'react';
import { useSpring, useTransform, type MotionValue } from 'framer-motion';

const RESORTE = { mass: 0.1, stiffness: 160, damping: 15 };

export function useMagnificacion<T extends HTMLElement>(
  mouseX: MotionValue<number>,
  { alcance = 230, base, maximo }: { alcance?: number; base: number; maximo: number }
) {
  const ref = useRef<T>(null);
  const distancia = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const objetivo = useTransform(distancia, [-alcance, 0, alcance], [base, maximo, base]);
  const valor = useSpring(objetivo, RESORTE);
  return { ref, valor };
}
