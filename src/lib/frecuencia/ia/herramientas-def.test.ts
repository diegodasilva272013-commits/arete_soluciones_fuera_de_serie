import { describe, expect, it } from 'vitest';
import { DEFINICIONES, NOMBRES_HERRAMIENTAS, parsearArgumentos, validarArmarSemana, validarCrearObjetivo, validarCrearTarea, validarEscribirCriterio, validarIniciarBloque, validarRegistrarEvidencia } from './herramientas-def';

const ID = '3f2b8c1e-5a4d-4e8b-9c1a-2b7d6e5f4a3c';

describe('definiciones', () => {
  it('hay una definición por cada herramienta, con parámetros objeto y required ⊆ properties', () => {
    expect(DEFINICIONES.map((d) => d.function.name).sort()).toEqual([...NOMBRES_HERRAMIENTAS].sort());
    for (const d of DEFINICIONES) {
      const p = d.function.parameters as { properties: Record<string, unknown>; required: string[] };
      expect(d.function.description.length).toBeGreaterThan(10);
      for (const r of p.required) expect(Object.keys(p.properties)).toContain(r);
    }
  });
});

describe('validarCrearObjetivo', () => {
  it('acepta lo mínimo y recorta', () => {
    expect(validarCrearObjetivo({ titulo: '  Cerrar 10 clientes  ' })).toMatchObject({ ok: true, datos: { titulo: 'Cerrar 10 clientes', fechaLimite: null } });
  });
  it('rechaza sin título, con título vacío y con fecha mal formada', () => {
    expect(validarCrearObjetivo({}).ok).toBe(false);
    expect(validarCrearObjetivo({ titulo: '   ' }).ok).toBe(false);
    expect(validarCrearObjetivo({ titulo: 'x', fecha_limite: '31/03/2027' }).ok).toBe(false);
    expect(validarCrearObjetivo(null).ok).toBe(false);
  });
});

describe('validarCrearTarea', () => {
  it('acepta una tarea completa', () => {
    const r = validarCrearTarea({ objetivo_id: ID, titulo: 'Llamar', protocolo: ['Abrir lista', '', 'Llamar'], tipo_energia: 'profundo', duracion_min: 50, dosis_objetivo: 3 });
    expect(r).toMatchObject({ ok: true, datos: { protocolo: ['Abrir lista', 'Llamar'], duracionMin: 50, dosisObjetivo: 3 } });
  });
  it('rechaza id inválido, tipo desconocido y números fuera de rango', () => {
    expect(validarCrearTarea({ objetivo_id: 'no-es-uuid', titulo: 'x' }).ok).toBe(false);
    expect(validarCrearTarea({ objetivo_id: ID, titulo: 'x', tipo_energia: 'raro' }).ok).toBe(false);
    expect(validarCrearTarea({ objetivo_id: ID, titulo: 'x', duracion_min: 2 }).ok).toBe(false);
    expect(validarCrearTarea({ objetivo_id: ID, titulo: 'x', dosis_objetivo: 9 }).ok).toBe(false);
    expect(validarCrearTarea({ objetivo_id: ID, titulo: 'x', duracion_min: 50.5 }).ok).toBe(false);
  });
});

describe('otras validaciones', () => {
  it('armar_semana: confirmar solo true cuenta', () => {
    expect(validarArmarSemana({})).toEqual({ ok: true, datos: { confirmar: false } });
    expect(validarArmarSemana({ confirmar: true })).toEqual({ ok: true, datos: { confirmar: true } });
    expect(validarArmarSemana({ confirmar: 'si' }).ok).toBe(false);
  });
  it('iniciar_bloque y registrar_evidencia', () => {
    expect(validarIniciarBloque({ bloque_id: ID }).ok).toBe(true);
    expect(validarIniciarBloque({ bloque_id: '1' }).ok).toBe(false);
    expect(validarRegistrarEvidencia({ texto: 'Entrené' }).ok).toBe(true);
    expect(validarRegistrarEvidencia({ texto: ' ' }).ok).toBe(false);
  });
  it('escribir_criterio exige los 4 puntos ("si no está escrito, no es criterio")', () => {
    const ok = { titulo: 'Descuentos', que_se_decide: 'Si aprobar un descuento', que_entra: 'Hasta 10%', que_no_entra: 'Más de 10%', costo_si_sale_mal: 'Margen', reversible: false };
    expect(validarEscribirCriterio(ok).ok).toBe(true);
    const falta = validarEscribirCriterio({ ...ok, que_no_entra: '' });
    expect(falta.ok).toBe(false);
    expect(!falta.ok && falta.error).toContain('que_no_entra');
    expect(validarEscribirCriterio({ ...ok, reversible: true }).ok).toBe(false); // reversible sin tiempo
    expect(validarEscribirCriterio({ ...ok, reversible: true, tiempo_reversibilidad: '1 semana' }).ok).toBe(true);
  });
  it('parsearArgumentos no tira con JSON roto', () => {
    expect(parsearArgumentos('{"a":1}')).toEqual({ a: 1 });
    expect(parsearArgumentos('')).toEqual({});
    expect(parsearArgumentos('{roto')).toBeNull();
  });
});
