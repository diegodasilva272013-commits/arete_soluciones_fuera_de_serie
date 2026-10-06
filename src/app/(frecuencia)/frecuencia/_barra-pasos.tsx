'use client';

/**
 * Fila de acciones de una pantalla (Atrás / Continuar / Guardar).
 * Dentro de un flujo de varios pasos (onboarding, cierre del día, armar
 * semana) se fija abajo como barra de vidrio, en el lugar que dejó el
 * dock; el shell ya le reservó el alto (BARRA_CLEARANCE_CSS), así que
 * nunca tapa contenido. Fuera de un flujo es la fila normal en línea.
 *
 * Regla: una sola BarraPasos visible por pantalla. Un componente que se
 * reusa dentro de un flujo (Dial, Ecualizador) recibe onAtras para meter
 * el Atrás en SU barra, en vez de que el flujo agregue otra.
 */

import { CapaFija, useEnFlujo } from './_shell';
import base from './frecuencia.module.css';
import s from './_shell.module.css';

export function BarraPasos({
  children,
  centrada = false,
  className,
  style,
}: {
  children: React.ReactNode;
  centrada?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const enFlujo = useEnFlujo();

  if (!enFlujo) {
    return (
      <div className={[base.filaBotones, className].filter(Boolean).join(' ')} style={{ ...(centrada ? { justifyContent: 'center' } : null), ...style }}>
        {children}
      </div>
    );
  }

  return (
    <CapaFija>
      <div className={s.barraFija}>
        <div className={s.barraFijaInterior} style={centrada ? { justifyContent: 'center' } : undefined}>
          {children}
        </div>
      </div>
    </CapaFija>
  );
}
