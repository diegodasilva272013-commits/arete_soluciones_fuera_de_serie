/**
 * Frecuencia — motor de la semana.
 *
 * Función pura: arma la propuesta de bloques de la semana a partir de
 * los datos recibidos por parámetro. Sin acceso a la base, sin fetch,
 * sin Date.now() (todo lo temporal entra por `datos`) — así es testeable
 * sin mocks y reusable desde cualquier lado (server action, cron futuro,
 * descomposición con IA).
 *
 * Las 7 reglas, en el orden de la orden de trabajo (todas leídas de
 * reglas_plan / reglas_decision / reglas_dosis / mapa_energia_default,
 * cargadas afuera y pasadas en `datos.reglas`):
 *   1. No negociables primero.
 *   2. Dosis mínima del área débil (manzana podrida) todas las semanas.
 *   3. Tareas prioridad 0 en las franjas de trabajo profundo.
 *   4. Decisiones importantes solo antes del umbral de fatiga.
 *   5. Bloques EJECUTAR y ORQUESTAR nunca mezclados.
 *   6. Reserva diaria para imprevistos.
 *   7. "No necesito ser primero": un solo objetivo no ocupa toda la semana.
 *
 * Supuesto no cubierto por el modelo de datos actual: no existe una
 * "hora de dormir" capturada (frecuencia_preferencias solo tiene
 * hora_despertar) — se asume una jornada disponible de JORNADA_HORAS
 * horas desde que la persona se despierta. Documentado para que Diego
 * lo confirme o lo corrija con un dato real más adelante.
 */

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export const DIAS_SEMANA: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

/** Horas disponibles desde que la persona se despierta — ver nota de cabecera. */
export const JORNADA_HORAS = 16;

/** Tipo de energía de una tarea: define a qué franja y a qué tipo de bloque pertenece. */
export type TipoEnergia = 'profundo' | 'decision' | 'creativo';

export type TipoBloque = 'NO_NEGOCIABLE' | 'EJECUTAR' | 'ORQUESTAR' | 'IMPREVISTOS';

/** profundo/creativo = hacer (EJECUTAR); decision = coordinar/decidir (ORQUESTAR). */
function tipoBloqueDe(tipoEnergia: TipoEnergia): 'EJECUTAR' | 'ORQUESTAR' {
  return tipoEnergia === 'decision' ? 'ORQUESTAR' : 'EJECUTAR';
}

export interface NoNegociableConHorario {
  texto: string;
  dia: DiaSemana;
  horaInicio: string; // "HH:MM"
  horaFin: string; // "HH:MM"
}

export interface TareaParaPlan {
  id: string;
  titulo: string;
  tipoEnergia: TipoEnergia | null;
  duracionMin: number;
  dosisObjetivo: number | null; // veces por semana — null = 1
  vecesDesbloquea: number; // tareas.desbloquea.length, ya calculado afuera
  areaKey: string | null;
  objetivoId: string | null;
}

export interface AreaParaPlan {
  areaKey: string;
  esManzanaPodrida: boolean;
}

export interface ReglasPlan {
  imprevistosPorcentajeDia: number; // reglas_plan.imprevistos_porcentaje_dia
  umbralFatigaHorasDesdeDespertar: number; // reglas_decision.umbral_fatiga.horas_desde_despertar
}

export interface DatosParaArmarSemana {
  horaDespertar: string; // "HH:MM"
  noNegociables: NoNegociableConHorario[];
  areas: AreaParaPlan[];
  tareas: TareaParaPlan[];
  reglas: ReglasPlan;
}

export interface BloquePropuesto {
  dia: DiaSemana;
  horaInicio: string;
  horaFin: string;
  tipo: TipoBloque;
  tareaId: string | null;
  objetivoId: string | null;
  titulo: string;
}

// ── utilidades de tiempo (minutos desde las 00:00) ──────────────────

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function minutosAHora(min: number): string {
  const m = Math.max(0, Math.min(1439, Math.round(min)));
  const h = Math.floor(m / 60);
  const resto = m % 60;
  return `${String(h).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/** Primer hueco de `duracion` minutos dentro de [desde, hasta) que no choca con `ocupados`. */
function buscarHueco(ocupados: Array<[number, number]>, desde: number, hasta: number, duracion: number): number | null {
  const intervalos = ocupados
    .filter(([, fin]) => fin > desde)
    .filter(([ini]) => ini < hasta)
    .sort((a, b) => a[0] - b[0]);
  let cursor = desde;
  for (const [ini, fin] of intervalos) {
    if (ini - cursor >= duracion) return cursor;
    cursor = Math.max(cursor, fin);
  }
  if (hasta - cursor >= duracion) return cursor;
  return null;
}

/** Prioridad 0 = la tarea que más tareas desbloquea (reglas_plan.prioridad). */
export function calcularPrioridad(tareas: TareaParaPlan[]): Map<string, number> {
  const orden = [...tareas].sort((a, b) => b.vecesDesbloquea - a.vecesDesbloquea);
  const prioridad = new Map<string, number>();
  orden.forEach((t, i) => prioridad.set(t.id, i));
  return prioridad;
}

export function armarSemana(datos: DatosParaArmarSemana): BloquePropuesto[] {
  const { horaDespertar, noNegociables, areas, tareas, reglas } = datos;
  const despertarMin = horaAMinutos(horaDespertar);
  const finJornadaMin = Math.min(despertarMin + JORNADA_HORAS * 60, 1439);

  const bloques: BloquePropuesto[] = [];
  const ocupadoPorDia = new Map<DiaSemana, Array<[number, number]>>(DIAS_SEMANA.map((d) => [d, []]));

  function ocupar(dia: DiaSemana, ini: number, fin: number) {
    ocupadoPorDia.get(dia)!.push([ini, fin]);
  }

  // ── Regla 1: no negociables primero ──
  for (const nn of noNegociables) {
    const ini = horaAMinutos(nn.horaInicio);
    const fin = horaAMinutos(nn.horaFin);
    bloques.push({ dia: nn.dia, horaInicio: nn.horaInicio, horaFin: nn.horaFin, tipo: 'NO_NEGOCIABLE', tareaId: null, objetivoId: null, titulo: nn.texto });
    ocupar(nn.dia, ini, fin);
  }

  const prioridad = calcularPrioridad(tareas);
  const ordenPorPrioridad = [...tareas].sort((a, b) => (prioridad.get(a.id)! - prioridad.get(b.id)!));

  function dosis(t: TareaParaPlan): number {
    return t.dosisObjetivo && t.dosisObjetivo > 0 ? t.dosisObjetivo : 1;
  }

  function agendarEnVentana(tarea: TareaParaPlan, vecesFaltantes: number, desdeMin: number, hastaMin: number): number {
    let restantes = vecesFaltantes;
    for (const dia of DIAS_SEMANA) {
      if (restantes <= 0) break;
      const ocupados = ocupadoPorDia.get(dia)!;
      const inicio = buscarHueco(ocupados, desdeMin, hastaMin, tarea.duracionMin);
      if (inicio === null) continue;
      const fin = inicio + tarea.duracionMin;
      bloques.push({
        dia,
        horaInicio: minutosAHora(inicio),
        horaFin: minutosAHora(fin),
        tipo: tipoBloqueDe(tarea.tipoEnergia ?? 'profundo'),
        tareaId: tarea.id,
        objetivoId: tarea.objetivoId,
        titulo: tarea.titulo,
      });
      ocupar(dia, inicio, fin);
      restantes -= 1;
    }
    return restantes;
  }

  // ── Regla 2: dosis mínima del área débil (manzana podrida) todas las semanas ──
  const areaDebil = areas.find((a) => a.esManzanaPodrida);
  const tareasAgendadasPorRegla2 = new Set<string>();
  if (areaDebil) {
    const candidata = ordenPorPrioridad.find((t) => t.areaKey === areaDebil.areaKey);
    if (candidata) {
      const faltan = agendarEnVentana(candidata, 1, despertarMin, finJornadaMin);
      if (faltan === 0) tareasAgendadasPorRegla2.add(candidata.id);
    }
  }

  // ── Regla 3: tareas prioridad 0 (y siguientes, en orden) en la franja de trabajo profundo ──
  const finVentanaProfunda = Math.min(despertarMin + 4 * 60, finJornadaMin);

  for (const t of ordenPorPrioridad) {
    if (t.tipoEnergia !== 'profundo') continue;
    const dosisObjetivo = dosis(t);
    const yaHechas = tareasAgendadasPorRegla2.has(t.id) ? 1 : 0;
    const faltantes = dosisObjetivo - yaHechas;
    if (faltantes <= 0) continue;
    agendarEnVentana(t, faltantes, despertarMin, finVentanaProfunda);
  }

  // ── Regla 4: decisiones importantes solo antes del umbral de fatiga ──
  const finVentanaDecision = Math.min(despertarMin + reglas.umbralFatigaHorasDesdeDespertar * 60, finJornadaMin);
  for (const t of ordenPorPrioridad) {
    if (t.tipoEnergia !== 'decision') continue;
    const dosisObjetivo = dosis(t);
    const yaHechas = tareasAgendadasPorRegla2.has(t.id) ? 1 : 0;
    const faltantes = dosisObjetivo - yaHechas;
    if (faltantes <= 0) continue;
    agendarEnVentana(t, faltantes, despertarMin, finVentanaDecision);
  }

  // ── Regla 5: EJECUTAR y ORQUESTAR nunca mezclados ──
  // Por construcción: cada bloque nace de UNA tarea con UN tipoEnergia,
  // así que nunca hay bloque mixto. Ver test `noMezclaEjecutarYOrquestar`.

  // ── Regla 6: reserva diaria para imprevistos ──
  for (const dia of DIAS_SEMANA) {
    const trabajo = bloques.filter((b) => b.dia === dia && (b.tipo === 'EJECUTAR' || b.tipo === 'ORQUESTAR'));
    if (trabajo.length === 0) continue;
    const minutosTrabajados = trabajo.reduce((acc, b) => acc + (horaAMinutos(b.horaFin) - horaAMinutos(b.horaInicio)), 0);
    const duracionImprevistos = Math.round(minutosTrabajados * reglas.imprevistosPorcentajeDia);
    if (duracionImprevistos <= 0) continue;
    const finMasTardio = Math.max(...trabajo.map((b) => horaAMinutos(b.horaFin)));
    const inicio = finMasTardio;
    const fin = Math.min(inicio + duracionImprevistos, finJornadaMin);
    if (fin <= inicio) continue;
    bloques.push({ dia, horaInicio: minutosAHora(inicio), horaFin: minutosAHora(fin), tipo: 'IMPREVISTOS', tareaId: null, objetivoId: null, titulo: 'Imprevistos' });
    ocupar(dia, inicio, fin);
  }

  // ── Regla 7: "no necesito ser primero" — un solo objetivo no ocupa toda la semana ──
  const bloquesDeTrabajo = bloques.filter((b) => b.tipo === 'EJECUTAR' || b.tipo === 'ORQUESTAR');
  const objetivosEnJuego = new Set(bloquesDeTrabajo.map((b) => b.objetivoId).filter((id): id is string => id !== null));
  if (objetivosEnJuego.size === 1) {
    const [objetivoDominante] = [...objetivosEnJuego];
    const idsAgendados = new Set(bloquesDeTrabajo.map((b) => b.tareaId));
    const alternativa = ordenPorPrioridad.find((t) => t.objetivoId !== null && t.objetivoId !== objetivoDominante && !idsAgendados.has(t.id));
    if (alternativa) {
      // Recorta el último bloque de trabajo agendado del objetivo dominante
      // y lo reemplaza por una tarea de otro objetivo, en el mismo horario.
      const ultimoIndice = [...bloques].map((b, i) => ({ b, i })).filter(({ b }) => b.objetivoId === objetivoDominante && (b.tipo === 'EJECUTAR' || b.tipo === 'ORQUESTAR')).pop()?.i;
      if (ultimoIndice !== undefined) {
        const original = bloques[ultimoIndice];
        bloques[ultimoIndice] = {
          ...original,
          tipo: tipoBloqueDe(alternativa.tipoEnergia ?? 'profundo'),
          tareaId: alternativa.id,
          objetivoId: alternativa.objetivoId,
          titulo: alternativa.titulo,
        };
      }
    }
    // Si no hay ninguna tarea de otro objetivo disponible en `datos.tareas`,
    // la regla no se puede cumplir por falta de datos de entrada: se deja
    // la semana como está (un solo objetivo real cargado por el usuario).
  }

  return bloques;
}
