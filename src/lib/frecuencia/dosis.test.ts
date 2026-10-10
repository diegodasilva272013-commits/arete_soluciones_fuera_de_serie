import { describe, expect, it } from 'vitest';
import { proponerAjustesDosis, type SemanaDeCumplimiento } from './dosis';

const reglas = { subir: { semanas: 2, cumplimientoMin: 0.8 }, bajar: { semanas: 2, cumplimientoMax: 0.5 } };
const tarea = { id: 't1', titulo: 'Entrenar', dosisActual: 2, dosisObjetivo: 4 };
const semana = (lunes: string, planificados: number, cumplidos: number, id = 't1'): SemanaDeCumplimiento => ({ lunes, porTarea: { [id]: { planificados, cumplidos } } });

describe('proponerAjustesDosis', () => {
  it('propone subir tras 2 semanas con >=80% de cumplimiento', () => {
    const r = proponerAjustesDosis([tarea], [semana('2026-10-05', 2, 2), semana('2026-09-28', 5, 4)], reglas);
    expect(r).toEqual([{ tareaId: 't1', titulo: 'Entrenar', tipo: 'subir', de: 2, a: 3, cumplimientos: [1, 0.8] }]);
  });

  it('no sube si solo una de las dos semanas cumple', () => {
    expect(proponerAjustesDosis([tarea], [semana('2026-10-05', 2, 2), semana('2026-09-28', 2, 1)], reglas)).toEqual([]);
  });

  it('no sube por encima de la dosis objetivo', () => {
    expect(proponerAjustesDosis([{ ...tarea, dosisActual: 4 }], [semana('2026-10-05', 4, 4), semana('2026-09-28', 4, 4)], reglas)).toEqual([]);
  });

  it('sube sin tope si no hay dosis objetivo', () => {
    const r = proponerAjustesDosis([{ ...tarea, dosisObjetivo: null, dosisActual: 7 }], [semana('2026-10-05', 7, 7), semana('2026-09-28', 7, 7)], reglas);
    expect(r[0].a).toBe(8);
  });

  it('propone bajar tras 2 semanas con <=50%', () => {
    const r = proponerAjustesDosis([tarea], [semana('2026-10-05', 4, 2), semana('2026-09-28', 4, 0)], reglas);
    expect(r[0]).toMatchObject({ tipo: 'bajar', de: 2, a: 1 });
  });

  it('nunca baja de 1 por semana', () => {
    expect(proponerAjustesDosis([{ ...tarea, dosisActual: 1 }], [semana('2026-10-05', 1, 0), semana('2026-09-28', 1, 0)], reglas)).toEqual([]);
  });

  it('un cumplimiento intermedio (entre 50% y 80%) no propone nada', () => {
    expect(proponerAjustesDosis([tarea], [semana('2026-10-05', 4, 3), semana('2026-09-28', 4, 3)], reglas)).toEqual([]);
  });

  it('sin datos suficientes (menos semanas o semana sin planificado) no propone', () => {
    expect(proponerAjustesDosis([tarea], [semana('2026-10-05', 2, 2)], reglas)).toEqual([]);
    expect(proponerAjustesDosis([tarea], [semana('2026-10-05', 2, 2), semana('2026-09-28', 0, 0)], reglas)).toEqual([]);
    expect(proponerAjustesDosis([tarea], [semana('2026-10-05', 2, 2), { lunes: '2026-09-28', porTarea: {} }], reglas)).toEqual([]);
  });

  it('evalúa cada tarea por separado', () => {
    const tareas = [tarea, { id: 't2', titulo: 'Leer', dosisActual: 3, dosisObjetivo: 3 }];
    const semanas: SemanaDeCumplimiento[] = [
      { lunes: 'a', porTarea: { t1: { planificados: 2, cumplidos: 2 }, t2: { planificados: 3, cumplidos: 0 } } },
      { lunes: 'b', porTarea: { t1: { planificados: 2, cumplidos: 2 }, t2: { planificados: 3, cumplidos: 1 } } },
    ];
    expect(proponerAjustesDosis(tareas, semanas, reglas).map((p) => `${p.tareaId}:${p.tipo}`)).toEqual(['t1:subir', 't2:bajar']);
  });

  it('el cumplimiento se topa en 100% aunque haya más cumplidos que planificados', () => {
    const r = proponerAjustesDosis([tarea], [semana('a', 2, 5), semana('b', 2, 5)], reglas);
    expect(r[0].cumplimientos).toEqual([1, 1]);
  });
});
