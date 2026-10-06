'use client';

/**
 * Causa raíz del dock tapando contenido (no un parche por pantalla):
 * el CONTENEDOR reserva el espacio del dock con padding-bottom, acá y
 * en ningún otro lado. Cualquier pantalla nueva de Frecuencia queda
 * cubierta automáticamente, sin tener que acordarse de nada al
 * crearla. Vive en el layout, no en frecuencia.module.css ni en una
 * pantalla suelta.
 */

import { usePathname } from 'next/navigation';
import { Dock } from './_dock';
import { dockVisibleEnRuta, DOCK_CLEARANCE_CSS } from './_dock-visibilidad';

export function ContenidoConDock({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mostrarDock = dockVisibleEnRuta(pathname);

  return (
    <>
      <div style={{ paddingBottom: mostrarDock ? DOCK_CLEARANCE_CSS : 0 }}>{children}</div>
      <Dock />
    </>
  );
}
