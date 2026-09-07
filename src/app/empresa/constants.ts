/**
 * Datos de contacto de Areté Soluciones — fuente única.
 * Antes estaban hardcodeados en 8 archivos distintos.
 */
export const WA_NUMBER = '5491143215678';
export const WA_NUMBER_DISPLAY = '+54 9 11 4321-5678';
export const PHONE_TEL = '+541143215678';
export const PHONE_DISPLAY = '+54 11 4321-5678';
export const EMAIL = 'hola@aretesoluciones.com';

/** Arma un link de wa.me con el texto pre-cargado correcto por página. */
export function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}
