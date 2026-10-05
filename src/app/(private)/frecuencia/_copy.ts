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
} as const;
