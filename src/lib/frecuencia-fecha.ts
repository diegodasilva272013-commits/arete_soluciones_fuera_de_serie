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

// ── Semana (día + hora → timestamptz real, para frecuencia_bloques) ───

/** YYYY-MM-DD del lunes de la semana calendario actual, en la timezone del usuario. */
export function lunesDeLaSemana(timezone: string | null | undefined, ahora: Date = new Date()): string {
  const hoyISO = fechaLocal(timezone, ahora);
  const [y, m, d] = hoyISO.split('-').map(Number);
  const comoFecha = new Date(Date.UTC(y, m - 1, d));
  const diaIso = comoFecha.getUTCDay() || 7; // domingo (0) -> 7
  comoFecha.setUTCDate(comoFecha.getUTCDate() - (diaIso - 1));
  return comoFecha.toISOString().slice(0, 10);
}

/** `fechaISO` + `dias` días (calendario, sin horario). */
export function fechaMasDias(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

/**
 * Convierte una fecha+hora de PARED en una timezone IANA a su instante
 * UTC real (para guardar en timestamptz). Sin librería: arma un
 * instante "candidato" tratándolo como UTC, lo formatea de vuelta en la
 * timezone pedida, y corrige por la diferencia — maneja DST sin tener
 * que tabular offsets a mano.
 */
export function horaEnTimezoneAUtc(fechaISO: string, horaHHMM: string, timezone: string | null | undefined): Date {
  const tz = timezone || TIMEZONE_DEFAULT;
  const [year, month, day] = fechaISO.split('-').map(Number);
  const [hour, minute] = horaHHMM.split(':').map(Number);
  const candidatoUtc = Date.UTC(year, month - 1, day, hour, minute);

  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const partes = formateador.formatToParts(new Date(candidatoUtc));
  const parte = (tipo: string) => Number(partes.find((p) => p.type === tipo)!.value);
  const horaParte = parte('hour') % 24; // Intl puede devolver "24" para medianoche
  const comoSiFueraUtc = Date.UTC(parte('year'), parte('month') - 1, parte('day'), horaParte, parte('minute'), parte('second'));

  const diferencia = candidatoUtc - comoSiFueraUtc;
  return new Date(candidatoUtc + diferencia);
}
