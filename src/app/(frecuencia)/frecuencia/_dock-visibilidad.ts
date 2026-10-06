/**
 * Única fuente de verdad de "¿esta RUTA admite el dock?". Los flujos de
 * varios pasos que son ruta propia se listan acá; los que son un estado
 * dentro de una pantalla (EN EL AIRE, revisar la semana armada) lo piden
 * con useOcultarDock (_shell.tsx). El dock y el espacio que se le reserva
 * leen ambos de useDockVisible, así nunca quedan desincronizados.
 */
const RUTAS_SIN_DOCK = ['/frecuencia/onboarding', '/frecuencia/cierre'];

export function dockVisibleEnRuta(pathname: string | null): boolean {
  return !RUTAS_SIN_DOCK.some((r) => pathname?.startsWith(r));
}

/**
 * Alto del dock más el safe-area del dispositivo: el contenedor lo
 * reserva como padding-bottom para que el dock nunca tape contenido.
 * Si el dock cambia de tamaño (ver .dockItem en _dock.module.css: 44px
 * de ícono + label + paddings), se ajusta acá y listo.
 */
export const DOCK_CLEARANCE_CSS = 'calc(112px + env(safe-area-inset-bottom, 0px))';

/** Alto del header fijo del shell; el contenido arranca debajo. */
export const HEADER_ALTO_CSS = 'calc(56px + env(safe-area-inset-top, 0px))';
