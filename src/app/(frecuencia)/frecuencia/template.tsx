'use client';

/**
 * Transición entre pantallas de Frecuencia. template.tsx se vuelve a
 * montar en cada navegación dentro de /frecuencia (a diferencia de
 * layout.tsx, que persiste) — eso es lo que dispara la animación de
 * entrada en cada cambio de pantalla, sin tocar el resto de la
 * plataforma.
 *
 * Nota técnica: dentro del modelo de navegación de Next 14, el árbol
 * anterior se desmonta antes de montar el siguiente, así que acá solo
 * se puede controlar la animación de ENTRADA (fade + leve subida) — no
 * hay una salida coreografiada de la pantalla previa sin tomar control
 * manual del router. AnimatePresence queda igual para la semántica y
 * por si una pantalla puntual declara su propio "exit" interno.
 */

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function FrecuenciaTemplate({ children }: { children: React.ReactNode }) {
  const prefiereReducido = useReducedMotion();
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={prefiereReducido ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 0.84, 0.28, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
