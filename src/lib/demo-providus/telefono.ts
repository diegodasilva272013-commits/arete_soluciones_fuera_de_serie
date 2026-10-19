/**
 * Teléfonos argentinos para la demo de Providus. De este número depende la
 * llamada del Sprint 4: tiene que salir en E.164 móvil (+549 + 10 dígitos)
 * o la llamada no sale.
 */

export function soloDigitos(s: string): string {
  return s.replace(/\D/g, '');
}

/**
 * Lo que escribe la persona → "+549" + 10 dígitos, o null si no se puede armar.
 * Cubre: 0351 15 123-4567 · 351 15 123 4567 · 3511234567 · +54 9 351 123 4567 · 011 15 1234-5678.
 */
export function normalizarTelefono(entrada: string): string | null {
  let d = soloDigitos(entrada);
  if (d.startsWith('54')) d = d.slice(2); // código de país
  if (d.length === 11 && d.startsWith('9')) d = d.slice(1); // el 9 de celular de "+54 9 ..."
  if (d.startsWith('0')) d = d.slice(1); // 0351 → 351
  // El 15 va justo después del código de área (2, 3 o 4 dígitos): con él son 12 dígitos, sin él 10.
  if (d.length === 12) {
    for (const i of [2, 3, 4]) {
      if (d.slice(i, i + 2) === '15') {
        d = d.slice(0, i) + d.slice(i + 2);
        break;
      }
    }
  }
  return d.length === 10 ? `+549${d}` : null;
}

/** "+5493511234567" → "+54 9 351 123-4567" (CABA/GBA, área 11: "+54 9 11 1234-5678"). */
export function formatoLegible(e164: string): string {
  const d = e164.replace(/^\+549/, '');
  if (d.length !== 10) return e164;
  if (d.startsWith('11')) return `+54 9 11 ${d.slice(2, 6)}-${d.slice(6)}`;
  return `+54 9 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Solo dígitos, espacios, guiones, paréntesis y "+" al principio. */
export function caracteresValidos(entrada: string): boolean {
  return /^\+?[\d\s\-()]+$/.test(entrada.trim());
}
