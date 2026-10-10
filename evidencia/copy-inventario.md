# Inventario de texto visible — Frecuencia

Generado leyendo `_copy.ts` (todo el microcopy de interfaz) y `frecuencia_knowledge_blocks` (contenido del método, solo lectura). Cada fila: pantalla · dónde aparece · texto actual · de dónde sale.

> La columna "Dónde aparece" es una clasificación automática por el nombre de la clave: orienta, no es exacta. Los errores de `actions.ts` ("No hay sesión.", "Vacío.") no se muestran a la persona: la interfaz los reemplaza por `estados.error`.
>
> El texto del onboarding vive en `frecuencia_knowledge_blocks['onboarding_copy']` y ya fue reescrito (tarea 1); no se repite acá.

## A. Microcopy de interfaz (`_copy.ts`)

| Pantalla | Dónde aparece | Texto actual | Fuente |
|---|---|---|---|
| Barra inferior (dock) | Botón / texto de interfaz | Hoy | _copy.ts → dock.hoy |
| Barra inferior (dock) | Botón / texto de interfaz | Semana | _copy.ts → dock.semana |
| Barra inferior (dock) | Botón / texto de interfaz | Dial | _copy.ts → dock.dial |
| Barra inferior (dock) | Botón / texto de interfaz | Áreas | _copy.ts → dock.areas |
| Barra inferior (dock) | Botón / texto de interfaz | Espejo | _copy.ts → dock.espejo |
| Barra inferior (dock) | Botón / texto de interfaz | Próximamente | _copy.ts → dock.proximamente |
| Barra inferior (dock) | Botón / texto de interfaz | Navegación de Frecuencia | _copy.ts → dock.ariaNav |
| Marco de Frecuencia | Botón / texto de interfaz | Frecuencia | _copy.ts → shell.nombreApp |
| Marco de Frecuencia | Botón / texto de interfaz | Salir a la plataforma | _copy.ts → shell.salirAPlataforma |
| Marco de Frecuencia | Botón / texto de interfaz | Salir | _copy.ts → shell.salirCorto |
| Botones comunes | Botón / texto de interfaz | Siguiente | _copy.ts → botones.siguiente |
| Botones comunes | Botón / texto de interfaz | Atrás | _copy.ts → botones.atras |
| Botones comunes | Botón / texto de interfaz | Guardar | _copy.ts → botones.guardar |
| Botones comunes | Botón / texto de interfaz | Guardando… | _copy.ts → botones.guardando |
| Botones comunes | Botón / texto de interfaz | Continuar | _copy.ts → botones.continuar |
| Botones comunes | Botón / texto de interfaz | Terminar | _copy.ts → botones.terminar |
| Botones comunes | Botón / texto de interfaz | Empezar | _copy.ts → botones.empezar |
| Botones comunes | Botón / texto de interfaz | Agregar | _copy.ts → botones.agregar |
| Botones comunes | Botón / texto de interfaz | Quitar | _copy.ts → botones.quitar |
| Botones comunes | Botón / texto de interfaz | Cambiar de dial | _copy.ts → botones.cambiarDeDial |
| Botones comunes | Botón / texto de interfaz | Hoy no tengo un objetivo claro | _copy.ts → botones.noTengoObjetivoClaro |
| Botones comunes | Botón / texto de interfaz | Volver a pensar un objetivo | _copy.ts → botones.volverAlObjetivo |
| Estados comunes | Mensaje de error / aviso | No se pudo guardar. Probá de nuevo. | _copy.ts → estados.error |
| Estados comunes | Botón / texto de interfaz | Completá esto para seguir. | _copy.ts → estados.campoRequerido |
| Estados comunes | Botón / texto de interfaz | Cargando… | _copy.ts → estados.cargando |
| Onboarding (microcopy) | Botón / texto de interfaz | Paso 2 de 5 | _copy.ts → onboarding.pasoDe(…) (función; ejemplo con valores de prueba) |
| Onboarding (microcopy) | Botón / texto de interfaz | Por ejemplo: | _copy.ts → onboarding.porEjemplo |
| Onboarding (microcopy) | Botón / texto de interfaz | Transmitiendo | _copy.ts → onboarding.transmitiendo |
| Onboarding (microcopy) | Botón / texto de interfaz | Enter para sumarlo | _copy.ts → onboarding.sumarItem |
| Onboarding (microcopy) | Botón / texto de interfaz | 2 de 5 | _copy.ts → onboarding.preguntaDe(…) (función; ejemplo con valores de prueba) |
| Onboarding (microcopy) | Botón / texto de interfaz | Entre las dos radios | _copy.ts → onboarding.entreLasDos |
| Onboarding (microcopy) | Botón / texto de interfaz | No lo sé | _copy.ts → onboarding.noLoSe |
| Onboarding (microcopy) | Botón / texto de interfaz | 02 / 05 | _copy.ts → onboarding.introDe(…) (función; ejemplo con valores de prueba) |
| Dial | Título / eyebrow | El dial | _copy.ts → dial.kicker |
| Dial | Botón / texto de interfaz | Escasez FM | _copy.ts → dial.escasezFm |
| Dial | Botón / texto de interfaz | Abundancia FM | _copy.ts → dial.abundanciaFm |
| Dial | Texto de apoyo | Arrastrá la aguja a tu frecuencia de hoy. | _copy.ts → dial.instruccionArrastre |
| Dial | Título / eyebrow | Energías de escasez, sin juicio | _copy.ts → dial.energiasTitulo |
| Dial | Texto de apoyo | Tocá para sumar. | _copy.ts → dial.energiasInstruccion |
| Dial | Botón / texto de interfaz | Tu frecuencia está en escasez. | _copy.ts → dial.avisoNegativo |
| Áreas (Ecualizador) | Título / eyebrow | Ecualizador | _copy.ts → areas.kicker |
| Áreas (Ecualizador) | Título / eyebrow | Tus 10 áreas | _copy.ts → areas.titulo |
| Áreas (Ecualizador) | Título / eyebrow | Arrastrá cada banda del 0 al 10. | _copy.ts → areas.subtitulo |
| Áreas (Ecualizador) | Botón / texto de interfaz | Elegí tu palanca | _copy.ts → areas.elegirPalanca |
| Áreas (Ecualizador) | Botón / texto de interfaz | Elegí tu manzana podrida | _copy.ts → areas.elegirManzana |
| Áreas (Ecualizador) | Etiqueta | Palanca | _copy.ts → areas.palancaLabel |
| Áreas (Ecualizador) | Etiqueta | Manzana podrida | _copy.ts → areas.manzanaLabel |
| Áreas (Ecualizador) | Mensaje de error / aviso | Para seguir, elegí tu área más fuerte y tu área más débil (las dos listas de abajo). | _copy.ts → areas.faltaPalancaYManzana |
| Áreas (Ecualizador) | Mensaje de error / aviso | Te falta elegir tu área más fuerte. | _copy.ts → areas.faltaPalanca |
| Áreas (Ecualizador) | Mensaje de error / aviso | Te falta elegir tu área más débil. | _copy.ts → areas.faltaManzana |
| Áreas (Ecualizador) | Mensaje de error / aviso | La más fuerte y la más débil tienen que ser áreas distintas. | _copy.ts → areas.mismaArea |
| Áreas (Ecualizador) | Botón / texto de interfaz | Ya las marcamos con tus números: la más alta y la más baja. Si para vos es otra, tocala. | _copy.ts → areas.marcadasSolas |
| Áreas (Ecualizador) | Mensaje de error / aviso | Hay empate: tocá la que corresponda. | _copy.ts → areas.empate |
| Áreas (Ecualizador) | Botón / texto de interfaz | Todas tus áreas tienen el mismo número. Movelas para que se note cuál es la más fuerte y cuál la más débil, o elegilas acá abajo. | _copy.ts → areas.todasIguales |
| Objetivos | Título / eyebrow | Objetivos | _copy.ts → objetivos.kicker |
| Objetivos | Título / eyebrow | Tus objetivos | _copy.ts → objetivos.titulo |
| Objetivos | Título / eyebrow | Cada objetivo vive de las tareas que lo empujan. | _copy.ts → objetivos.subtitulo |
| Objetivos | Estado vacío | Todavía no cargaste un objetivo. Empezá desde el onboarding. | _copy.ts → objetivos.vacio |
| Objetivos | Botón / texto de interfaz | Ver tareas | _copy.ts → objetivos.verTareas |
| Tareas | Título / eyebrow | Tareas del objetivo | _copy.ts → tareas.kicker |
| Tareas | Etiqueta | Título | _copy.ts → tareas.tituloLabel |
| Tareas | Título / eyebrow | Qué hay que hacer | _copy.ts → tareas.tituloPlaceholder |
| Tareas | Etiqueta | Protocolo — pasos para ejecutar sin pensar | _copy.ts → tareas.protocoloLabel |
| Tareas | Placeholder de campo | Escribí un paso y presioná Enter | _copy.ts → tareas.protocoloPlaceholder |
| Tareas | Etiqueta | Tipo de energía | _copy.ts → tareas.tipoEnergiaLabel |
| Tareas | Botón / texto de interfaz | Trabajo profundo | _copy.ts → tareas.tipoEnergiaOpciones.profundo |
| Tareas | Botón / texto de interfaz | Decisión | _copy.ts → tareas.tipoEnergiaOpciones.decision |
| Tareas | Botón / texto de interfaz | Creativo | _copy.ts → tareas.tipoEnergiaOpciones.creativo |
| Tareas | Botón / texto de interfaz | Sin definir | _copy.ts → tareas.tipoEnergiaSinElegir |
| Tareas | Etiqueta | Duración (minutos) | _copy.ts → tareas.duracionLabel |
| Tareas | Etiqueta | Dosis actual | _copy.ts → tareas.dosisActualLabel |
| Tareas | Etiqueta | Dosis objetivo (veces por semana) | _copy.ts → tareas.dosisObjetivoLabel |
| Tareas | Etiqueta | Qué otras tareas desbloquea | _copy.ts → tareas.desbloqueaLabel |
| Tareas | Estado vacío | No hay otras tareas en este objetivo todavía. | _copy.ts → tareas.desbloqueaVacio |
| Tareas | Etiqueta | Prioridad | _copy.ts → tareas.prioridadLabel |
| Tareas | Botón / texto de interfaz | Prioridad 0 — la que más desbloquea | _copy.ts → tareas.prioridadCero |
| Tareas | Botón / texto de interfaz | Nueva tarea | _copy.ts → tareas.nuevaTarea |
| Tareas | Botón / texto de interfaz | Editar tarea | _copy.ts → tareas.editarTarea |
| Tareas | Estado vacío | Este objetivo todavía no tiene tareas. | _copy.ts → tareas.vacio |
| Tareas | Botón / texto de interfaz | ¿Borrar esta tarea? Las que desbloquea quedan sin esa dependencia. | _copy.ts → tareas.confirmarBorrar |
| Semana | Título / eyebrow | Semana | _copy.ts → semana.kicker |
| Semana | Título / eyebrow | Tu semana | _copy.ts → semana.titulo |
| Semana | Título / eyebrow | El día se diseña la noche anterior; la semana se arma en bloques. | _copy.ts → semana.subtitulo |
| Semana | Botón / texto de interfaz | Armar mi semana | _copy.ts → semana.armar |
| Semana | Botón / texto de interfaz | Armando… | _copy.ts → semana.armando |
| Semana | Estado vacío | Todavía no armaste esta semana. Empezá por "Armar mi semana". | _copy.ts → semana.vacia |
| Semana | Título / eyebrow | Propuesta — revisá antes de guardar | _copy.ts → semana.propuestaTitulo |
| Semana | Botón / texto de interfaz | Guardar esta semana | _copy.ts → semana.confirmarPropuesta |
| Semana | Botón / texto de interfaz | Descartar | _copy.ts → semana.descartarPropuesta |
| Semana | Mensaje de error / aviso | Faltan datos para armar la semana. | _copy.ts → semana.errorSinDatos |
| Semana | Botón / texto de interfaz | ¿Borrar este bloque? | _copy.ts → semana.confirmarBorrarBloque |
| Semana | Botón / texto de interfaz | Lunes | _copy.ts → semana.diasLabel.lunes |
| Semana | Botón / texto de interfaz | Martes | _copy.ts → semana.diasLabel.martes |
| Semana | Botón / texto de interfaz | Miércoles | _copy.ts → semana.diasLabel.miercoles |
| Semana | Botón / texto de interfaz | Jueves | _copy.ts → semana.diasLabel.jueves |
| Semana | Botón / texto de interfaz | Viernes | _copy.ts → semana.diasLabel.viernes |
| Semana | Botón / texto de interfaz | Sábado | _copy.ts → semana.diasLabel.sabado |
| Semana | Botón / texto de interfaz | Domingo | _copy.ts → semana.diasLabel.domingo |
| Semana | Botón / texto de interfaz | No negociable | _copy.ts → semana.tipoLabel.NO_NEGOCIABLE |
| Semana | Botón / texto de interfaz | Ejecutar | _copy.ts → semana.tipoLabel.EJECUTAR |
| Semana | Botón / texto de interfaz | Orquestar | _copy.ts → semana.tipoLabel.ORQUESTAR |
| Semana | Botón / texto de interfaz | Imprevistos | _copy.ts → semana.tipoLabel.IMPREVISTOS |
| Semana | Título / eyebrow | No negociables de la semana | _copy.ts → semana.noNegociablesTitulo |
| Semana | Texto de apoyo | Asignales día y horario para que entren en el armado. | _copy.ts → semana.noNegociablesAyuda |
| Semana | Estado vacío | Sin día ni horario — no entra en "Armar mi semana" hasta que le pongas uno. | _copy.ts → semana.sinAgendar |
| Semana | Botón / texto de interfaz | Agregar no negociable | _copy.ts → semana.agregarNoNegociable |
| Semana | Placeholder de campo | Ej: Entrenar | _copy.ts → semana.nuevoNoNegociablePlaceholder |
| Semana | Botón / texto de interfaz | Guardar no negociables | _copy.ts → semana.guardarNoNegociables |
| Hoy | Título / eyebrow | Hoy | _copy.ts → hoy.kicker |
| Hoy | Título / eyebrow | Al aire hoy | _copy.ts → hoy.titulo |
| Hoy | Estado vacío | Todavía no marcaste tu frecuencia de hoy. | _copy.ts → hoy.sinDial |
| Hoy | Botón / texto de interfaz | Ir al dial | _copy.ts → hoy.irAlDial |
| Hoy | Estado vacío | Hoy no tenés bloques armados. Andá a Semana y armá uno. | _copy.ts → hoy.sinBloques |
| Hoy | Botón / texto de interfaz | Ir a Semana | _copy.ts → hoy.irASemana |
| Hoy | Etiqueta | Ahora | _copy.ts → hoy.bloqueActualLabel |
| Hoy | Botón / texto de interfaz | Salir al aire | _copy.ts → hoy.salirAlAire |
| Hoy | Título / eyebrow | Bandeja de ideas | _copy.ts → hoy.ideasTitulo |
| Hoy | Texto de apoyo | Estacioná lo que te distraiga, sin perder el foco de ahora. | _copy.ts → hoy.ideasAyuda |
| Hoy | Placeholder de campo | Qué se te cruzó | _copy.ts → hoy.ideaPlaceholder |
| Hoy | Botón / texto de interfaz | Estacionar | _copy.ts → hoy.estacionar |
| Hoy | Botón / texto de interfaz | Estacionada. | _copy.ts → hoy.ideaEstacionada |
| EN EL AIRE | Botón / texto de interfaz | On air | _copy.ts → enElAire.onAir |
| EN EL AIRE | Etiqueta | Regla de los 2 minutos | _copy.ts → enElAire.dosMinutosLabel |
| EN EL AIRE | Título / eyebrow | Protocolo | _copy.ts → enElAire.protocoloTitulo |
| EN EL AIRE | Título / eyebrow | Reglas de foco | _copy.ts → enElAire.reglasFocoTitulo |
| EN EL AIRE | Botón / texto de interfaz | 2 interrupciones | _copy.ts → enElAire.interrupciones(…) (función; ejemplo con valores de prueba) |
| EN EL AIRE | Botón / texto de interfaz | Me interrumpieron | _copy.ts → enElAire.meInterrumpieron |
| EN EL AIRE | Botón / texto de interfaz | Terminé | _copy.ts → enElAire.termine |
| EN EL AIRE | Botón / texto de interfaz | Salir sin terminar | _copy.ts → enElAire.salir |
| EN EL AIRE | Botón / texto de interfaz | ¿Salir sin terminar? Esto cuenta como una postergación de la tarea. | _copy.ts → enElAire.confirmarSalir |
| EN EL AIRE | Mensaje de error / aviso | Ya tenés "2" al aire. Terminalo antes de salir con otro bloque. | _copy.ts → enElAire.errorConflicto(…) (función; ejemplo con valores de prueba) |
| EN EL AIRE | Botón / texto de interfaz | Ir a ese bloque | _copy.ts → enElAire.irAlQueEstaEnCurso |
| Cierre del día | Título / eyebrow | Cierre del día | _copy.ts → cierre.kicker |
| Cierre del día | Título / eyebrow | Cerrar la emisión | _copy.ts → cierre.titulo |
| Cierre del día | Botón / texto de interfaz | Paso 2 de 5 | _copy.ts → cierre.pasoDe(…) (función; ejemplo con valores de prueba) |
| Cierre del día | Botón / texto de interfaz | Registro de emisión | _copy.ts → cierre.registro.nombrePaso |
| Cierre del día | Título / eyebrow | Lo que salió al aire de verdad hoy. | _copy.ts → cierre.registro.subtitulo |
| Cierre del día | Estado vacío | Hoy no quedó ningún bloque cumplido o abandonado todavía. | _copy.ts → cierre.registro.vacio |
| Cierre del día | Botón / texto de interfaz | Agregar algo que no quedó registrado | _copy.ts → cierre.registro.cargarManual |
| Cierre del día | Placeholder de campo | Qué más pasó hoy | _copy.ts → cierre.registro.placeholderManual |
| Cierre del día | Botón / texto de interfaz | Agregar | _copy.ts → cierre.registro.agregar |
| Cierre del día | Botón / texto de interfaz | Agregado. | _copy.ts → cierre.registro.agregado |
| Cierre del día | Botón / texto de interfaz | Dial de la noche | _copy.ts → cierre.dialNoche.nombrePaso |
| Cierre del día | Título / eyebrow | Tu frecuencia cerrando el día. | _copy.ts → cierre.dialNoche.subtitulo |
| Cierre del día | Botón / texto de interfaz | Diseñar mañana | _copy.ts → cierre.disenarManana.nombrePaso |
| Cierre del día | Título / eyebrow | Los bloques que ya tenés armados para mañana. | _copy.ts → cierre.disenarManana.subtitulo |
| Cierre del día | Estado vacío | Todavía no armaste bloques para mañana — podés hacerlo desde Semana. | _copy.ts → cierre.disenarManana.vacioBloques |
| Cierre del día | Etiqueta | Qué te vas a poner | _copy.ts → cierre.disenarManana.vestimentaLabel |
| Cierre del día | Placeholder de campo | Elegí la ropa de mañana, hoy | _copy.ts → cierre.disenarManana.vestimentaPlaceholder |
| Cierre del día | Botón / texto de interfaz | Si hoy no salió | _copy.ts → cierre.pasosAnteFalla.nombrePaso |
| Cierre del día | Título / eyebrow | Hubo al menos un bloque que no se cumplió — un momento para mirarlo, no para juzgarlo. | _copy.ts → cierre.pasosAnteFalla.subtitulo |
| Cierre del día | Placeholder de campo | Escribí tu respuesta | _copy.ts → cierre.pasosAnteFalla.placeholder |
| Cierre del día | Botón / texto de interfaz | Vengo bien, seguir | _copy.ts → cierre.pasosAnteFalla.omitirPaso |
| Cierre del día | Título / eyebrow | Día cerrado. | _copy.ts → cierre.completo.titulo |
| Cierre del día | Título / eyebrow | Mañana ya está diseñado. Nos encontramos en el aire. | _copy.ts → cierre.completo.subtitulo |
| Cierre del día | Botón / texto de interfaz | Ir a Hoy | _copy.ts → cierre.completo.irAHoy |
| Cierre del día | Botón / texto de interfaz | Cerrar el día | _copy.ts → cierre.cerrarElDia |

## B. Contenido del método (`frecuencia_knowledge_blocks`, solo lectura)

### `areas_vida`

| Campo | Texto actual |
|---|---|
| [0].key | conocer_quien_sos |
| [0].nombre | Conocer quién sos |
| [1].key | creer_en_vos |
| [1].nombre | Creer en vos |
| [2].key | salud |
| [2].nombre | Salud |
| [3].key | relaciones |
| [3].nombre | Relaciones |
| [4].key | familia |
| [4].nombre | Familia |
| [5].key | pareja |
| [5].nombre | Pareja |
| [6].key | trascendencia |
| [6].nombre | Trascendencia |
| [7].key | proposito |
| [7].nombre | Propósito |
| [8].key | carrera_profesional |
| [8].nombre | Carrera profesional |
| [9].key | libertad_financiera |
| [9].nombre | Libertad financiera |

### `areas_reglas`

| Campo | Texto actual |
|---|---|
| palanca | El área fuerte tira de las demás: el objetivo principal se apoya en ella. |
| contagio_rapido[0] | salud |
| contagio_rapido[1] | libertad_financiera |
| manzana_podrida | El área débil contagia al resto: se lleva como mínimo a un aprobado. |

### `energias_escasez`

| Campo | Texto actual |
|---|---|
| [0].key | envidia |
| [0].nombre | Envidia |
| [1].key | resentimiento |
| [1].nombre | Resentimiento |
| [2].key | critica |
| [2].nombre | Crítica |
| [3].key | queja |
| [3].nombre | Queja |

### `acciones_subida`

| Campo | Texto actual |
|---|---|
| [0] | Silencio |
| [1] | Dormir bien |
| [2] | Libros que elevan |
| [3] | Películas que elevan |
| [4] | Personas que elevan |
| [5] | Movimiento |

### `pasos_ante_falla`

| Campo | Texto actual |
|---|---|
| [0].nombre | Conciencia |
| [0].descripcion | Tomar conciencia de los hechos: pasó esto. |
| [1].nombre | Comprensión |
| [1].descripcion | Entender por qué pasó: hice tal cosa, o cuando pasa esto tiendo a responder así. |
| [2].nombre | Disociación |
| [2].descripcion | Separar el hecho de la persona: no soy un fracaso, cometí un error. |
| [3].nombre | Declaración |
| [3].descripcion | Declarar qué voy a hacer distinto la próxima vez. |

### `reglas_foco`

| Campo | Texto actual |
|---|---|
| [0] | Las primeras horas del día, sin mail ni celular, van a la tarea más difícil. |
| [1] | Una sola tarea por bloque: el multitasking no existe. |
| [2] | Cada interrupción cuesta el tiempo de la interrupción más el de antes y el de volver a enfocarse. |
| [3] | Anticipá el bloque: avisá al equipo o a tu casa que vas a estar en foco. |
| [4] | Lo que hacés, hacelo completo: la media dosis genera resistencia. |

### `reglas_decision`

| Campo | Texto actual |
|---|---|
| umbral_fatiga.nota | Propuesta editable. Después de 8 h despierto no se agendan decisiones importantes. |
| decisiones_dificiles | si no hay urgencia, dormirlas una noche y volver a mirarlas |
| decisiones_importantes | temprano, con energía; nunca al final del día cansado |

### `reglas_plan`

| Campo | Texto actual |
|---|---|
| prioridad | Primero la tarea que desbloquea más tareas. |
| area_debil | La manzana podrida recibe una dosis mínima fija cada semana. |
| pre_diseno | El día se diseña la noche anterior; la semana se arma el domingo en bloques. |
| imprevistos | Se deja margen libre a propósito para lo que surja. |
| ejecutar_vs_orquestar | No se ejecuta y se orquesta en el mismo bloque. |
| no_negociables_primero | Descanso, familia, entrenamiento y lo propio se agendan antes que todo, como un cliente más. |

### `reglas_dosis`

| Campo | Texto actual |
|---|---|
| dosis_completa | Chica pero completa: nunca media dosis de algo grande. |
| habitos_en_oferta | Arrancar con una dosis que cualquiera pueda cumplir (ejemplo: 15 minutos, 3 veces por semana) y dejar que crezca por interés compuesto. |
| dos_minutos_de_dolor | Casi todo lo bueno es incómodo al principio y pasa rápido: arrancá solo los primeros minutos. |
| no_necesito_ser_primero | Ser primero cuesta 100 horas; ser segundo, 70. Las 30 que sobran van a las otras áreas. |

### `criterio`

| Campo | Texto actual |
|---|---|
| test | Si delegás una tarea y vuelve a tu escritorio, no delegaste criterio. |
| regla | Si no está escrito, no es criterio. |
| puntos[0].key | que_se_decide |
| puntos[0].pregunta | ¿Qué se está decidiendo? |
| puntos[1].key | que_entra_y_que_no |
| puntos[1].pregunta | ¿Qué entra en esta decisión y qué queda afuera? |
| puntos[2].key | costo_si_sale_mal |
| puntos[2].pregunta | ¿Qué costo pago si sale mal? |
| puntos[3].key | reversible |
| puntos[3].pregunta | ¿Es reversible? ¿En cuánto tiempo? |
| no_delegable[0] | Decisiones sobre personas |
| no_delegable[1] | Reputación: lo que defendés con tu nombre |
| no_delegable[2] | Dirección de la empresa |
| responsabilidad | Quien delega asume por escrito la responsabilidad si sale mal. |

### `tono_agente`

| Campo | Texto actual |
|---|---|
| propuesta | El amigo que te agarra de las solapas: te hace decirte la verdad, sin culpa, separando el hecho de la persona. |
