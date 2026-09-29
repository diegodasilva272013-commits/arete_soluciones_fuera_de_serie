import { cookies } from 'next/headers';

// Mismo patrón que las propuestas (propuesta-payma, propuesta-providus):
// una clave en una variable de entorno, cookie httpOnly de sesión. Acá
// además el acceso es a un entorno de prueba interno (Diego / Rodrigo),
// no a una propuesta comercial.
export const CJNOA_SESSION_COOKIE = 'cjnoa-whatsapp-session';
export const CJNOA_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

export function getCJNoaPassword(): string | undefined {
  return process.env.CJNOA_WHATSAPP_CLAVE;
}

export async function hasValidCJNoaSession(): Promise<boolean> {
  const expected = getCJNoaPassword();
  if (!expected) return true; // sin clave configurada, no bloquear

  const jar = await cookies();
  return jar.get(CJNOA_SESSION_COOKIE)?.value === 'ok';
}
