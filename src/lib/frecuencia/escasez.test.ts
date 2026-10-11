import { describe, expect, it } from 'vitest';
import { detectarEscasez } from './escasez';

const palabras = {
  queja: ['no puedo', 'injusto', 'quej*'],
  envidia: ['ojalá fuera como'],
  critica: ['inútil'],
  resentimiento: ['rencor'],
};

describe('detectarEscasez', () => {
  it('no distingue mayúsculas ni acentos', () => {
    expect(detectarEscasez('Qué INÚTIL que es', palabras)).toEqual(['critica']);
    expect(detectarEscasez('ojala fuera como él', palabras)).toEqual(['envidia']);
  });
  it('detecta frases de varias palabras', () => {
    expect(detectarEscasez('hoy no puedo con nada', palabras)).toEqual(['queja']);
  });
  it('coincide por palabra entera: no encuentra dentro de otra palabra', () => {
    expect(detectarEscasez('el injustamente', palabras)).toEqual([]);
    expect(detectarEscasez('inutilizado', palabras)).toEqual([]);
  });
  it('el asterisco coincide por prefijo', () => {
    expect(detectarEscasez('me quejo todo el día', palabras)).toEqual(['queja']);
    expect(detectarEscasez('una queja', palabras)).toEqual(['queja']);
  });
  it('puede detectar varias energías a la vez', () => {
    expect(detectarEscasez('es injusto y siento rencor', palabras).sort()).toEqual(['queja', 'resentimiento']);
  });
  it('sin lista, sin texto o con datos raros no rompe ni detecta', () => {
    expect(detectarEscasez('no puedo', null)).toEqual([]);
    expect(detectarEscasez('   ', palabras)).toEqual([]);
    expect(detectarEscasez('no puedo', { queja: 'no es lista' as unknown as string[] })).toEqual([]);
    expect(detectarEscasez('no puedo', { queja: [''] })).toEqual([]);
  });
  it('puntuación no impide coincidir', () => {
    expect(detectarEscasez('¡Es injusto!', palabras)).toEqual(['queja']);
  });
});
