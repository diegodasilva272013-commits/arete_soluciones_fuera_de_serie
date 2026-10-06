'use client';

/**
 * Una pregunta por pantalla, dentro de una misma categoría del
 * onboarding (ej.: las 4 preguntas de identidad). Transición propia
 * con AnimatePresence — la transición "grande" entre categorías la da
 * el shell de Frecuencia (_shell.tsx) al cambiar de ruta.
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import base from '../frecuencia.module.css';

export function PreguntaUnica({
  claveAnimacion,
  pregunta,
  ayuda,
  children,
}: {
  claveAnimacion: string;
  pregunta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  const prefiereReducido = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={claveAnimacion}
        initial={prefiereReducido ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefiereReducido ? undefined : { opacity: 0, x: -18 }}
        transition={{ duration: 0.35, ease: [0.16, 0.84, 0.28, 1] }}
      >
        <h2 className={base.titulo} style={{ fontSize: 'clamp(22px, 5vw, 30px)' }}>
          {pregunta}
        </h2>
        {ayuda && <p className={base.ayuda}>{ayuda}</p>}
        <div style={{ marginTop: 24 }}>{children}</div>
      </motion.div>
    </AnimatePresence>
  );
}
