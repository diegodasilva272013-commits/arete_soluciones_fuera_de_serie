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
    ariaNav: 'Navegación de Frecuencia',
  },

  shell: {
    nombreApp: 'Frecuencia',
    salirAPlataforma: 'Salir a la plataforma',
    salirCorto: 'Salir',
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
    pasoDe: (actual: number, total: number) => `Paso ${actual} de ${total}`,
    // Debajo de cada campo, antes del ejemplo que viene de onboarding_copy.
    porEjemplo: 'Por ejemplo:',
    // Aparece junto a la línea mientras el usuario escribe.
    transmitiendo: 'Transmitiendo',
    sumarItem: 'Enter para sumarlo',
    preguntaDe: (actual: number, total: number) => `${actual} de ${total}`,
    // El Dial automático en 0: la aguja justo entre las dos radios.
    entreLasDos: 'Entre las dos radios',
    // Energía: para quien no sabe su mejor horario (ver sin_saber).
    noLoSe: 'No lo sé',
    introDe: (actual: number, total: number) => `${String(actual).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
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
    faltaPalancaYManzana: 'Para seguir, elegí tu área más fuerte y tu área más débil (las dos listas de abajo).',
    faltaPalanca: 'Te falta elegir tu área más fuerte.',
    faltaManzana: 'Te falta elegir tu área más débil.',
    mismaArea: 'La más fuerte y la más débil tienen que ser áreas distintas.',
    // La palanca y la manzana salen solas de los números; las preguntas quedan para corregir.
    marcadasSolas: 'Ya las marcamos con tus números: la más alta y la más baja. Si para vos es otra, tocala.',
    empate: 'Hay empate: tocá la que corresponda.',
    todasIguales: 'Todas tus áreas tienen el mismo número. Movelas para que se note cuál es la más fuerte y cuál la más débil, o elegilas acá abajo.',
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

  dosis: {
    titulo: 'Ajustes que te proponemos',
    ayuda: 'Miramos cómo te fue las últimas semanas. Vos decidís: no cambia nada hasta que aceptes.',
    // Subir: premio al ritmo sostenido, sin presión.
    subir: (titulo: string, semanas: number, de: number, a: number) =>
      `Venís sosteniendo "${titulo}" hace ${semanas} semanas. ¿Lo subimos de ${de} a ${a} veces por semana?`,
    // Bajar: cero culpa; el hecho no es de la persona.
    bajar: (titulo: string, semanas: number, de: number, a: number) =>
      `"${titulo}" venía pesado estas ${semanas} semanas. Esto era un esfuerzo heroico y lo vamos a hacer sostenible: ¿lo bajamos de ${de} a ${a} veces por semana?`,
    aceptar: 'Aceptar el cambio',
    dejarlo: 'Dejarlo como está',
    cumplimiento: (pct: number) => `${pct}% cumplido`,
  },

  hoy: {
    kicker: 'Hoy',
    titulo: 'Al aire hoy',
    sinDial: 'Todavía no marcaste tu frecuencia de hoy.',
    irAlDial: 'Ir al dial',
    sinBloques: 'Hoy no tenés bloques armados. Andá a Semana y armá uno.',
    irASemana: 'Ir a Semana',
    bloqueActualLabel: 'Ahora',
    salirAlAire: 'Salir al aire',
    ideasTitulo: 'Bandeja de ideas',
    ideasAyuda: 'Estacioná lo que te distraiga, sin perder el foco de ahora.',
    ideaPlaceholder: 'Qué se te cruzó',
    estacionar: 'Estacionar',
    ideaEstacionada: 'Estacionada.',
  },

  enElAire: {
    onAir: 'On air',
    dosMinutosLabel: 'Regla de los 2 minutos',
    protocoloTitulo: 'Protocolo',
    reglasFocoTitulo: 'Reglas de foco',
    interrupciones: (n: number) => (n === 0 ? 'Sin interrupciones' : n === 1 ? '1 interrupción' : `${n} interrupciones`),
    meInterrumpieron: 'Me interrumpieron',
    termine: 'Terminé',
    salir: 'Salir sin terminar',
    confirmarSalir: '¿Salir sin terminar? Esto cuenta como una postergación de la tarea.',
    errorConflicto: (titulo: string) => `Ya tenés "${titulo}" al aire. Terminalo antes de salir con otro bloque.`,
    irAlQueEstaEnCurso: 'Ir a ese bloque',
  },

  cierre: {
    kicker: 'Cierre del día',
    titulo: 'Cerrar la emisión',
    pasoDe: (actual: number, total: number) => `Paso ${actual} de ${total}`,

    registro: {
      nombrePaso: 'Registro de emisión',
      subtitulo: 'Lo que salió al aire de verdad hoy.',
      vacio: 'Hoy no quedó ningún bloque cumplido o abandonado todavía.',
      cargarManual: 'Agregar algo que no quedó registrado',
      placeholderManual: 'Qué más pasó hoy',
      agregar: 'Agregar',
      agregado: 'Agregado.',
    },

    dialNoche: {
      nombrePaso: 'Dial de la noche',
      subtitulo: 'Tu frecuencia cerrando el día.',
    },

    disenarManana: {
      nombrePaso: 'Diseñar mañana',
      subtitulo: 'Los bloques que ya tenés armados para mañana.',
      vacioBloques: 'Todavía no armaste bloques para mañana — podés hacerlo desde Semana.',
      vestimentaLabel: 'Qué te vas a poner',
      vestimentaPlaceholder: 'Elegí la ropa de mañana, hoy',
    },

    pasosAnteFalla: {
      nombrePaso: 'Si hoy no salió',
      subtitulo: 'Hubo al menos un bloque que no se cumplió — un momento para mirarlo, no para juzgarlo.',
      placeholder: 'Escribí tu respuesta',
      omitirPaso: 'Vengo bien, seguir',
    },

    completo: {
      titulo: 'Día cerrado.',
      subtitulo: 'Mañana ya está diseñado. Nos encontramos en el aire.',
      irAHoy: 'Ir a Hoy',
    },

    cerrarElDia: 'Cerrar el día',
  },
} as const;
