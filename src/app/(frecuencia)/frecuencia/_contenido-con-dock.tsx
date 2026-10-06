'use client';

/**
 * Causa raíz del dock tapando contenido (no un parche por pantalla):
 * el CONTENEDOR reserva el espacio del dock con padding-bottom, acá y
 * en ningún otro lado, y arranca debajo del header fijo. Cualquier
 * pantalla nueva de Frecuencia queda cubierta automáticamente. La
 * visibilidad sale de useDockVisible: la misma que usa el Dock.
 */

import { useDockVisible } from './_shell';
import { DOCK_CLEARANCE_CSS } from './_dock-visibilidad';
import s from './_shell.module.css';

export function ContenidoConDock({ children }: { children: React.ReactNode }) {
  const mostrarDock = useDockVisible();

  return (
    <div className={s.contenido} style={{ paddingBottom: mostrarDock ? DOCK_CLEARANCE_CSS : 0 }}>
      {children}
    </div>
  );
}
