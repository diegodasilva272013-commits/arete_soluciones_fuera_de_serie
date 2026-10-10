'use client';

/**
 * Ecualizador — 10 bandas verticales (una por área, desde
 * frecuencia_knowledge_blocks.areas_vida), arrastrables de 0 a 10.
 * Elegís la palanca (se resalta en azul con glow) y la manzana podrida
 * (titila en gris). Guarda en frecuencia_areas.
 */

import { useCallback, useRef, useState } from 'react';
import { copy } from './_copy';
import type { AreaVida, AreasReglas } from '@/types/frecuencia';
import s from './_ecualizador.module.css';
import base from './frecuencia.module.css';
import { BarraPasos } from './_barra-pasos';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const SEGMENTOS = 10;

function BandaVertical({
  area,
  indice,
  nivel,
  esPalanca,
  esManzana,
  onCambiar,
}: {
  area: AreaVida;
  indice: number;
  nivel: number;
  esPalanca: boolean;
  esManzana: boolean;
  onCambiar: (nivel: number) => void;
}) {
  const pistaRef = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  const calcularDesdeY = useCallback(
    (clientY: number) => {
      const el = pistaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const fraccion = clamp((rect.bottom - clientY) / rect.height, 0, 1);
      onCambiar(Math.round(fraccion * SEGMENTOS));
    },
    [onCambiar]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    arrastrando.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    calcularDesdeY(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!arrastrando.current) return;
    calcularDesdeY(e.clientY);
  };
  const onPointerUp = () => {
    arrastrando.current = false;
  };

  const tono = esPalanca ? s.bandaPalanca : esManzana ? s.bandaManzana : '';

  return (
    <div className={`${s.banda} ${tono}`} style={{ ['--i' as string]: indice }}>
      <span className={s.etiquetaRol} aria-hidden>
        {esPalanca ? copy.areas.palancaLabel : esManzana ? copy.areas.manzanaLabel : ''}
      </span>
      <span className={s.nivelLabel}>{String(nivel).padStart(2, '0')}</span>
      <div
        ref={pistaRef}
        className={s.pistaVertical}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={area.nombre}
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={SEGMENTOS}
        aria-valuenow={nivel}
        tabIndex={0}
        onKeyDown={(e) => {
          let n: number | null = null;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') n = nivel + 1;
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') n = nivel - 1;
          if (e.key === 'Home') n = 0;
          if (e.key === 'End') n = SEGMENTOS;
          if (n === null) return;
          e.preventDefault();
          onCambiar(clamp(n, 0, SEGMENTOS));
        }}
      >
        {Array.from({ length: SEGMENTOS }, (_, i) => (
          <i key={i} className={`${s.seg} ${i < nivel ? s.segOn : ''} ${i === nivel - 1 ? s.segTope : ''}`} />
        ))}
      </div>
      <span className={s.nombre}>{area.nombre}</span>
    </div>
  );
}

/**
 * Área más alta = palanca, más baja = manzana podrida. Con empate se toma
 * la primera en el orden de las áreas y se avisa. Si todas tienen el mismo
 * número no hay extremos que sugerir.
 */
function sugerirExtremos(areas: AreaVida[], niveles: Record<string, number>) {
  const valores = areas.map((a) => niveles[a.key] ?? 0);
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  if (!areas.length || max === min) {
    return { palanca: null, manzana: null, todasIguales: true, empatePalanca: false, empateManzana: false };
  }
  const conMax = areas.filter((a) => (niveles[a.key] ?? 0) === max);
  const conMin = areas.filter((a) => (niveles[a.key] ?? 0) === min);
  return {
    palanca: conMax[0].key,
    manzana: conMin[0].key,
    todasIguales: false,
    empatePalanca: conMax.length > 1,
    empateManzana: conMin.length > 1,
  };
}

export function Ecualizador({
  areas,
  reglas,
  nivelesIniciales,
  palancaInicial,
  manzanaInicial,
  textoCta,
  onGuardar,
  onDespuesDeGuardar,
  onAtras,
  preguntaPalanca,
  preguntaManzana,
  exigirSeleccion = false,
}: {
  areas: AreaVida[];
  reglas: AreasReglas | null;
  nivelesIniciales?: Record<string, number>;
  palancaInicial?: string | null;
  manzanaInicial?: string | null;
  textoCta: string;
  onGuardar: (input: {
    niveles: Record<string, number>;
    palancaKey: string | null;
    manzanaKey: string | null;
  }) => Promise<{ error?: string; ok?: boolean }>;
  onDespuesDeGuardar?: () => void;
  /** Dentro de un flujo: el Atrás va en la misma barra que el CTA (una sola BarraPasos por pantalla). */
  onAtras?: () => void;
  /** En el onboarding, las preguntas de palanca y manzana vienen de onboarding_copy. */
  preguntaPalanca?: string;
  preguntaManzana?: string;
  /**
   * En el onboarding el paso solo cuenta como hecho con palanca Y manzana
   * elegidas (frecuencia-progreso.ts): sin esto, se "guardaba", avanzaba y
   * el onboarding lo devolvía al Ecualizador vacío una y otra vez.
   */
  exigirSeleccion?: boolean;
}) {
  const [niveles, setNiveles] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    for (const a of areas) base[a.key] = nivelesIniciales?.[a.key] ?? 0;
    return base;
  });
  // La más fuerte y la más débil salen SOLAS de los números (la más alta y
  // la más baja): preguntarlas aparte, después de pedir los números, no
  // tenía sentido. La persona solo toca si quiere otra (p. ej. un empate);
  // desde ese momento manda lo que eligió.
  const [palancaElegida, setPalanca] = useState<string | null>(palancaInicial ?? null);
  const [manzanaElegida, setManzana] = useState<string | null>(manzanaInicial ?? null);
  const sugerida = sugerirExtremos(areas, niveles);
  const palanca = palancaElegida ?? sugerida.palanca;
  const manzana = manzanaElegida ?? sugerida.manzana;
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {
    if (palanca && manzana && palanca === manzana) {
      setError(copy.areas.mismaArea);
      return;
    }
    if (exigirSeleccion && (!palanca || !manzana)) {
      setError(sugerida.todasIguales ? copy.areas.todasIguales : !palanca && !manzana ? copy.areas.faltaPalancaYManzana : !palanca ? copy.areas.faltaPalanca : copy.areas.faltaManzana);
      return;
    }
    setGuardando(true);
    setError(null);
    const r = await onGuardar({ niveles, palancaKey: palanca, manzanaKey: manzana });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    onDespuesDeGuardar?.();
  }

  return (
    <div className={s.wrap}>
      <p className={base.subtitulo}>{copy.areas.subtitulo}</p>

      <div className={s.bandas}>
        {areas.map((area, i) => (
          <BandaVertical
            key={area.key}
            indice={i}
            area={area}
            nivel={niveles[area.key] ?? 0}
            esPalanca={palanca === area.key}
            esManzana={manzana === area.key}
            onCambiar={(n) => setNiveles((prev) => ({ ...prev, [area.key]: n }))}
          />
        ))}
      </div>

      {!sugerida.todasIguales && <p className={s.seleccionNota}>{copy.areas.marcadasSolas}</p>}

      <div className={s.seleccionGrupo}>
        <p className={s.seleccionPregunta}>{preguntaPalanca ?? copy.areas.elegirPalanca}</p>
        {!palancaElegida && sugerida.empatePalanca && <p className={s.seleccionNota}>{copy.areas.empate}</p>}
        <div className={s.chipsSeleccion}>
          {areas.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`${s.chipArea} ${palanca === a.key ? s.chipAreaElegidaPalanca : ''}`}
              onClick={() => setPalanca(a.key)}
            >
              {a.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className={s.seleccionGrupo}>
        <p className={s.seleccionPregunta}>{preguntaManzana ?? copy.areas.elegirManzana}</p>
        {!manzanaElegida && sugerida.empateManzana && <p className={s.seleccionNota}>{copy.areas.empate}</p>}
        <div className={s.chipsSeleccion}>
          {areas.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`${s.chipArea} ${manzana === a.key ? s.chipAreaElegidaManzana : ''}`}
              onClick={() => setManzana(a.key)}
            >
              {a.nombre}
            </button>
          ))}
        </div>
      </div>

      {reglas && (
        <div className={s.reglas}>
          <p>{reglas.palanca}</p>
          <p>{reglas.manzana_podrida}</p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          // El aviso puede quedar fuera de vista (las bandas son altas): se lleva a la vista.
          ref={(el) => el?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          className={s.error}
        >
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
