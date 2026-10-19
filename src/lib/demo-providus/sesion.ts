/**
 * DEMO PROVIDUS — sesiones y claves, SOLO del lado del servidor.
 *
 * Dos tipos de sesión, en una cookie firmada (HMAC-SHA256, httpOnly):
 *  - promotora: puede cargar registros y dar de baja los suyos.
 *  - admin: ve la central, administra promotoras/eventos/sucursales y puede dar de baja cualquiera.
 * Las claves de las promotoras se guardan con scrypt (nunca en texto plano).
 * Secretos en variables de entorno: DEMO_PROVIDUS_SECRETO (firma) y DEMO_PROVIDUS_ADMIN_CLAVE.
 */

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'pv_demo';
const HORAS_PROMOTORA = 12;
const HORAS_ADMIN = 10;

export type Sesion = { t: 'p'; id: string; exp: number } | { t: 'a'; exp: number };

function secreto(): string {
  const s = process.env.DEMO_PROVIDUS_SECRETO;
  if (!s || s.length < 16) throw new Error('Falta DEMO_PROVIDUS_SECRETO en el entorno del servidor.');
  return s;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');

export function firmar(sesion: Sesion, clave: string = secreto()): string {
  const cuerpo = b64(JSON.stringify(sesion));
  const firma = createHmac('sha256', clave).update(cuerpo).digest('base64url');
  return `${cuerpo}.${firma}`;
}

export function verificar(valor: string | undefined, ahora: number = Date.now(), clave: string = secreto()): Sesion | null {
  if (!valor) return null;
  const [cuerpo, firma] = valor.split('.');
  if (!cuerpo || !firma) return null;
  const esperada = createHmac('sha256', clave).update(cuerpo).digest('base64url');
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf-8')) as Sesion;
    if (typeof s.exp !== 'number' || s.exp < ahora) return null;
    if (s.t === 'p' && typeof s.id === 'string') return s;
    if (s.t === 'a') return s;
  } catch { /* cookie corrupta */ }
  return null;
}

/** Escribe la cookie de sesión. */
export function iniciarSesion(tipo: 'p' | 'a', id?: string) {
  const horas = tipo === 'p' ? HORAS_PROMOTORA : HORAS_ADMIN;
  const exp = Date.now() + horas * 3600_000;
  const sesion: Sesion = tipo === 'p' ? { t: 'p', id: id as string, exp } : { t: 'a', exp };
  cookies().set(COOKIE, firmar(sesion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: horas * 3600,
    path: '/',
  });
}

export function cerrarSesion() {
  cookies().set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' });
}

/** La sesión actual (cookie válida) o null. */
export function sesionActual(): Sesion | null {
  try {
    return verificar(cookies().get(COOKIE)?.value);
  } catch {
    return null;
  }
}
export const esAdmin = (s: Sesion | null): boolean => s?.t === 'a';

// ── claves ──────────────────────────────────────────────────────────────

const scrypt = (clave: string, sal: Buffer): Promise<Buffer> =>
  new Promise((ok, mal) => scryptCb(clave, sal, 32, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? mal(e) : ok(k))));

/** "scrypt$<sal>$<hash>" */
export async function hashearClave(clave: string): Promise<string> {
  const sal = randomBytes(16);
  return `scrypt$${b64(sal)}$${b64(await scrypt(clave, sal))}`;
}

export async function claveCorrecta(clave: string, guardado: string): Promise<boolean> {
  const [esquema, sal, hash] = guardado.split('$');
  if (esquema !== 'scrypt' || !sal || !hash) return false;
  const calculado = await scrypt(clave, Buffer.from(sal, 'base64url'));
  const esperado = Buffer.from(hash, 'base64url');
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}

/** Compara la clave de administración sin filtrar información por el tiempo de respuesta. */
export function claveAdminCorrecta(entrada: string): boolean {
  const real = process.env.DEMO_PROVIDUS_ADMIN_CLAVE;
  if (!real) return false;
  const a = createHmac('sha256', 'cmp').update(entrada).digest();
  const b = createHmac('sha256', 'cmp').update(real).digest();
  return timingSafeEqual(a, b);
}

/** Tope simple por IP (mejor esfuerzo por instancia) para frenar adivinar claves. */
const intentos = new Map<string, number[]>();
export function permitirIntento(ip: string, max = 10): boolean {
  const ahora = Date.now();
  const recientes = (intentos.get(ip) ?? []).filter((t) => ahora - t < 60_000);
  if (recientes.length >= max) {
    intentos.set(ip, recientes);
    return false;
  }
  recientes.push(ahora);
  intentos.set(ip, recientes);
  return true;
}
