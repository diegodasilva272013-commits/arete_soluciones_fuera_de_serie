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

function BandaVertical({
  area,
  nivel,
  esPalanca,
  esManzana,
  onCambiar,
}: {
  area: AreaVida;
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
      onCambiar(Math.round(fraccion * 10));
    },
    [onCambiar]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    arrastrando.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calcularDesdeY(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!arrastrando.current) return;
    calcularDesdeY(e.clientY);
  };
  const onPointerUp = () => {
    arrastrando.current = false;
  };

  const rellenoClase = esPalanca ? s.rellenoPalanca : esManzana ? s.rellenoManzana : '';

  return (
    <div className={s.banda}>
      <span className={`${s.nivelLabel} ${esPalanca ? s.nivelLabelPalanca : ''} ${esManzana ? s.nivelLabelManzana : ''}`}>
        {nivel}
      </span>
      <div
        ref={pistaRef}
        className={s.pistaVertical}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={area.nombre}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={nivel}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') onCambiar(clamp(nivel + 1, 0, 10));
          if (e.key === 'ArrowDown') onCambiar(clamp(nivel - 1, 0, 10));
        }}
      >
        <div className={`${s.relleno} ${rellenoClase}`} style={{ height: `${(nivel / 10) * 100}%` }} />
      </div>
      <span className={s.nombre}>{area.nombre}</span>
    </div>
  );
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
}) {
  const [niveles, setNiveles] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    for (const a of areas) base[a.key] = nivelesIniciales?.[a.key] ?? 0;
    return base;
  });
  const [palanca, setPalanca] = useState<string | null>(palancaInicial ?? null);
  const [manzana, setManzana] = useState<string | null>(manzanaInicial ?? null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar() {
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
        {areas.map((area) => (
          <BandaVertical
            key={area.key}
            area={area}
            nivel={niveles[area.key] ?? 0}
            esPalanca={palanca === area.key}
            esManzana={manzana === area.key}
            onCambiar={(n) => setNiveles((prev) => ({ ...prev, [area.key]: n }))}
          />
        ))}
      </div>

      <div className={s.seleccionGrupo}>
        <p className={s.seleccionPregunta}>{preguntaPalanca ?? copy.areas.elegirPalanca}</p>
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

      {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 16 }}>{error}</p>}

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
