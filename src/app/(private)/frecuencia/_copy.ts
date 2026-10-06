/**
 * TODO el microcopy de interfaz de Frecuencia vive acá — botones,
 * estados, kickers, labels de navegación (regla 1 de la Fase 3). El
 * contenido del método (preguntas, áreas, energías, reglas) nunca se
 * escribe acá: sale siempre de frecuencia_knowledge_blocks vía
 * src/lib/frecuencia-kb.ts.
 */

export const copy = {
  dock: {
    hoy: 'Hoy',
    semana: 'Semana',
    dial: 'Dial',
    areas: 'Áreas',
    espejo: 'Espejo',
    proximamente: 'Próximamente',
  },

  botones: {
    siguiente: 'Siguiente',
    atras: 'Atrás',
    guardar: 'Guardar',
    guardando: 'Guardando…',
    continuar: 'Continuar',
    terminar: 'Terminar',
    empezar: 'Empezar',
    agregar: 'Agregar',
    quitar: 'Quitar',
    cambiarDeDial: 'Cambiar de dial',
    noTengoObjetivoClaro: 'Hoy no tengo un objetivo claro',
    volverAlObjetivo: 'Volver a pensar un objetivo',
  },

  estados: {
    error: 'No se pudo guardar. Probá de nuevo.',
    campoRequerido: 'Completá esto para seguir.',
    cargando: 'Cargando…',
  },

  onboarding: {
    kicker: 'Calibrar la estación',
    pasoDe: (actual: number, total: number) => `Paso ${actual} de ${total}`,
    progresoLabel: 'Sintonizando…',
    nombresPaso: {
      dial: 'El dial',
      identidad: 'Identidad',
      no_negociables: 'No negociables',
      ecualizador: 'Ecualizador',
      energia: 'Energía',
      espejo: 'Espejo',
      objetivo: 'Primer objetivo',
    } as const,
    cierre: {
      titulo: 'Estación calibrada.',
      subtitulo: 'A partir de ahora, Frecuencia es tuya. Empezá por el dial.',
    },
  },

  dial: {
    kicker: 'El dial',
    escasezFm: 'Escasez FM',
    abundanciaFm: 'Abundancia FM',
    instruccionArrastre: 'Arrastrá la aguja a tu frecuencia de hoy.',
    energiasTitulo: 'Energías de escasez, sin juicio',
    energiasInstruccion: 'Tocá para sumar.',
    avisoNegativo: 'Tu frecuencia está en escasez.',
  },

  areas: {
    kicker: 'Ecualizador',
    titulo: 'Tus 10 áreas',
    subtitulo: 'Arrastrá cada banda del 0 al 10.',
    elegirPalanca: 'Elegí tu palanca',
    elegirManzana: 'Elegí tu manzana podrida',
    palancaLabel: 'Palanca',
    manzanaLabel: 'Manzana podrida',
  },

  identidad: {
    kicker: 'Identidad',
  },

  noNegociables: {
    kicker: 'No negociables',
    placeholderItem: 'Escribí uno y presioná Enter',
  },

  energia: {
    kicker: 'Energía',
    horaDespertarLabel: 'Hora en la que te despertás',
  },

  espejo: {
    kicker: 'Espejo',
  },

  objetivo: {
    kicker: 'Primer objetivo',
    fechaLimiteLabel: 'Fecha límite',
    areaLabel: 'Área de tu vida',
  },

  objetivos: {
    kicker: 'Objetivos',
    titulo: 'Tus objetivos',
    subtitulo: 'Cada objetivo vive de las tareas que lo empujan.',
    vacio: 'Todavía no cargaste un objetivo. Empezá desde el onboarding.',
    verTareas: 'Ver tareas',
  },

  tareas: {
    kicker: 'Tareas del objetivo',
    tituloLabel: 'Título',
    tituloPlaceholder: 'Qué hay que hacer',
    protocoloLabel: 'Protocolo — pasos para ejecutar sin pensar',
    protocoloPlaceholder: 'Escribí un paso y presioná Enter',
    tipoEnergiaLabel: 'Tipo de energía',
    tipoEnergiaOpciones: {
      profundo: 'Trabajo profundo',
      decision: 'Decisión',
      creativo: 'Creativo',
    },
    tipoEnergiaSinElegir: 'Sin definir',
    duracionLabel: 'Duración (minutos)',
    dosisActualLabel: 'Dosis actual',
    dosisObjetivoLabel: 'Dosis objetivo (veces por semana)',
    desbloqueaLabel: 'Qué otras tareas desbloquea',
    desbloqueaVacio: 'No hay otras tareas en este objetivo todavía.',
    prioridadLabel: 'Prioridad',
    prioridadCero: 'Prioridad 0 — la que más desbloquea',
    nuevaTarea: 'Nueva tarea',
    editarTarea: 'Editar tarea',
    vacio: 'Este objetivo todavía no tiene tareas.',
    confirmarBorrar: '¿Borrar esta tarea? Las que desbloquea quedan sin esa dependencia.',
  },

  semana: {
    kicker: 'Semana',
    titulo: 'Tu semana',
    subtitulo: 'El día se diseña la noche anterior; la semana se arma en bloques.',
    armar: 'Armar mi semana',
    armando: 'Armando…',
    vacia: 'Todavía no armaste esta semana. Empezá por "Armar mi semana".',
    propuestaTitulo: 'Propuesta — revisá antes de guardar',
    confirmarPropuesta: 'Guardar esta semana',
    descartarPropuesta: 'Descartar',
    errorSinDatos: 'Faltan datos para armar la semana.',
    confirmarBorrarBloque: '¿Borrar este bloque?',
    diasLabel: {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo',
    },
    tipoLabel: {
      NO_NEGOCIABLE: 'No negociable',
      EJECUTAR: 'Ejecutar',
      ORQUESTAR: 'Orquestar',
      IMPREVISTOS: 'Imprevistos',
    },
    noNegociablesTitulo: 'No negociables de la semana',
    noNegociablesAyuda: 'Asignales día y horario para que entren en el armado.',
    sinAgendar: 'Sin día ni horario — no entra en "Armar mi semana" hasta que le pongas uno.',
    agregarNoNegociable: 'Agregar no negociable',
    nuevoNoNegociablePlaceholder: 'Ej: Entrenar',
    guardarNoNegociables: 'Guardar no negociables',
  },
} as const;
