import { describe, expect, it } from 'vitest';
import { desbloqueaPorIndice, extraerJSON, normalizarPropuesta, revalidarPropuesta, sinCiclos, type TareaPropuesta } from './descomposicion';

const t = (titulo: string, dependeDe: number[] = []): TareaPropuesta => ({ titulo, protocolo: [], tipoEnergia: 'profundo', duracionMin: 50, dosisObjetivo: 2, dependeDe });

describe('extraerJSON', () => {
  it('lee JSON limpio, con cercas ```json y con texto alrededor', () => {
    expect(extraerJSON('{"a":1}')).toEqual({ a: 1 });
    expect(extraerJSON('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extraerJSON('Claro, acá va: {"a":1} ¡suerte!')).toEqual({ a: 1 });
    expect(extraerJSON('nada de json')).toBeNull();
  });
});

describe('normalizarPropuesta', () => {
  it('acepta una propuesta válida y acota valores raros', () => {
    const r = normalizarPropuesta({
      metas_por_periodo: [{ periodo: 'Mes 1', meta: 'Tener la lista' }, { periodo: '', meta: 'sin período' }],
      tareas: [
        { titulo: 'Armar la lista', protocolo: ['Abrir planilla', '', 'Cargar 50 nombres'], tipo_energia: 'profundo', duracion_min: 5000, dosis_objetivo: 99, depende_de: [] },
        { titulo: 'Llamar', tipo_energia: 'inventado', duracion_min: 'abc', depende_de: [0] },
      ],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.propuesta.metas).toEqual([{ periodo: 'Mes 1', meta: 'Tener la lista' }]);
    expect(r.propuesta.tareas[0]).toMatchObject({ protocolo: ['Abrir planilla', 'Cargar 50 nombres'], duracionMin: 120, dosisObjetivo: 5 });
    expect(r.propuesta.tareas[1]).toMatchObject({ tipoEnergia: 'profundo', duracionMin: 50, dependeDe: [0] });
  });

  it('acepta el JSON como string con cercas', () => {
    expect(normalizarPropuesta('```json\n{"tareas":[{"titulo":"A"}]}\n```').ok).toBe(true);
  });

  it('rechaza lo que no sirve', () => {
    expect(normalizarPropuesta(null).ok).toBe(false);
    expect(normalizarPropuesta('hola').ok).toBe(false);
    expect(normalizarPropuesta({ tareas: [] }).ok).toBe(false);
    expect(normalizarPropuesta({ tareas: [{ titulo: '  ' }] }).ok).toBe(false);
  });

  it('limita a 10 tareas', () => {
    const r = normalizarPropuesta({ tareas: Array.from({ length: 30 }, (_, i) => ({ titulo: `T${i}` })) });
    expect(r.ok && r.propuesta.tareas.length).toBe(10);
  });

  it('re-mapea dependencias cuando se descartan tareas sin título', () => {
    const r = normalizarPropuesta({ tareas: [{ titulo: 'A' }, { titulo: '' }, { titulo: 'C', depende_de: [0] }, { titulo: 'D', depende_de: [1, 2] }] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.propuesta.tareas.map((x) => x.titulo)).toEqual(['A', 'C', 'D']);
    expect(r.propuesta.tareas[1].dependeDe).toEqual([0]);
    expect(r.propuesta.tareas[2].dependeDe).toEqual([1]); // la dependencia a la tarea descartada se pierde
  });
});

describe('sinCiclos', () => {
  it('saca autodependencias, índices inexistentes y ciclos', () => {
    const r = sinCiclos([t('A', [0, 7]), t('B', [0]), t('C', [1])]);
    expect(r.map((x) => x.dependeDe)).toEqual([[], [0], [1]]);
    const ciclo = sinCiclos([t('A', [1]), t('B', [0])]);
    expect(ciclo.flatMap((x) => x.dependeDe).length).toBe(1); // se rompe en un solo punto
  });
});

describe('desbloqueaPorIndice', () => {
  it('es el inverso de depende_de', () => {
    expect(desbloqueaPorIndice([t('A'), t('B', [0]), t('C', [0, 1])])).toEqual([[1, 2], [2], []]);
  });
});

describe('revalidarPropuesta (lo que vuelve del navegador)', () => {
  it('conserva la propuesta ya normalizada: dosis, tipo, duración, dependencias y metas', () => {
    const original = normalizarPropuesta({ metas_por_periodo: [{ periodo: 'Mes 1', meta: 'M' }], tareas: [{ titulo: 'A', tipo_energia: 'creativo', duracion_min: 40, dosis_objetivo: 4 }, { titulo: 'B', depende_de: [0], dosis_objetivo: 1 }] });
    expect(original.ok).toBe(true);
    if (!original.ok) return;
    const r = revalidarPropuesta(original.propuesta);
    expect(r).toEqual(original);
  });
  it('vuelve a acotar lo que manipule el cliente y descarta ciclos', () => {
    const r = revalidarPropuesta({ metas: [], tareas: [{ titulo: 'A', duracionMin: 99999, dosisObjetivo: -3, dependeDe: [1] }, { titulo: 'B', dependeDe: [0] }] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.propuesta.tareas[0]).toMatchObject({ duracionMin: 120, dosisObjetivo: 1 });
    expect(r.propuesta.tareas.flatMap((x) => x.dependeDe).length).toBe(1);
  });
  it('rechaza basura', () => {
    expect(revalidarPropuesta(null).ok).toBe(false);
    expect(revalidarPropuesta({ tareas: [] }).ok).toBe(false);
  });
});
