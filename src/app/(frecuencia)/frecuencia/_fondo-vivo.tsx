'use client';

/**
 * Fondo vivo de toda Frecuencia: AnimatedGradient (preset Prism, el del
 * sitio) muy tenue + grano de estática en canvas. La mezcla sigue al
 * Dial de hoy:
 *   dial bajo (escasez)    → más grano, gradiente apagado y desaturado
 *   dial alto (abundancia) → casi sin grano, azul limpio y más presente
 *   sin check-in           → punto medio
 * Cambia con transición suave apenas se guarda un dial nuevo (lo avisa
 * _shell.tsx), sin recargar. Con prefers-reduced-motion: degradé y grano
 * estáticos, sin animación.
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from 'framer-motion';
import { useDialDelShell } from './_shell';
import s from './_shell.module.css';

const AnimatedGradient = dynamic(() => import('@/components/ui/animated-gradient'), { ssr: false });

/** 0 = escasez total, 1 = abundancia total. */
function sintonia(dial: number | null) {
  if (dial === null) return 0.5;
  return Math.min(1, Math.max(0, (dial + 100) / 200));
}

export function FondoVivo() {
  const { dial } = useDialDelShell();
  const reducido = useReducedMotion();
  // useReducedMotion da null en el servidor: el shader recién se decide
  // después de montar, así servidor y navegador renderizan lo mismo
  // (si no, React tira error de hidratación con movimiento reducido).
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const t = sintonia(dial);

  const estilo = {
    '--fv-gradiente': (0.28 + 0.32 * t).toFixed(3),
    '--fv-saturacion': (0.1 + 0.9 * t).toFixed(3),
    '--fv-grano': (0.04 + 0.16 * (1 - t)).toFixed(3),
  } as React.CSSProperties;

  return (
    <div className={s.fondo} style={estilo} aria-hidden data-sintonia={t.toFixed(2)}>
      <div className={s.fondoGradiente}>
        {/* Base quieta: es la versión con movimiento reducido y, para el
            resto, lo que se ve hasta que carga el shader. */}
        <div className={s.fondoGradienteEstatico} />
        {montado && !reducido && (
          // El shader corre a 1/4 de los píxeles (contenedor a mitad de
          // tamaño, escalado x2): es un degradé suave, no pierde nada y
          // en celular baja mucho el costo.
          <div className={s.fondoGradienteReducido}>
            <AnimatedGradient config={{ preset: 'Prism' }} style={{ zIndex: 0 }} />
          </div>
        )}
      </div>
      <Grano animado={montado && !reducido} />
      <div className={s.fondoVineta} />
    </div>
  );
}

/**
 * Estática de radio, grano fino a 1 px: se generan unos pocos mosaicos de
 * ruido una sola vez y en cada cuadro se pinta uno con un corrimiento al
 * azar (patrón repetido, barato para la GPU). Nada de recalcular píxeles
 * de toda la pantalla por cuadro.
 */
function Grano({ animado }: { animado: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const LADO = 192;
    const patrones = Array.from({ length: 6 }, () => {
      const tile = document.createElement('canvas');
      tile.width = LADO;
      tile.height = LADO;
      const tctx = tile.getContext('2d')!;
      const img = tctx.createImageData(LADO, LADO);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);
      return ctx.createPattern(tile, 'repeat')!;
    });

    const medir = () => {
      canvas.width = Math.min(window.innerWidth, 2048);
      canvas.height = Math.min(window.innerHeight, 2048);
    };
    const pintar = () => {
      const patron = patrones[(Math.random() * patrones.length) | 0];
      const dx = (Math.random() * LADO) | 0;
      const dy = (Math.random() * LADO) | 0;
      ctx.save();
      ctx.translate(-dx, -dy);
      ctx.fillStyle = patron;
      ctx.fillRect(0, 0, canvas.width + LADO, canvas.height + LADO);
      ctx.restore();
    };

    medir();
    pintar();
    const alCambiarTamano = () => {
      medir();
      pintar();
    };
    window.addEventListener('resize', alCambiarTamano);
    if (!animado) return () => window.removeEventListener('resize', alCambiarTamano);

    // ~14 cuadros por segundo alcanza para que se lea como estática viva.
    let raf = 0;
    let ultimo = 0;
    const loop = (ahora: number) => {
      if (ahora - ultimo > 70) {
        pintar();
        ultimo = ahora;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', alCambiarTamano);
    };
  }, [animado]);

  return <canvas ref={ref} className={s.fondoGrano} />;
}
