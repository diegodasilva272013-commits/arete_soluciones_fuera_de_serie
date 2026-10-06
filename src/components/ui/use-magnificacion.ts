'use client';

/**
 * Magnificación tipo dock (Framer Motion): un ítem crece según qué tan
 * cerca está el cursor de su centro. Sacado tal cual del dock de
 * episodios de /fuera-de-serie/temporada-1 para que Frecuencia use el
 * mismo comportamiento sin duplicarlo.
 *
 * Uso: el contenedor actualiza `mouseX` con onPointerMove (clientX) y lo
 * vuelve a Infinity con onPointerLeave. Cada ítem calcula su distancia
 * con useDistanciaAlCursor y deriva los tamaños con useMagnificacion.
 */

import type { RefObject } from 'react';
import { useSpring, useTransform, type MotionValue } from 'framer-motion';

/** Resorte del dock original: corto, firme y sin rebote largo. */
export const RESORTE_DOCK = { mass: 0.1, stiffness: 160, damping: 15 } as const;

/** Distancia horizontal (px) del cursor al centro del elemento. Infinity si no hay cursor. */
export function useDistanciaAlCursor(ref: RefObject<HTMLElement>, mouseX: MotionValue<number>) {
  return useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
}

/**
 * Tamaño animado: `desde` lejos del cursor, `hasta` con el cursor encima,
 * interpolado linealmente dentro de ±`rango` px y suavizado con un resorte.
 */
export function useMagnificacion(
  distancia: MotionValue<number>,
  { rango, desde, hasta, resorte = RESORTE_DOCK }: { rango: number; desde: number; hasta: number; resorte?: typeof RESORTE_DOCK }
) {
  const objetivo = useTransform(distancia, [-rango, 0, rango], [desde, hasta, desde]);
  return useSpring(objetivo, resorte);
}
