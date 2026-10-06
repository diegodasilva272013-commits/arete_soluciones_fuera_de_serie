'use client';

/**
 * "Línea de transmisión": el campo de texto del onboarding. Sin caja:
 * texto grande sobre una línea base que se dibuja en azul (con glow) al
 * enfocar, y una marca "Transmitiendo" mientras escribís. El textarea
 * crece solo con el texto.
 *
 * El placeholder de onboarding_copy no es un texto gris que desaparece:
 * es el COMIENZO de la frase ("Hoy soy…"). Con inicioDeFrase() el campo
 * arranca escrito con ese comienzo y la persona sigue la oración.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { copy } from '../_copy';
import s from './_onboarding.module.css';

/** "Hoy soy…" → "Hoy soy " (el campo arranca con eso). */
export function inicioDeFrase(placeholder?: string): string {
  if (!placeholder) return '';
  return placeholder.replace(/(…|\.\.\.)\s*$/, '').trimEnd() + ' ';
}

/** true si hay algo escrito además del comienzo de frase que vino de fábrica. */
export function tieneRespuesta(valor: string, placeholder?: string): boolean {
  const limpio = valor.trim();
  if (!limpio) return false;
  return limpio !== inicioDeFrase(placeholder).trim();
}

type Props = {
  valor: string;
  onCambiar: (v: string) => void;
  /** Texto gris de ayuda (solo para campos de una línea, p. ej. listas). */
  sugerencia?: string;
  tipo?: 'texto' | 'linea' | 'hora' | 'fecha';
  onEnter?: () => void;
  /** Al salir del campo (p. ej. sumar a la lista lo que quedó escrito). */
  onSalir?: () => void;
  autoFocus?: boolean;
  etiqueta?: string;
};

export function LineaTransmision({ valor, onCambiar, sugerencia, tipo = 'texto', onEnter, onSalir, autoFocus, etiqueta }: Props) {
  const [enfocado, setEnfocado] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // El textarea crece con el contenido (sin barra de scroll interna).
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, [valor]);

  // Al enfocar, el cursor va al final: así se sigue escribiendo después
  // del comienzo de frase en vez de pisarlo.
  useEffect(() => {
    if (!autoFocus || tipo !== 'texto') return;
    const el = areaRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(el.value.length, el.value.length);
  }, [autoFocus, tipo]);

  const comun = {
    onFocus: () => setEnfocado(true),
    onBlur: () => {
      setEnfocado(false);
      onSalir?.();
    },
    'aria-label': etiqueta,
  };

  return (
    <div className={`${s.linea} ${enfocado ? s.lineaActiva : ''} ${valor.trim() ? s.lineaConTexto : ''}`}>
      {tipo === 'texto' ? (
        <textarea
          ref={areaRef}
          className={s.lineaCampo}
          value={valor}
          rows={1}
          onChange={(e) => onCambiar(e.target.value)}
          {...comun}
        />
      ) : (
        <input
          className={`${s.lineaCampo} ${tipo === 'hora' || tipo === 'fecha' ? s.lineaCampoMono : ''}`}
          type={tipo === 'hora' ? 'time' : tipo === 'fecha' ? 'date' : 'text'}
          value={valor}
          placeholder={sugerencia}
          autoFocus={autoFocus}
          onChange={(e) => onCambiar(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          {...comun}
        />
      )}
      <span className={s.lineaBase} aria-hidden />
      <span className={s.lineaSenal} aria-hidden>
        <i />
        {copy.onboarding.transmitiendo}
      </span>
    </div>
  );
}
