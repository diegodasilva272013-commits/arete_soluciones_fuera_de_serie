'use client';

/**
 * FONDO VIVO — la firma de Frecuencia. Tres capas fijas detrás de todo:
 *
 *  1. Base estática (siempre): negro + un halo azul radial. Es también el
 *     fallback si no hay WebGL2 y la versión de prefers-reduced-motion.
 *  2. AnimatedGradient, preset Prism (el mismo de PasswordGate), muy
 *     tenue. Se dibuja a media resolución y se escala ×2: es un degradé
 *     suave, no pierde nada, y en un celular cuesta un cuarto de píxeles.
 *  3. Grano / estática: una baldosa de ruido generada una sola vez en un
 *     canvas, que salta de posición con steps() — grano de película,
 *     barato (solo transform, sin repintar el canvas por frame).
 *
 * La mezcla sigue la frecuencia del Dial de hoy (-100..100):
 * escasez → más grano, más desaturado, más viñeta;
 * abundancia → azul limpio, casi sin grano. Toda la app "sintoniza".
 */

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import s from './_shell.module.css';

const AnimatedGradient = dynamic(() => import('@/components/ui/animated-gradient'), { ssr: false });

// Objeto estable: AnimatedGradient recrea el programa WebGL si cambia la
// identidad de `config` (useMemo sobre [config]).
const PRISM = { preset: 'Prism' as const };
const ESTILO_GRADIENTE = { zIndex: 0 };

/** -100..100 → 0..1. Sin dial cargado hoy: punto medio (ni estática ni señal limpia). */
export function sintoniaDe(frecuencia: number | null): number {
  if (frecuencia === null || Number.isNaN(frecuencia)) return 0.5;
  return Math.min(1, Math.max(0, (frecuencia + 100) / 200));
}

function useBaldosaDeRuido(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const lado = 160;
    const canvas = document.createElement('canvas');
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(lado, lado);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setUrl(canvas.toDataURL('image/png'));
  }, []);
  return url;
}

export function FondoVivo({ frecuencia, gradienteActivo = true }: { frecuencia: number | null; gradienteActivo?: boolean }) {
  const reducido = useReducedMotion();
  const ruido = useBaldosaDeRuido();
  const t = sintoniaDe(frecuencia);

  const estilos = useMemo(
    () => ({
      gradiente: {
        opacity: 0.07 + 0.17 * t,
        filter: `saturate(${(0.12 + 0.98 * t).toFixed(2)}) brightness(${(0.75 + 0.3 * t).toFixed(2)})`,
      },
      halo: { opacity: 0.25 + 0.75 * t },
      grano: { opacity: 0.22 - 0.18 * t },
      vineta: { opacity: 0.95 - 0.45 * t },
    }),
    [t]
  );

  return (
    <div className={s.fondo} aria-hidden data-sintonia={t.toFixed(2)}>
      <div className={s.fondoBase} />
      <div className={s.fondoHalo} style={estilos.halo} />
      {/* reducido es null en el primer render: se espera a saber que NO pidió
          movimiento reducido antes de bajar el chunk del shader. */}
      {reducido === false && gradienteActivo && (
        <div className={s.fondoGradiente} style={estilos.gradiente}>
          <AnimatedGradient config={PRISM} style={ESTILO_GRADIENTE} />
        </div>
      )}
      {ruido && (
        <div
          className={reducido ? s.fondoGranoQuieto : s.fondoGrano}
          style={{ ...estilos.grano, backgroundImage: `url(${ruido})` }}
        />
      )}
      <div className={s.fondoVineta} style={estilos.vineta} />
    </div>
  );
}
