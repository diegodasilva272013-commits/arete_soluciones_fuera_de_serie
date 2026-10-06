'use client';

/**
 * El Dial moviéndose solo, sin interacción: muestra la idea de las dos
 * radios antes de que la persona toque nada.
 *  - modo "barrido" (intro): la aguja va y viene de Escasez FM a
 *    Abundancia FM. Con escasez, la señal es ruido gris; con abundancia,
 *    una onda azul limpia con glow. Si moverFondo, todo el fondo vivo de
 *    la app sintoniza con la aguja.
 *  - modo "sintonizar" (cierre): sube una sola vez hasta +100 y queda.
 * Con prefers-reduced-motion queda quieto (barrido: en 0; sintonizar: +100).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { copy } from '../_copy';
import { useSintonia } from '../_shell';
import s from './_onboarding.module.css';

const ANCHO = 1000;
const ALTO = 120;

function valorEn(modo: 'barrido' | 'sintonizar', ms: number): number {
  if (modo === 'sintonizar') {
    const t = Math.min(1, ms / 2600);
    const e = 1 - Math.pow(1 - t, 3);
    return -60 + 160 * e;
  }
  // Ida y vuelta en 9 s, con pausa breve en cada punta.
  const periodo = 9000;
  const f = (ms % periodo) / periodo;
  const tri = f < 0.5 ? f * 2 : 2 - f * 2;
  const suave = tri * tri * (3 - 2 * tri);
  return Math.round(-100 + 200 * suave);
}

/** Semilla fija por punto: el "ruido" no salta caóticamente cuadro a cuadro. */
const RUIDO = Array.from({ length: 81 }, (_, i) => Math.sin(i * 12.9898) * 43758.5453 % 1);

function caminoSenal(valor: number, fase: number): string {
  const t = (valor + 100) / 200; // 0 escasez … 1 abundancia
  const puntos: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = (i / 80) * ANCHO;
    const onda = Math.sin(i * 0.32 + fase) * (14 + 18 * t);
    const ruido = (RUIDO[(i + Math.floor(fase * 7)) % RUIDO.length] - 0.5) * 70 * (1 - t);
    puntos.push(`${x.toFixed(1)},${(ALTO / 2 + onda * t + ruido).toFixed(1)}`);
  }
  return `M${puntos.join(' L')}`;
}

export function DialAutomatico({ modo, moverFondo = false }: { modo: 'barrido' | 'sintonizar'; moverFondo?: boolean }) {
  const reducido = useReducedMotion();
  const setFrecuencia = useSintonia();
  const [valor, setValor] = useState(modo === 'sintonizar' ? -60 : 0);
  const [fase, setFase] = useState(0);
  const ultimoFondo = useRef<number | null>(null);

  useEffect(() => {
    if (reducido) {
      setValor(modo === 'sintonizar' ? 100 : 0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = (ahora: number) => {
      const ms = ahora - t0;
      const v = valorEn(modo, ms);
      setValor(v);
      setFase(ms / 380);
      // El fondo de toda la app sigue la aguja, de a saltos de 10 (no
      // hace falta re-sintonizar el fondo en cada cuadro).
      if (moverFondo) {
        const paso = Math.round(v / 10) * 10;
        if (paso !== ultimoFondo.current) {
          ultimoFondo.current = paso;
          setFrecuencia(paso);
        }
      }
      if (modo === 'barrido' || ms < 2700) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      // La intro es antes del primer check-in: al salir, el fondo vuelve
      // al punto medio (todavía no hay dial de hoy).
      if (moverFondo) setFrecuencia(null);
    };
  }, [modo, moverFondo, reducido, setFrecuencia]);

  const t = (valor + 100) / 200;
  const enAbundancia = valor >= 0;
  const xAguja = t * ANCHO;
  const camino = useMemo(() => caminoSenal(valor, fase), [valor, fase]);

  const marcas = useMemo(() => {
    const out: { x: number; grande: boolean; etiqueta?: string }[] = [];
    for (let v = -100; v <= 100; v += 5) {
      const grande = v % 25 === 0;
      out.push({ x: ((v + 100) / 200) * ANCHO, grande, etiqueta: grande ? (v > 0 ? `+${v}` : `${v}`) : undefined });
    }
    return out;
  }, []);

  return (
    <div className={s.dialAuto} aria-hidden>
      <div className={s.dialAutoDisplay}>
        <span className={`${s.dialAutoValor} ${enAbundancia ? s.dialAutoValorAlto : s.dialAutoValorBajo}`}>
          {valor > 0 ? `+${valor}` : valor}
        </span>
        <span className={s.dialAutoEstacion}>{enAbundancia ? copy.dial.abundanciaFm : copy.dial.escasezFm}</span>
      </div>

      <svg className={s.dialAutoSvg} viewBox={`0 0 ${ANCHO} ${ALTO + 46}`} preserveAspectRatio="none">
        <defs>
          {/* userSpaceOnUse: con las unidades por defecto (caja del elemento), una
              línea vertical tiene ancho 0 y el filtro la borra entera. */}
          <filter id="dialAutoGlow" filterUnits="userSpaceOnUse" x="-20" y="-40" width={ANCHO + 40} height={ALTO + 120}>
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* la señal: ruido gris ↔ onda azul */}
        <path
          d={camino}
          fill="none"
          stroke={`rgba(${Math.round(138 - 91 * t)}, ${Math.round(138 - 15 * t)}, ${Math.round(138 + 108 * t)}, ${0.35 + 0.6 * t})`}
          strokeWidth={1.5 + t}
          filter={t > 0.5 ? 'url(#dialAutoGlow)' : undefined}
          vectorEffect="non-scaling-stroke"
        />
        {/* banda de sintonía */}
        <line x1="0" x2={ANCHO} y1={ALTO + 10} y2={ALTO + 10} stroke="rgba(242,239,233,0.22)" vectorEffect="non-scaling-stroke" />
        {marcas.map((m) => (
          <line
            key={m.x}
            x1={m.x}
            x2={m.x}
            y1={ALTO + 10}
            y2={ALTO + (m.grande ? 22 : 16)}
            stroke={m.grande ? 'rgba(242,239,233,0.6)' : 'rgba(242,239,233,0.25)'}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* aguja */}
        <line x1={xAguja} x2={xAguja} y1="0" y2={ALTO + 26} stroke="#F2EFE9" strokeWidth="1.5" filter="url(#dialAutoGlow)" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={s.dialAutoEscala}>
        {marcas.filter((m) => m.etiqueta).map((m) => (
          <span key={m.x}>{m.etiqueta}</span>
        ))}
      </div>
    </div>
  );
}
