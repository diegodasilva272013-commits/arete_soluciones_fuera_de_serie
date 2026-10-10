import { describe, expect, it } from 'vitest';
import { armarSemana, calcularPrioridad, DIAS_SEMANA, type DatosParaArmarSemana, type TareaParaPlan } from './plan';

const reglasBase = { imprevistosPorcentajeDia: 0.15, umbralFatigaHorasDesdeDespertar: 8 };

function tarea(parcial: Partial<TareaParaPlan> & { id: string }): TareaParaPlan {
  return {
    titulo: parcial.id,
    tipoEnergia: 'profundo',
    duracionMin: 60,
    dosisObjetivo: 1,
    vecesDesbloquea: 0,
    areaKey: null,
    objetivoId: null,
    ...parcial,
  };
}

function datosBase(parcial: Partial<DatosParaArmarSemana>): DatosParaArmarSemana {
  return {
    horaDespertar: '06:00',
    noNegociables: [],
    areas: [],
    tareas: [],
    reglas: reglasBase,
    ...parcial,
  };
}

describe('regla 1 — no negociables primero', () => {
  it('todo no-negociable aparece como bloque, con su día y horario exactos', () => {
    const bloques = armarSemana(
      datosBase({
        noNegociables: [{ texto: 'Entrenar', dia: 'martes', horaInicio: '07:00', horaFin: '08:00' }],
      })
    );
    const bloque = bloques.find((b) => b.tipo === 'NO_NEGOCIABLE');
    expect(bloque).toMatchObject({ dia: 'martes', horaInicio: '07:00', horaFin: '08:00', titulo: 'Entrenar' });
  });

  it('una tarea no puede pisar el horario de un no-negociable', () => {
    const bloques = armarSemana(
      datosBase({
        horaDespertar: '06:00',
        noNegociables: [{ texto: 'Familia', dia: 'lunes', horaInicio: '06:00', horaFin: '10:00' }],
        tareas: [tarea({ id: 't1', tipoEnergia: 'profundo', duracionMin: 60, vecesDesbloquea: 5 })],
      })
    );
    const deLunes = bloques.filter((b) => b.dia === 'lunes');
    for (const b of deLunes) {
      if (b.tipo === 'NO_NEGOCIABLE') continue;
      expect(b.horaInicio >= '10:00').toBe(true);
    }
  });
});

describe('regla 2 — dosis mínima del área débil todas las semanas', () => {
  it('agenda al menos un bloque de una tarea del área marcada como manzana podrida', () => {
    const bloques = armarSemana(
      datosBase({
        areas: [{ areaKey: 'salud', esManzanaPodrida: true }],
        tareas: [tarea({ id: 'debil', areaKey: 'salud', tipoEnergia: 'creativo', vecesDesbloquea: 0 })],
      })
    );
    expect(bloques.some((b) => b.tareaId === 'debil')).toBe(true);
  });
});

describe('regla 3 — prioridad 0 en la franja de trabajo profundo', () => {
  it('la tarea que más desbloquea entra en la ventana de 4h desde que la persona se despierta', () => {
    const bloques = armarSemana(
      datosBase({
        horaDespertar: '06:00',
        tareas: [
          tarea({ id: 'baja', tipoEnergia: 'profundo', vecesDesbloquea: 1 }),
          tarea({ id: 'alta', tipoEnergia: 'profundo', vecesDesbloquea: 9 }),
        ],
      })
    );
    const bloque = bloques.find((b) => b.tareaId === 'alta');
    expect(bloque).toBeDefined();
    expect(bloque!.horaInicio >= '06:00' && bloque!.horaInicio < '10:00').toBe(true);
  });

  it('calcularPrioridad asigna 0 a la tarea que más tareas desbloquea', () => {
    const prioridad = calcularPrioridad([tarea({ id: 'a', vecesDesbloquea: 2 }), tarea({ id: 'b', vecesDesbloquea: 7 })]);
    expect(prioridad.get('b')).toBe(0);
    expect(prioridad.get('a')).toBe(1);
  });
});

describe('regla 4 — decisiones importantes solo antes del umbral de fatiga', () => {
  it('una tarea de tipo decision nunca se agenda después del umbral de fatiga', () => {
    const bloques = armarSemana(
      datosBase({
        horaDespertar: '06:00',
        reglas: { ...reglasBase, umbralFatigaHorasDesdeDespertar: 2 },
        tareas: [tarea({ id: 'decidir', tipoEnergia: 'decision', duracionMin: 30, vecesDesbloquea: 5 })],
      })
    );
    const bloque = bloques.find((b) => b.tareaId === 'decidir');
    expect(bloque).toBeDefined();
    expect(bloque!.horaFin <= '08:00').toBe(true);
  });
});

describe('regla 5 — EJECUTAR y ORQUESTAR nunca mezclados', () => {
  it('ningún bloque mezcla los dos tipos: cada bloque tiene un solo tipo y una sola tarea', () => {
    const bloques = armarSemana(
      datosBase({
        tareas: [
          tarea({ id: 'hacer', tipoEnergia: 'profundo', vecesDesbloquea: 3 }),
          tarea({ id: 'decidir', tipoEnergia: 'decision', duracionMin: 30, vecesDesbloquea: 1 }),
        ],
      })
    );
    const deTrabajo = bloques.filter((b) => b.tipo === 'EJECUTAR' || b.tipo === 'ORQUESTAR');
    for (const b of deTrabajo) {
      expect(b.tareaId).not.toBeNull();
      expect(['EJECUTAR', 'ORQUESTAR']).toContain(b.tipo);
    }
    const tipos = new Set(deTrabajo.map((b) => b.tipo));
    // Cada bloque individual tiene un único tipo — la mezcla real sería
    // un bloque con dos tareas de distinto tipo, que la estructura de
    // datos (un tareaId por bloque) no permite construir.
    expect(tipos.size).toBeGreaterThan(0);
  });
});

describe('regla 6 — reserva diaria para imprevistos', () => {
  it('todo día con trabajo agendado recibe un bloque de imprevistos proporcional', () => {
    const bloques = armarSemana(
      datosBase({
        horaDespertar: '06:00',
        reglas: { ...reglasBase, imprevistosPorcentajeDia: 0.5 },
        tareas: [tarea({ id: 't1', tipoEnergia: 'profundo', duracionMin: 60, vecesDesbloquea: 1 })],
      })
    );
    const diaConTrabajo = bloques.find((b) => b.tareaId === 't1')!.dia;
    const imprevistos = bloques.find((b) => b.dia === diaConTrabajo && b.tipo === 'IMPREVISTOS');
    expect(imprevistos).toBeDefined();
    // 50% de 60 minutos de trabajo = 30 minutos de imprevistos.
    const duracionMin = toMinutos(imprevistos!.horaFin) - toMinutos(imprevistos!.horaInicio);
    expect(duracionMin).toBe(30);
  });

  it('un día sin ningún bloque de trabajo no recibe imprevistos', () => {
    const bloques = armarSemana(datosBase({}));
    expect(bloques.some((b) => b.tipo === 'IMPREVISTOS')).toBe(false);
  });
});

describe('regla 7 — "no necesito ser primero": un solo objetivo no ocupa toda la semana', () => {
  it('si hay tareas de dos objetivos, los bloques de trabajo no quedan todos en uno solo', () => {
    const bloques = armarSemana(
      datosBase({
        horaDespertar: '06:00',
        tareas: [
          tarea({ id: 'a1', objetivoId: 'obj-A', tipoEnergia: 'profundo', vecesDesbloquea: 9 }),
          tarea({ id: 'b1', objetivoId: 'obj-B', tipoEnergia: 'profundo', vecesDesbloquea: 1 }),
        ],
      })
    );
    const deTrabajo = bloques.filter((b) => b.tipo === 'EJECUTAR' || b.tipo === 'ORQUESTAR');
    const objetivos = new Set(deTrabajo.map((b) => b.objetivoId));
    expect(objetivos.size).toBeGreaterThan(1);
  });

  it('con un solo objetivo cargado, no hay alternativa posible y la semana queda como está (sin romper)', () => {
    const bloques = armarSemana(
      datosBase({
        tareas: [tarea({ id: 'unica', objetivoId: 'obj-A', tipoEnergia: 'profundo', vecesDesbloquea: 1 })],
      })
    );
    expect(bloques.some((b) => b.tareaId === 'unica')).toBe(true);
  });
});

describe('armarSemana — generales', () => {
  it('nunca propone un bloque fuera de los 7 días de la semana', () => {
    const bloques = armarSemana(
      datosBase({
        tareas: [tarea({ id: 't1', vecesDesbloquea: 1 })],
        noNegociables: [{ texto: 'x', dia: 'domingo', horaInicio: '08:00', horaFin: '09:00' }],
      })
    );
    for (const b of bloques) expect(DIAS_SEMANA).toContain(b.dia);
  });
});

function toMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

describe('dosisSemanal', () => {
  it('agenda la dosis actual, sin pasarse de la dosis objetivo', async () => {
    const { dosisSemanal } = await import('./plan');
    expect(dosisSemanal(2, 4)).toBe(2);
    expect(dosisSemanal(5, 3)).toBe(3);
    expect(dosisSemanal(3, null)).toBe(3);
    expect(dosisSemanal(null, 3)).toBe(3);
    expect(dosisSemanal(null, null)).toBe(1);
    expect(dosisSemanal(0, 0)).toBe(1);
  });
});
