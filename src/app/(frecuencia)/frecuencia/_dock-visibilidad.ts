/**
 * Única fuente de verdad de "¿esta ruta es un flujo de varios pasos?".
 * En un flujo el dock se oculta y la navegación es la barra fija de
 * Atrás/Continuar (_barra-pasos.tsx). La usan el shell (para reservar
 * el espacio de abajo), el Dock y la barra, así nunca quedan
 * desincronizados.
 *
 * Los flujos que no son una ruta propia (EN EL AIRE es un overlay dentro
 * de /hoy; "armar semana" es un estado dentro de /semana) se declaran
 * desde la pantalla con useFlujoActivo() — ver _shell.tsx.
 */
const RUTAS_DE_FLUJO = ['/frecuencia/onboarding', '/frecuencia/cierre', '/frecuencia/revision'];

export function esRutaDeFlujo(pathname: string | null): boolean {
  return !!pathname && RUTAS_DE_FLUJO.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/**
 * Alto en reposo del dock (medido con Playwright: .dockWrap padding
 * 14 + 14, .dock padding 6 + 6, ítem 58) más el safe-area. Con el
 * puntero encima los ítems crecen hacia arriba un momento — igual que
 * un dock de escritorio, no se reserva ese extra.
 */
export const DOCK_CLEARANCE_CSS = 'calc(104px + env(safe-area-inset-bottom, 0px))';

/** Alto de la barra fija de Atrás/Continuar (padding 14 + 14, botón 46) más el safe-area. */
export const BARRA_CLEARANCE_CSS = 'calc(92px + env(safe-area-inset-bottom, 0px))';
