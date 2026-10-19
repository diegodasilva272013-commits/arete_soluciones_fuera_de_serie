import { describe, expect, it } from 'vitest';
import { caracteresValidos, formatoLegible, normalizarTelefono } from './telefono';

describe('normalizarTelefono', () => {
  it('los tres formatos de la verificación dan el mismo resultado', () => {
    expect(normalizarTelefono('0351 15 123-4567')).toBe('+5493511234567');
    expect(normalizarTelefono('3511234567')).toBe('+5493511234567');
    expect(normalizarTelefono('+5493511234567')).toBe('+5493511234567');
  });
  it('otras formas habituales', () => {
    expect(normalizarTelefono('+54 9 351 123-4567')).toBe('+5493511234567');
    expect(normalizarTelefono('54 351 15 123 4567')).toBe('+5493511234567');
    expect(normalizarTelefono('(0351) 15-123-4567')).toBe('+5493511234567');
    expect(normalizarTelefono('351 123 4567')).toBe('+5493511234567');
  });
  it('Buenos Aires (área de 2 dígitos)', () => {
    expect(normalizarTelefono('011 15 1234-5678')).toBe('+5491112345678');
    expect(normalizarTelefono('11 1234 5678')).toBe('+5491112345678');
    expect(normalizarTelefono('+54 9 11 1234-5678')).toBe('+5491112345678');
  });
  it('un 15 que no es el prefijo no se toca', () => {
    expect(normalizarTelefono('351 1512345')).toBe('+5493511512345');
  });
  it('devuelve null si no se puede armar', () => {
    expect(normalizarTelefono('')).toBeNull();
    expect(normalizarTelefono('12345')).toBeNull();
    expect(normalizarTelefono('351123456')).toBeNull();
    expect(normalizarTelefono('35112345678901')).toBeNull();
  });
});

describe('formatoLegible', () => {
  it('arma el texto que se muestra debajo del campo', () => {
    expect(formatoLegible('+5493511234567')).toBe('+54 9 351 123-4567');
    expect(formatoLegible('+5491112345678')).toBe('+54 9 11 1234-5678');
  });
});

describe('caracteresValidos', () => {
  it('acepta dígitos, espacios, guiones y paréntesis', () => {
    expect(caracteresValidos('0351 15 123-4567')).toBe(true);
    expect(caracteresValidos('+54 (351) 123-4567')).toBe(true);
  });
  it('rechaza letras y símbolos', () => {
    expect(caracteresValidos('351abc4567')).toBe(false);
    expect(caracteresValidos('351#1234567')).toBe(false);
  });
});
