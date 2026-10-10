'use client';

/**
 * El Dial — pieza central de Frecuencia. Tiene que parecer una RADIO, no
 * un gráfico:
 *  - Display de radio: el valor en dígitos luminosos grandes (con los
 *    "8" apagados detrás, como un display real) y la estación sintonizada.
 *  - La señal: detrás de la banda, estática real (canvas de ruido) que
 *    crece cuanto más baja la aguja, y una onda que se dibuja (trazo con
 *    pathLength) y se vuelve azul, limpia y con glow cuanto más sube.
 *    Sigue la aguja en tiempo real, cuadro a cuadro.
 *  - La banda de sintonía a todo el ancho: una marca por unidad, más
 *    larga cada 5, número cada 25. Aguja vertical fina, hueso con glow
 *    azul. Se arrastra desde cualquier punto de la banda, con inercia al
 *    soltar y un "clic" visual (y háptico en celular) al pasar por cada 25.
 *  - Energías de escasez: 4 medidores tipo VU de LEDs chanfleados; cada
 *    toque prende un LED.
 * Mientras movés la aguja, el fondo vivo de toda la app sintoniza en vivo;
 * si te vas sin guardar, vuelve al dial guardado de hoy.
 * Con prefers-reduced-motion: sin inercia, ruido quieto y onda sin animar.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion';
import { copy } from './_copy';
import type { EnergiaEscasez } from '@/types/frecuencia';
import s from './_dial.module.css';
import base from './frecuencia.module.css';
import { BarraPasos } from './_barra-pasos';
import { useRestaurarSintonia, useSintonia } from './_shell';

const LEDS_POR_MEDIDOR = 10;
const ANCHO = 1000;
const ALTO_SENAL = 160;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Semilla fija por punto: el ruido de la onda tiembla pero no salta caótico. */
const SEMILLAS = Array.from({ length: 121 }, (_, i) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
});

function caminoSenal(valorCrudo: number, fase: number): string {
  const t = (clamp(valorCrudo, -100, 100) + 100) / 200; // 0 escasez … 1 abundancia
  const sucio = Math.pow(1 - t, 1.4);
  const puntos: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * ANCHO;
    const onda = Math.sin(i * 0.26 + fase) * (10 + 34 * t);
    const temblor = (SEMILLAS[(i * 7 + Math.floor(fase * 9)) % SEMILLAS.length] - 0.5) * 90 * sucio;
    puntos.push(`${x.toFixed(1)},${(ALTO_SENAL / 2 + onda + temblor).toFixed(1)}`);
  }
  return `M${puntos.join(' L')}`;
}

export function Dial({
  valorInicial = 0,
  energiasDisponibles,
  accionesSubida,
  energiasGuardadasIniciales,
  textoCta,
  onGuardar,
  onDespuesDeGuardar,
  onAtras,
  sinInstruccion,
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
  /** Dentro de un flujo: el Atrás va en la misma barra que el CTA (una sola BarraPasos por pantalla). */
  onAtras?: () => void;
  /** La pantalla que lo contiene ya explica cómo se usa (onboarding). */
  sinInstruccion?: boolean;
}) {
  const reducido = useReducedMotion();
  const sintonizarFondo = useSintonia();
  const restaurarFondo = useRestaurarSintonia();

  const inicial = clamp(Math.round(valorInicial), -100, 100);
  // Valor continuo de la aguja (para la inercia) y su lectura entera.
  const aguja = useMotionValue(inicial);
  const [valor, setValor] = useState(inicial);
  const [energias, setEnergias] = useState<Record<string, number>>(energiasGuardadasIniciales ?? {});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clic, setClic] = useState<number | null>(null);

  const bandaRef = useRef<HTMLDivElement>(null);
  const caminoRef = useRef<SVGPathElement>(null);
  const ruidoRef = useRef<HTMLCanvasElement>(null);
  const ultimoFondo = useRef<number | null>(null);
  const guardado = useRef(false);
  const arrastre = useRef<{ activo: boolean; ultimoX: number; ultimoT: number; velocidad: number }>({
    activo: false,
    ultimoX: 0,
    ultimoT: 0,
    velocidad: 0,
  });

  const izquierda = useTransform(aguja, (v) => `${((clamp(v, -100, 100) + 100) / 200) * 100}%`);
  const idGlow = `dialGlow${useId().replace(/:/g, '')}`;
  const inercia = useRef<{ stop: () => void } | null>(null);

  // Lectura entera + "clic" al cruzar cada 25 + fondo vivo en vivo (de a 10).
  const valorPrevio = useRef(inicial);
  useMotionValueEvent(aguja, 'change', (v) => {
    const entero = clamp(Math.round(v), -100, 100);
    const prev = valorPrevio.current;
    if (entero === prev) return;
    valorPrevio.current = entero;
    setValor(entero);
    // "Clic" al cruzar (o caer justo en) una marca de 25.
    const cruzo = Math.floor((prev + 100) / 25) !== Math.floor((entero + 100) / 25) || entero % 25 === 0;
    if (cruzo) {
      setClic(Math.round(entero / 25) * 25);
      if (typeof navigator !== 'undefined') navigator.vibrate?.(6);
    }
    const paso = Math.round(entero / 10) * 10;
    if (paso !== ultimoFondo.current) {
      ultimoFondo.current = paso;
      sintonizarFondo(paso);
    }
  });

  // Si se va sin guardar, el fondo vuelve al dial real de hoy.
  useEffect(() => () => {
    inercia.current?.stop();
    if (!guardado.current) restaurarFondo();
  }, [restaurarFondo]);

  // El "clic" de la marca de 25 dura un instante.
  useEffect(() => {
    if (clic === null) return;
    const id = setTimeout(() => setClic(null), 260);
    return () => clearTimeout(id);
  }, [clic]);

  // ── Señal en tiempo real: onda + estática, sin re-render por cuadro ──
  useEffect(() => {
    const canvas = ruidoRef.current;
    const ctx = canvas?.getContext('2d');
    const LADO_X = 240;
    const LADO_Y = 48;
    if (canvas) {
      canvas.width = LADO_X;
      canvas.height = LADO_Y;
    }
    const img = ctx?.createImageData(LADO_X, LADO_Y);
    const pintarRuido = () => {
      if (!ctx || !img) return;
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const g = (Math.random() * 255) | 0;
        d[i] = g;
        d[i + 1] = g;
        d[i + 2] = g;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    const pintarOnda = (fase: number) => {
      caminoRef.current?.setAttribute('d', caminoSenal(aguja.get(), fase));
    };

    pintarRuido();
    pintarOnda(0);
    if (reducido) {
      const off = aguja.on('change', () => pintarOnda(0));
      return () => off();
    }

    let raf = 0;
    let ultimoRuido = 0;
    const t0 = performance.now();
    const loop = (ahora: number) => {
      pintarOnda((ahora - t0) / 420);
      // La estática solo se repinta si se ve (escasez), ~16 cuadros/s.
      if (aguja.get() < 20 && ahora - ultimoRuido > 60) {
        pintarRuido();
        ultimoRuido = ahora;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [aguja, reducido]);

  const t = (valor + 100) / 200;
  const enAbundancia = valor > 0;
  const enEscasez = valor < 0;

  // ── Arrastre en cualquier punto de la banda, con inercia ──
  const valorDesdeX = useCallback((clientX: number) => {
    const r = bandaRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return aguja.get();
    return clamp(((clientX - r.left) / r.width) * 200 - 100, -100, 100);
  }, [aguja]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (e.button !== 0) return;
    inercia.current?.stop();
    aguja.stop();
    guardado.current = false;
    arrastre.current = { activo: true, ultimoX: e.clientX, ultimoT: performance.now(), velocidad: 0 };
    aguja.set(valorDesdeX(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a.activo) return;
    const ahora = performance.now();
    const r = bandaRef.current?.getBoundingClientRect();
    const dt = Math.max(1, ahora - a.ultimoT);
    if (r && r.width) a.velocidad = (((e.clientX - a.ultimoX) / r.width) * 200 * 1000) / dt; // unidades/s
    a.ultimoX = e.clientX;
    a.ultimoT = ahora;
    aguja.set(valorDesdeX(e.clientX));
  };
  const onPointerUp = () => {
    const a = arrastre.current;
    if (!a.activo) return;
    a.activo = false;
    if (reducido || Math.abs(a.velocidad) < 20) return;
    // Inercia: la aguja sigue un poco con la velocidad que traía.
    inercia.current = animate(aguja, aguja.get(), {
      type: 'inertia',
      velocity: a.velocidad,
      power: 0.25,
      timeConstant: 260,
      min: -100,
      max: 100,
      bounceStiffness: 400,
      bounceDamping: 40,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const salto = e.shiftKey ? 10 : 1;
    let nuevo: number | null = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nuevo = valor - salto;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nuevo = valor + salto;
    if (e.key === 'PageDown') nuevo = valor - 10;
    if (e.key === 'PageUp') nuevo = valor + 10;
    if (e.key === 'Home') nuevo = -100;
    if (e.key === 'End') nuevo = 100;
    if (nuevo === null) return;
    e.preventDefault();
    inercia.current?.stop();
    aguja.stop();
    guardado.current = false;
    aguja.set(clamp(nuevo, -100, 100));
  };

  const marcas = useMemo(() => Array.from({ length: 201 }, (_, i) => i - 100), []);

  function sumarEnergia(key: string, delta: number) {
    setEnergias((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }));
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
    guardado.current = true;
    sintonizarFondo(valor);
    onDespuesDeGuardar?.();
  }

  const textoValor = valor > 0 ? `+${valor}` : `${valor}`;

  return (
    <div className={s.wrap}>
      {!sinInstruccion && <p className={base.subtitulo}>{copy.dial.instruccionArrastre}</p>}

      {/* ── Display de radio ── */}
      <div className={`${s.display} ${enAbundancia ? s.displayAlto : enEscasez ? s.displayBajo : ''}`} aria-atomic>
        <span className={s.displayDigitos}>
          <span className={s.displayApagado} aria-hidden>
            -888
          </span>
          <span className={s.displayEncendido}>{textoValor.padStart(4, ' ')}</span>
        </span>
        <span className={s.displayEstacion} aria-live="polite">
          <i className={s.displayLed} aria-hidden />
          {enAbundancia ? copy.dial.abundanciaFm : enEscasez ? copy.dial.escasezFm : copy.dial.entreLasDos}
        </span>
      </div>

      {/* ── La señal + la banda de sintonía ── */}
      <div className={s.radio}>
        <div className={s.senal} aria-hidden>
          <canvas ref={ruidoRef} className={s.estatica} style={{ opacity: Math.pow(1 - t, 1.3) * 0.85 }} />
          <svg className={s.ondaSvg} viewBox={`0 0 ${ANCHO} ${ALTO_SENAL}`} preserveAspectRatio="none">
            <defs>
              <filter id={idGlow} filterUnits="userSpaceOnUse" x="-20" y="-40" width={ANCHO + 40} height={ALTO_SENAL + 80}>
                <feGaussianBlur stdDeviation={3 + 4 * t} result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              ref={caminoRef}
              d={caminoSenal(inicial, 0)}
              fill="none"
              stroke={`rgba(${Math.round(150 - 58 * t)}, ${Math.round(150 + 4 * t)}, ${Math.round(150 + 105 * t)}, ${0.35 + 0.65 * t})`}
              strokeWidth={1.2 + 1.6 * t}
              vectorEffect="non-scaling-stroke"
              filter={t > 0.45 ? `url(#${idGlow})` : undefined}
              initial={reducido === false ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 0.84, 0.28, 1] }}
            />
          </svg>
        </div>

        <div
          ref={bandaRef}
          className={s.banda}
          role="slider"
          aria-label={copy.dial.kicker}
          aria-orientation="horizontal"
          aria-valuemin={-100}
          aria-valuemax={100}
          aria-valuenow={valor}
          aria-valuetext={`${textoValor} · ${enAbundancia ? copy.dial.abundanciaFm : enEscasez ? copy.dial.escasezFm : copy.dial.entreLasDos}`}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <div className={s.marcas} aria-hidden>
            {marcas.map((m) => (
              <span
                key={m}
                className={`${s.marca} ${m % 25 === 0 ? s.marca25 : m % 5 === 0 ? s.marca5 : ''} ${clic === m ? s.marcaClic : ''}`}
                style={{ left: `${((m + 100) / 200) * 100}%` }}
              />
            ))}
          </div>
          <div className={s.numeros} aria-hidden>
            {[-100, -75, -50, -25, 0, 25, 50, 75, 100].map((m) => (
              <span key={m} className={`${s.numero} ${clic === m ? s.numeroClic : ''}`} style={{ left: `${((m + 100) / 200) * 100}%` }}>
                {m > 0 ? `+${m}` : m}
              </span>
            ))}
          </div>
          <motion.div className={`${s.aguja} ${enAbundancia ? s.agujaAlta : ''}`} style={{ left: izquierda }} aria-hidden>
            <span className={s.agujaCabeza} />
          </motion.div>
        </div>
        <div className={s.extremos} aria-hidden>
          <span>{copy.dial.escasezFm}</span>
          <span>{copy.dial.abundanciaFm}</span>
        </div>
      </div>

      {/* ── Energías de escasez: medidores VU ── */}
      <div className={s.energias}>
        <p className={s.energiasTitulo}>{copy.dial.energiasTitulo}</p>
        <p className={s.energiasAyuda}>{copy.dial.energiasInstruccion}</p>
        <div className={s.medidores}>
          {energiasDisponibles.map((en) => {
            const n = energias[en.key] ?? 0;
            return (
              <div key={en.key} className={s.medidor}>
                <button
                  type="button"
                  className={s.medidorLeds}
                  onClick={() => sumarEnergia(en.key, 1)}
                  aria-label={`${en.nombre}: ${n}. ${copy.dial.sumarEnergia}`}
                >
                  {Array.from({ length: LEDS_POR_MEDIDOR }, (_, i) => {
                    const encendido = i < n;
                    const zona = i >= 7 ? s.ledRojo : i >= 4 ? s.ledAmbar : s.ledVerde;
                    return <i key={i} className={`${s.led} ${zona} ${encendido ? s.ledOn : ''}`} style={{ order: LEDS_POR_MEDIDOR - i }} />;
                  })}
                </button>
                <span className={s.medidorNumero}>{String(n).padStart(2, '0')}</span>
                <span className={s.medidorNombre}>{en.nombre}</span>
                <button
                  type="button"
                  className={s.medidorRestar}
                  onClick={() => sumarEnergia(en.key, -1)}
                  disabled={n === 0}
                  aria-label={`${copy.dial.restarEnergia}: ${en.nombre}`}
                >
                  −
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {enEscasez && accionesSubida.length > 0 && (
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

      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}

      <BarraPasos>
        {onAtras && (
          <button type="button" className={base.btnSec} onClick={onAtras} disabled={guardando}>
            {copy.botones.atras}
          </button>
        )}
        <button type="button" className={base.btn} onClick={handleGuardar} disabled={guardando}>
          {guardando ? copy.botones.guardando : textoCta}
        </button>
      </BarraPasos>
    </div>
  );
}
