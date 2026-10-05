'use client';

/**
 * El Dial — pieza central de Frecuencia. Banda de sintonía de -100 a
 * +100 con aguja arrastrable (inercia nativa de Framer Motion, mouse y
 * touch). Por debajo de 0, estática/grano desaturado; por encima,
 * AnimatedGradient Prism + una onda de señal.
 *
 * Nota de reuso: el pedido original decía reusar "SvgPathDrawing" para
 * la onda, pero ese componente (SvgPathDrawingTextAnimation) solo
 * anima TEXTO, no un trazo arbitrario — no sirve para una onda. Acá se
 * dibuja la onda con un <motion.path> + pathLength, que es la pieza
 * nativa de Framer para este caso (mismo efecto de "trazo", aplicado a
 * una forma en vez de a letras).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { copy } from './_copy';
import type { EnergiaEscasez } from '@/types/frecuencia';
import s from './_dial.module.css';
import base from './frecuencia.module.css';

const AnimatedGradient = dynamic(() => import('@/components/ui/animated-gradient'), { ssr: false });

const MARCAS = [-100, -50, 0, 50, 100];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function Dial({
  valorInicial = 0,
  energiasDisponibles,
  accionesSubida,
  energiasGuardadasIniciales,
  textoCta,
  onGuardar,
  onDespuesDeGuardar,
}: {
  valorInicial?: number;
  energiasDisponibles: EnergiaEscasez[];
  accionesSubida: string[];
  energiasGuardadasIniciales?: Record<string, number>;
  textoCta: string;
  onGuardar: (input: {
    frecuencia: number;
    energiasEscasez: Record<string, number>;
    accionesSubida: string[];
  }) => Promise<{ error?: string; ok?: boolean }>;
  onDespuesDeGuardar?: () => void;
}) {
  const prefiereReducido = useReducedMotion();
  const pistaRef = useRef<HTMLDivElement>(null);

  const [valor, setValor] = useState(clamp(Math.round(valorInicial), -100, 100));
  const [energias, setEnergias] = useState<Record<string, number>>(energiasGuardadasIniciales ?? {});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // x del handle en px, 0 = extremo izquierdo de la pista.
  const x = useMotionValue(0);
  const [anchoPista, setAnchoPista] = useState(0);

  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;
    const medir = () => setAnchoPista(el.getBoundingClientRect().width);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Posiciona el handle según `valor` cuando cambia el ancho medido o
  // al montar (no durante el arrastre, ahí manda el puntero).
  useEffect(() => {
    if (anchoPista <= 0) return;
    const px = ((valor + 100) / 200) * anchoPista;
    x.set(px);
  }, [anchoPista]); // eslint-disable-line react-hooks/exhaustive-deps

  const actualizarValorDesdeX = useCallback(
    (px: number) => {
      if (anchoPista <= 0) return;
      const v = Math.round((clamp(px, 0, anchoPista) / anchoPista) * 200 - 100);
      setValor(v);
    },
    [anchoPista]
  );

  const enAbundancia = valor >= 0;
  // Piso de 0.25 para que la escena nunca quede vacía justo en el
  // límite (valor = 0) — sin esto, las dos capas daban opacity 0 ahí.
  const abundancia = enAbundancia ? 0.25 + 0.75 * clamp(valor / 100, 0, 1) : 0;
  const escasez = !enAbundancia ? 0.25 + 0.75 * clamp(-valor / 100, 0, 1) : 0;

  const energiasOrdenPath = useMemo(() => {
    // Onda simple, semilla fija (no aleatoria en cada render).
    const puntos = [0, 15, 30, 45, 60, 75, 90, 100].map((px, i) => {
      const y = 50 + Math.sin(i * 1.3) * 22;
      return `${(px / 100) * 400},${y}`;
    });
    return `M${puntos.join(' L')}`;
  }, []);

  async function tocarEnergia(key: string) {
    setEnergias((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }

  async function handleGuardar() {
    setGuardando(true);
    setError(null);
    const r = await onGuardar({ frecuencia: valor, energiasEscasez: energias, accionesSubida });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    onDespuesDeGuardar?.();
  }

  return (
    <div className={s.wrap}>
      <p className={base.subtitulo}>{copy.dial.instruccionArrastre}</p>

      <div className={s.lectura}>
        <span className={`${s.lecturaValor} ${enAbundancia ? s.lecturaValorAbundancia : s.lecturaValorEscasez}`}>
          {valor > 0 ? `+${valor}` : valor}
        </span>
        <span className={s.lecturaEstacion}>{enAbundancia ? copy.dial.abundanciaFm : copy.dial.escasezFm}</span>
      </div>

      <div className={s.escena}>
        <div className={s.capa} style={{ opacity: escasez }}>
          <div className={`${s.capa} ${s.ruido}`} />
        </div>
        <div className={s.capa} style={{ opacity: abundancia, isolation: 'isolate', position: 'relative' }}>
          {abundancia > 0.02 && (
            <AnimatedGradient
              config={{ preset: 'custom', color1: '#050505', color2: '#2F7BF6', color3: '#5C9AFF', rotation: -50, proportion: 1, scale: 0.012, speed: prefiereReducido ? 0 : 18, distortion: 0, swirl: 40, swirlIterations: 14, softness: 50, offset: -299, shape: 'Checks', shapeSize: 45 }}
            />
          )}
          <svg viewBox="0 0 400 100" preserveAspectRatio="none" className={s.ondaSvg}>
            <motion.path
              d={energiasOrdenPath}
              className={s.ondaPath}
              initial={false}
              animate={prefiereReducido ? { pathLength: 1 } : { pathLength: [0, 1] }}
              transition={prefiereReducido ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>
      </div>

      <div className={s.banda}>
        <div className={s.marcas}>
          {MARCAS.map((m) => (
            <div key={m} className={`${s.marca} ${m === 0 ? s.marcaCero : ''}`}>
              <span className={s.marcaLinea} />
              <span className={s.marcaLabel}>{m > 0 ? `+${m}` : m}</span>
            </div>
          ))}
        </div>
        <div className={s.pista} ref={pistaRef} />
        <motion.div
          className={`${s.aguja} ${enAbundancia ? s.agujaAbundancia : ''}`}
          style={{ x }}
          drag="x"
          dragConstraints={pistaRef}
          dragElastic={0.04}
          dragMomentum={!prefiereReducido}
          dragTransition={{ power: 0.1, timeConstant: 300, bounceStiffness: 500, bounceDamping: 50 }}
          onDrag={() => actualizarValorDesdeX(x.get())}
          onDragEnd={() => {
            // Deja que la inercia termine y vuelve a leer la posición final.
            const id = setInterval(() => actualizarValorDesdeX(x.get()), 16);
            setTimeout(() => clearInterval(id), 900);
          }}
          role="slider"
          aria-label={copy.dial.kicker}
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={valor}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setValor((v) => clamp(v - 1, -100, 100));
            if (e.key === 'ArrowRight') setValor((v) => clamp(v + 1, -100, 100));
          }}
        />
      </div>

      <div className={s.energias}>
        <p className={base.campoLabel}>{copy.dial.energiasTitulo}</p>
        <p className={s.lecturaEstacion}>{copy.dial.energiasInstruccion}</p>
        <div className={s.energiasGrid}>
          {energiasDisponibles.map((en) => (
            <button key={en.key} type="button" className={s.energia} onClick={() => tocarEnergia(en.key)}>
              <span className={s.energiaNombre}>{en.nombre}</span>
              <span className={s.energiaContador}>{energias[en.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {valor < 0 && (
        <div className={s.panelCambio}>
          <p className={s.panelCambioTitulo}>{copy.botones.cambiarDeDial}</p>
          <div className={s.accionesLista}>
            {accionesSubida.map((a) => (
              <span key={a} className={s.accionChip}>
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 16 }}>{error}</p>}

      <div className={base.filaBotones}>
        <button type="button" className={base.btn} onClick={handleGuardar} disabled={guardando}>
          {guardando ? copy.botones.guardando : textoCta}
        </button>
      </div>
    </div>
  );
}
