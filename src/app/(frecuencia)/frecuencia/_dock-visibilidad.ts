/**
 * Única fuente de verdad de "¿se muestra el dock en esta ruta?" —
 * la usan tanto el Dock como el wrapper que reserva el espacio para
 * él, así nunca quedan desincronizados.
 */
export function dockVisibleEnRuta(pathname: string | null): boolean {
  return !pathname?.startsWith('/frecuencia/onboarding');
}

/**
 * Alto real del dock (medido: .dock ~49.5px + .dockWrap padding 14px
 * arriba + 14px abajo) más el safe-area del dispositivo. Constante
 * única: si el dock cambia de tamaño, se ajusta acá y listo — nadie
 * más tiene que acordarse de reservar espacio a mano.
 */
export const DOCK_CLEARANCE_CSS = 'calc(80px + env(safe-area-inset-bottom, 0px))';
