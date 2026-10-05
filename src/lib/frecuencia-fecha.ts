/**
 * La "fecha" y el "momento" (manana/noche) de dial y espejo se calculan
 * SIEMPRE en la timezone de frecuencia_preferencias del usuario, nunca
 * con la hora del servidor. Regla 3 de la Fase 3.
 */

const TIMEZONE_DEFAULT = 'America/Argentina/Buenos_Aires';

/** Fecha local del usuario como YYYY-MM-DD, en su timezone. */
export function fechaLocal(timezone: string | null | undefined, ahora: Date = new Date()): string {
  const tz = timezone || TIMEZONE_DEFAULT;
  const formateador = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formateador.format(ahora); // en-CA da YYYY-MM-DD
}

/** Hora local del usuario (0-23), en su timezone. */
function horaLocal(timezone: string | null | undefined, ahora: Date = new Date()): number {
  const tz = timezone || TIMEZONE_DEFAULT;
  const formateador = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false });
  const parte = formateador.formatToParts(ahora).find((p) => p.type === 'hour');
  const h = parte ? parseInt(parte.value, 10) : ahora.getHours();
  return h === 24 ? 0 : h;
}

/**
 * "manana" si la hora local está antes del mediodía, "noche" si es
 * después. Simple y predecible: el usuario entra una vez a la mañana y
 * una vez a la noche, cada entrada actualiza la fila de su momento.
 */
export function momentoDelDia(timezone: string | null | undefined, ahora: Date = new Date()): 'manana' | 'noche' {
  return horaLocal(timezone, ahora) < 12 ? 'manana' : 'noche';
}
