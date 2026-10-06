# FRECUENCIA — Documento de traspaso completo

**Para:** el agente que continúa el desarrollo (Claude Code en la nube).
**De:** Diego (dueño del proyecto) y el arquitecto que diseñó todo lo anterior.
**Antes de hacer CUALQUIER cosa:** leé este documento entero. No tenés el historial de las conversaciones anteriores: todo lo que necesitás saber está acá. Si algo no está acá, preguntá en vez de suponer.

---

## 0. CÓMO SE TRABAJA EN ESTE PROYECTO (no negociable)

Diego tuvo malas experiencias con agentes que rompieron la base de datos, borraron assets y reportaron como "hecho" cosas que no existían. Estas reglas existen por eso. Romper una es más grave que no terminar una tarea.

### 0.1 Evidencia o no está hecho
- Prohibido reportar algo como hecho sin evidencia real: build, lint y typecheck en verde, deploy en estado Ready en el dominio real **aretesoluciones.space** (no una URL de preview), y prueba del comportamiento.
- Evidencia visual: capturas Playwright en mobile 390×844 y desktop 1440, guardadas en `/evidencia/<fase>/` (esa carpeta está en `.vercelignore`).
- "Verificado" sin la salida pegada no cuenta. Pegá las salidas de los comandos, los resultados de las consultas y la lista de capturas.
- Formato de cada reporte, con tres listas separadas:
  - ✅ Hecho y verificado (con la evidencia al lado)
  - ⚠️ Hecho pero sin verificar (y por qué)
  - ⛔ Bloqueado (qué tiene que hacer Diego, exactamente)
- Si algo depende de algo que no está aplicado (SQL sin correr, variable de entorno sin cargar), el estado es ⛔ BLOQUEADO, nunca ✅. Mientras tanto el código tiene que funcionar de forma segura: sin error 500 y sin pantalla en blanco.

### 0.2 Causa raíz, nunca parches
- Antes de tocar código: leé TODO el código relacionado y buscá todos los lugares donde algo puede estar repetido o hardcodeado. Nada de arreglar una línea aislada.
- Si un cambio rompe algo que funcionaba, el cambio está mal: se revierte y se piensa de nuevo.

### 0.3 Nada hardcodeado
- **Contenido del método** (preguntas, áreas, reglas, textos de guía, frases del agente): SIEMPRE desde la tabla `frecuencia_knowledge_blocks`. Cero strings del método en componentes.
- **Microcopy de interfaz** (botones, estados vacíos, errores): todo en UN solo archivo, `src/app/(private)/frecuencia/_copy.ts`. Nada suelto en componentes.
- El sistema tiene que ser genérico: mañana se vende a otras empresas.

### 0.4 Base de datos: reglas estrictas
La base es de PRODUCCIÓN (Supabase, Postgres 17.6) y la usan el equipo de Areté y los alumnos de la academia.
- **Vos NO corrés SQL en producción.** Escribís el SQL, se lo pasás a Diego, el arquitecto lo revisa y Diego lo corre en el SQL Editor de Supabase.
- **Las tablas existentes de la plataforma NO se tocan:** nada de ALTER, DROP, UPDATE, DELETE, INSERT, triggers ni políticas sobre tablas que no empiecen con `frecuencia_`. Eso incluye `profiles`, `personas`, `leads`, `invite_codes`, `cjnoa_consultas`, `setter_teams` y todo lo demás.
- **Todo lo nuevo lleva prefijo `frecuencia_`:** tablas, funciones, políticas, índices y triggers. El bucket se llama `frecuencia-imagenes`.
- Formato de toda migración: un solo archivo envuelto en `BEGIN; … COMMIT;`, todo calificado con `public.`, **sin** `IF NOT EXISTS` (si algo ya existe, tiene que fallar), y siempre con su rollback actualizado (`supabase/migrations/0078_frecuencia_modelo_ROLLBACK.sql`).
- **Orden dentro de una migración:** tablas → funciones → RLS y políticas → triggers, índices y seed. Las funciones `LANGUAGE sql` validan las tablas al crearse.
- Las políticas RLS que consultan otras tablas con RLS van a través de funciones `SECURITY DEFINER STABLE SET search_path = public`, con `REVOKE ALL … FROM PUBLIC` y `GRANT EXECUTE … TO authenticated`. Las subconsultas cruzadas directas producen recursión (error 42P17).
- **Storage está protegido:** Supabase bloquea el INSERT y el DELETE directos por SQL sobre `storage.buckets` y `storage.objects` (triggers `protect_*`). Los buckets se crean y borran con la Storage API, nunca con SQL.
- **La verdad de la base es la base, no el historial de migraciones.** Si necesitás saber qué hay (triggers, columnas, políticas), escribí la consulta de solo lectura y pedile a Diego que la corra.
- Ojo con los triggers de `profiles`: hay 3 (`on_points_level_up`, `set_updated_at`, `trg_setter_to_personas`). Cambiar el `role` de un usuario dispara `trg_setter_to_personas`, que escribe en la tabla `personas` (de otro módulo). Cualquier test que cambie roles tiene que verificar residuo cero en `personas` al terminar.
- El SQL Editor de Supabase solo muestra el resultado de la ÚLTIMA consulta. Si le pasás varias a Diego, juntalas en una con `union all`.
- "Success. No rows returned" sale igual para un UPDATE que no actualizó nada: siempre acompañá cada cambio con una consulta de verificación.

### 0.5 En la app
- Server actions con el **cliente de sesión del usuario** (RLS real). Prohibido usar service role en la app.
- Fechas y horas siempre en la timezone del usuario (`frecuencia_preferencias.timezone`, default `America/Argentina/Buenos_Aires`). Nunca la hora del servidor para calcular "hoy".
- Cuentas de prueba: se crean vía Supabase Auth (admin client), con dominio `frecuencia-test.aretesoluciones.space`, se borran al final y se verifica residuo cero (en `personas`, `profiles` y las tablas `frecuencia_`). Nunca queda una cuenta admin de prueba viva ni un endpoint de test desplegado (después del test, 404).

### 0.6 Cosas que NO se tocan
- `src/components/layout/topbar.tsx`: tiene cambios locales de Diego sin commitear.
- Nada dentro de `public/` (videos e imágenes). Ni comprimir, ni mover, ni borrar.
- Las propuestas comerciales (`/propuestas/*`, `/empresa/propuestas/*`): la de Dax está duplicada en dos rutas, queda anotado y no se toca.
- No se agregan librerías de UI ni plantillas.

### 0.7 Trabajo desde la nube (leé esto antes de arrancar)
- **Verificá primero qué tenés disponible en este entorno:** variables de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), acceso a deploy y navegador para Playwright. Reportá qué falta ANTES de tocar código. Sin esas variables no podés crear cuentas de prueba ni sacar evidencia: el estado es ⛔ y le decís a Diego exactamente qué variable cargar en la configuración del entorno.
- **Ramas:** trabajá siempre en una rama propia por tarea (`claude/frecuencia-<tarea>`), nunca directo en `main`. Al terminar: pull request, verificación en el preview de Vercel y reporte. **El merge a `main` (que publica en aretesoluciones.space) lo aprueba Diego.** Después del merge, verificá de nuevo en el dominio real.
- No subas secretos al repo ni los pegues en reportes.

### 0.8 Estilo de trabajo con Diego
- Habla español rioplatense (voseo). Directo, sin relleno ni adulación.
- No le hagas preguntas innecesarias: trabajá con lo que hay. Preguntá solo si una decisión no se puede deshacer y podría ir para cualquier lado.
- Explicale en lenguaje simple, sin jerga: "si no entiendo, no lo puedo hacer".
- Entregables completos, listos para usar. Nada de parches parciales.

---

## 1. QUÉ ES FRECUENCIA

Una app web de **desarrollo personal** para uso interno del equipo de Areté. Más adelante, para alumnos y como herramienta de regalo para atraer clientes. Vive dentro del sitio de Areté Soluciones, en `aretesoluciones.space/frecuencia`.

**El problema que resuelve:** planificar el día gasta mucha energía, y las tareas sueltas no llevan a ningún lado. Frecuencia baja un **objetivo** a un plan semanal con horarios concretos, respetando la energía de cada persona, lo que no negocia y sus áreas de vida. Después acompaña la ejecución con bloques de foco cronometrados.

**El núcleo, el corazón:** *Abundancia FM vs Escasez FM*. Siempre hay dos "radios" sonando en la cabeza: una de escasez (queja, envidia, "no puedo") y una de abundancia ("puedo", "hay para todos"). La app existe para que la persona elija a propósito cuál sintoniza.

**La metáfora visual que ordena todo es una estación de radio:**

| Concepto | Pieza en la app |
|---|---|
| Abundancia FM / Escasez FM | **El Dial:** banda de sintonía de -100 a +100 con aguja. En escasez, grano gris; en abundancia, onda azul limpia con glow |
| Las 10 áreas de vida | **Ecualizador** de 10 bandas |
| La semana | **Grilla de programación** de la emisora |
| Bloque de foco | **EN EL AIRE:** luz ON AIR y cronómetro gigante |
| Evidencia diaria | **Registro de emisión** |
| Compañero de compromiso | **Co-conductor** |
| Agente de IA | **La voz de la estación** |

**El método sale de dos podcasts, aplicados al pie de la letra.** Todo su contenido ya está cargado en `frecuencia_knowledge_blocks`. No inventes contenido del método: si falta algo, se marca `{"todo": true}` y decide Diego.
- **Estefanía Papayani** (neurociencia aplicada al liderazgo): mapa de energía personal (las primeras 3-4 h desde que te despertás para lo más difícil, sin mail ni celular), nada de decisiones importantes cansado, prediseñar el día la noche anterior y la semana el domingo, foco sin multitasking, priorizar por la tarea que más desbloquea, bitácora de evidencia, separar el hecho de la persona ("hoy actué X", no "soy X"), los 4 pasos ante una falla (conciencia, comprensión, disociación, declaración), identidad como intersección de 4 ejes, criterio escrito para delegar (qué se decide, qué entra y qué no, costo si sale mal, si es reversible; si no está escrito, no es criterio) y no negociables.
- **Sergio Fernández**: Abundancia FM / Escasez FM, las 4 energías que alejan la abundancia (envidia, resentimiento, crítica, queja), las 10 áreas de vida (palanca y manzana podrida), hábitos "en oferta" que escalan, "no necesito ser primero", medir el entrenamiento y no el partido, accountability partner, la regla de los 2 minutos de dolor, "la mesa se crea dos veces" (claridad antes que plan) y el estándar mínimo.

---

## 2. ESTADO ACTUAL (lo que ya existe y funciona en producción)

### 2.1 Stack
Next.js App Router + TypeScript, CSS Modules e inline styles, deploy en Vercel. Auth y base: Supabase (`createSupabaseServerClient` / `createSupabaseAdminClient`). Librerías de animación ya instaladas: gsap, @studio-freight/lenis, framer-motion / motion, three, @react-three/fiber, drei y postprocessing.

### 2.2 Acceso
- Uso interno: entran los roles `admin`, `setter` y `closer`; `student` NO, por ahora. La lista sale de `frecuencia_knowledge_blocks['frecuencia_roles_habilitados']`.
- Protección en `src/middleware.ts` (redirige a `/dashboard`) + link en el sidebar + función `frecuencia_habilitado()` en la base (falla cerrada: si no hay config, solo admin).

### 2.3 Diseño (no negociable)
- Tokens: `#050505` (fondo), `#F2EFE9` (texto), `#2F7BF6` (acento), `#8A8A8A` (secundario).
- Tipografías: Montserrat (títulos y UI), Spectral itálica (segunda línea de títulos y frases), JetBrains Mono (números, cronómetros, eyebrows).
- Radio 0 y esquinas chanfleadas con `clip-path`. Prohibido el look de plantilla: nada de cards redondeadas, gradientes violetas, íconos de stock ni dashboards genéricos. Mobile primero.
- Todo respeta `prefers-reduced-motion`. GSAP y Framer nunca sobre el mismo elemento (los dos escriben `transform`).
- Componentes reusables del sitio: `ScrollExpandMedia`, `AnimatedGradient` (preset Prism), `.glowCard`, `.kicker`, `.heroTitle`, `.etapa`, `RevealObserver`, `SvgPathDrawingTextAnimation`, `ArcFlowCarousel`, `VolumetricStudio`, `ContainerScroll`, los efectos de `fuera-de-serie/temporada-1/_efectos.tsx` (dock con magnificación, layoutId, AnimatePresence) y `ElevenLabsWidget` (acepta `agentId` y `label` por prop).

### 2.4 Base de datos (migraciones 0078 y 0079, ya corridas)
**21 tablas `frecuencia_`:** knowledge_blocks, preferencias, equipos, equipo_miembros, identidad, mapa_energia, dial, espejo, conversaciones, mensajes, areas, objetivos, tareas, bloques, evidencia, ideas, compromisos, revisiones, criterios, delegaciones, imagenes.

**Funciones:** `frecuencia_habilitado`, `frecuencia_es_lider_de`, `frecuencia_es_miembro`, `frecuencia_comparten_equipo`, `frecuencia_me_delegaron`, `frecuencia_criterio_delegado`, `frecuencia_actualizar_avance_compromiso`, `frecuencia_al_crear_equipo`, `frecuencia_al_cambiar_lider`, `frecuencia_al_borrar_tarea/bloque/objetivo/criterio` y `frecuencia_set_updated_at`.

**Visibilidad (RLS):**
- Lo íntimo es SOLO del dueño, sin excepción de admin ni de líder: identidad, mapa_energia, dial, espejo, conversaciones y mensajes.
- El admin NO lee datos personales de nadie. Solo escribe `knowledge_blocks` y administra equipos y miembros.
- El líder de un equipo lee, solo lectura, bloques, evidencia, compromisos y delegaciones de sus miembros.
- El co-conductor lee el compromiso y solo cambia el avance, vía `frecuencia_actualizar_avance_compromiso`.
- Delegaciones: solo entre personas que comparten equipo y nunca a uno mismo. Quien recibe lee la tarea y el criterio, pero no edita nada. Solo quien delega marca "volvió".
- Toda escritura exige `frecuencia_habilitado()`. El rol `anon` no tiene acceso a ninguna tabla `frecuencia_`.
- Al crear un equipo, el líder queda cargado como miembro automáticamente.

**Bloques:** columnas `inicio_real` y `fin_real` (hora real de inicio y fin del foco), CHECK de fin ≥ inicio, e índice único: un solo bloque `EN_EL_AIRE` por usuario.

**Bucket `frecuencia-imagenes`:** privado, 5 MB, png/jpeg/webp. Ruta obligatoria `<user_id>/<uuid>.<ext>`. No hay política de UPDATE: nunca se sobrescribe un archivo, cada imagen lleva nombre único.

**Claves en `frecuencia_knowledge_blocks`:** frecuencia_roles_habilitados, areas_vida (las 10 de Fernández), areas_reglas, energias_escasez, acciones_subida, pasos_ante_falla, reglas_foco, reglas_decision (umbral de fatiga: 8 h desde que se despierta), mapa_energia_default (relativo a la hora de despertar, rediagnóstico cada 12 semanas), reglas_plan (imprevistos 15% del día), reglas_dosis (subir con ≥80% de cumplimiento durante 2 semanas, bajar con ≤50% durante 2 semanas, la regla de los 2 minutos a las 2 postergaciones), criterio, limite_imagenes_diario (5 por día), tono_agente (`todo: true`, con propuesta), preguntas_onboarding (VIEJA, se reemplaza), **onboarding_copy (NUEVA, ver tarea 1)** y modelos_ia (vacío).

### 2.5 Fases terminadas
- **Fase 2:** modelo de datos, acceso y RLS. Test de aislamiento C8 en 74/74 (incluye residuo cero).
- **Fase 3:** shell con dock (Hoy / Dial / Áreas / Espejo), transiciones, Dial completo, Ecualizador y Onboarding de 7 pasos que se puede retomar.
- **Fase 4:** tareas del objetivo con prioridad por desbloqueo, motor de la semana (`src/lib/frecuencia/plan.ts`, función pura `armarSemana`, 12 tests en `plan.test.ts`), pantalla Semana (grilla), pantalla Hoy, EN EL AIRE (cronómetro contra `inicio_real`, sobrevive a recargar la página, mensaje claro si ya hay otro bloque al aire) y Cierre del día.

### 2.6 Qué está construido y qué NO, pantalla por pantalla
| Pantalla / función | Estado |
|---|---|
| Onboarding (7 pasos) | Construido. Falta el copy nuevo (tarea 1) |
| Dial (check-in mañana y noche, 4 energías, "cambiar de dial") | Construido |
| Ecualizador (Áreas) | Construido |
| Objetivos y tareas (carga manual) | Construido |
| Semana (grilla + armarSemana) | Construido |
| Hoy (dial mini, línea de tiempo, bandeja de ideas) | Construido |
| EN EL AIRE | Construido |
| Cierre del día (registro de emisión, dial noche, diseñar mañana, 4 pasos) | Construido. **El arquitecto todavía no revisó su evidencia:** antes de seguir, mostrale a Diego las capturas de la parte F |
| Pantalla Espejo propia (historial, guardarropa mínimo) | **NO construida** (ver sección 7) |
| Revisión semanal y ritual dominical | **NO construidos** (ver sección 7) |
| Escalado automático de dosis y rediagnóstico de energía | **NO construidos** (ver sección 7) |
| Dieta de entradas y estándar mínimo | **NO construidos** (ver sección 7) |
| IA, chat, voz, imágenes | **NO construidos** (Fase 5) |
| Criterios, delegaciones, co-conductor, equipos | **NO construidos** (Fase 6) |

### 2.7 Archivos clave
`src/app/(private)/frecuencia/` (layout, page, template, `_copy.ts`, `_contenido-con-dock.tsx`, `_dock-visibilidad.ts` y pantallas), `src/lib/frecuencia/plan.ts` y `plan.test.ts`, `src/lib/frecuencia-access.ts`, `src/middleware.ts`, `src/components/layout/sidebar.tsx`, `src/components/ui/elevenlabs-widget.tsx`, `scripts/frecuencia-bucket.mjs`, `scripts/frecuencia-bucket-rollback.mjs`, `supabase/migrations/0078_frecuencia_modelo.sql`, `0078_frecuencia_modelo_ROLLBACK.sql`, `0079_*` y `/evidencia/`.

---

## 3. TAREA 1 (AHORA): COPY DEL ONBOARDING — reescritura completa

El texto actual del onboarding es abstracto: el usuario no entiende qué le preguntan ni por qué. Ejemplo del problema: una pantalla dice solo "¿Quién creías que eras?" y una caja vacía. La gente que va a usar la app no sabe qué son las frecuencias, la sintonía ni Abundancia FM.

El texto nuevo **ya está cargado** en `frecuencia_knowledge_blocks`, clave `onboarding_copy` (fila nueva; `preguntas_onboarding` sigue intacta). Leé la fila completa antes de empezar. Su estructura es:

```
onboarding_copy = {
  intro: [ {gancho, razon, cta?} ×3 ],
  pasos: {
    dial: {kicker, gancho, razon, pregunta},
    identidad: [ {key, kicker, gancho, razon, pregunta, ejemplo, placeholder} ×4 ],
    no_negociables: {kicker, gancho, razon, pregunta, ejemplo, placeholder},
    estandar_minimo: {...igual},
    ecualizador: {kicker, gancho, razon, pregunta, palanca, manzana_podrida},
    energia: {kicker, gancho, razon, sin_saber, preguntas: [ {key, pregunta, ayuda?, ejemplo?} ]},
    espejo: {kicker, gancho, razon, preguntas: [ {key, pregunta, placeholder} ]},
    objetivo: {kicker, gancho, razon, preguntas: [ {key, pregunta, ejemplo?, ayuda?, placeholder?} ]},
    sin_proposito: {kicker, gancho, razon, pregunta, ejemplo, placeholder},
    cierre: {gancho, razon, cta}
  }
}
```

**Qué hacer:**

1. **Estructura nueva de cada pantalla**, leída de `onboarding_copy`:
   - kicker → eyebrow mono con línea animada (como ya está).
   - gancho → título grande en Montserrat.
   - razon → bajada en Spectral itálica, `#F2EFE9` con opacidad legible (nunca menos de 0.75).
   - pregunta → texto claro arriba del campo.
   - ejemplo → debajo del campo, en gris `#8A8A8A`, precedido por "Por ejemplo:" (ese texto va en `_copy.ts`).
   - placeholder → el campo arranca con ese comienzo de frase.
   - ayuda / sin_saber → nota chica, cuando exista.
   - Todos los campos son opcionales menos gancho: si no viene, ese bloque no se renderiza.
2. **Intro:** 3 pantallas nuevas ANTES del paso 1, desde `onboarding_copy.intro`, una por pantalla y con transición. En la primera, el Dial animado de fondo moviéndose solo de escasez a abundancia (sin interacción), para que se entienda la idea de las dos radios. La tercera tiene el botón con `intro[2].cta`.
3. **Cierre:** pantalla final desde `onboarding_copy.pasos.cierre`, con su cta que lleva al Dial.
4. **Ecualizador:** muestra gancho, razón y pregunta arriba de las bandas, y las preguntas de palanca y manzana podrida al elegirlas.
5. Una vez verificado en producción, la app deja de leer `preguntas_onboarding`. **NO la borres de la base:** avisá y la borra Diego.
6. **Inventario de todo el texto visible de la app:** generá `/evidencia/copy-inventario.md` con cada texto que ve el usuario en Dial, Áreas, Semana, Hoy, Objetivos y Tareas, EN EL AIRE y Cierre del día. Para cada uno: pantalla, dónde aparece (título, botón, mensaje vacío, error…), texto actual y de dónde sale (clave y campo de knowledge_blocks, o `_copy.ts`). Sin omitir mensajes de error ni estados vacíos.

**Evidencia:** capturas mobile 390×844 y desktop 1440 de las 3 pantallas de intro, de identidad (las 4), del ecualizador y del cierre. Build, lint y typecheck en verde, deploy Ready. Reporte con ✅ / ⚠️ / ⛔.

---

## 4. TAREA 2: REESCRIBIR EL COPY DEL RESTO DE LA APP

Con el inventario de la tarea 1, reescribí todo el texto de las demás pantallas con el mismo criterio. **Diego aprueba antes de aplicar.**

**Criterio de escritura (técnicas de Isra Bravo, copywriter español):**
- El copy mueve emociones de un estado a otro: no informa, hace sentir.
- Siempre se da una razón: por qué te lo pido y qué ganás.
- Lenguaje claro y directo, como charlando con un amigo. Cero jerga técnica y cero términos internos sin explicar (nadie sabe qué es "dosis", "palanca" o "EN EL AIRE" si no se le cuenta).
- Dibujar en la mente del lector: ejemplos concretos y cotidianos.
- Frases cortas. Cada frase importa, empezando por la primera.
- Voseo rioplatense.
- Nunca culpa: separar el hecho de la persona ("hoy no salió", nunca "fallaste").

**Proceso:**
1. Escribí la propuesta en `/evidencia/copy-propuesta.md`: por cada texto, el actual y el nuevo. Pasala a Diego para aprobar.
2. Aprobada: el microcopy de interfaz se actualiza en `_copy.ts`. El contenido del método que vive en knowledge_blocks se cambia con SQL que corre Diego (UPDATE solo sobre `frecuencia_knowledge_blocks`, más una consulta de verificación).
3. Evidencia: capturas de cada pantalla con el texto nuevo, mobile y desktop.

---

## 5. TAREA 3: FASE 5 — LA IA

**Requisitos que pone Diego antes de arrancar** (si faltan, estado ⛔):
- Variable `NVIDIA_API_KEY` cargada en Vercel por Diego. Nunca la pidas por chat.
- El `agentId` del agente de voz de Frecuencia en ElevenLabs (si no existe todavía, se crea aparte).
- El código del chat que Diego va a pasar.

### 5.1 Proveedor de IA: NVIDIA (build.nvidia.com)
- **Chat:** endpoint compatible con OpenAI en `https://integrate.api.nvidia.com/v1`. Límite documentado: 40 pedidos por minuto por modelo. La API key va SOLO del lado del servidor (route handler o server action), nunca al cliente.
- **Imágenes:** endpoints hospedados confirmados para FLUX.1-schnell (`https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell`) y FLUX.2-klein-4b (`https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b`). **Stable Diffusion 3.5 queda descartado** (licencia no comercial). Qwen-Image está pendiente de confirmar endpoint y licencia. Solo se usan modelos con licencia comercial confirmada: verificala y documentala con link.
- La lista de modelos disponibles va en `frecuencia_knowledge_blocks['modelos_ia']` (SQL que corre Diego), nunca en el código.

### 5.2 Una sola capa de herramientas
Funciones únicas del servidor: crear objetivo, crear tarea, armar semana (usa `armarSemana`), iniciar bloque, registrar evidencia, escribir criterio y generar imagen. Las usan el chat de texto (tool calling) y el agente de voz de ElevenLabs (client tools). Nunca se duplica lógica entre texto y voz.

### 5.3 Descomposición del objetivo con IA
Objetivo → metas por período → tareas con protocolo, dependencias y tipo de energía. Las reglas del método salen de knowledge_blocks y el prompt va en knowledge_blocks. El usuario revisa y confirma antes de guardar. Después, `armarSemana`.

### 5.4 Chat de texto
- Memoria en `frecuencia_conversaciones` y `frecuencia_mensajes` (RLS: solo el dueño).
- UI: Diego pasó 4 componentes de 21st.dev como **referencia FUNCIONAL, no visual**. Se rehacen con los tokens de Areté, radio 0 y chanfles; sin rounded-full, sin violetas, sin badges, sin botones de Figma ni GitHub:
  - bolt-style-chat → caja de texto que crece sola, adjuntos y selector de modelo alimentado desde knowledge_blocks.
  - ruixen-moon-chat → solo las acciones rápidas: Crear objetivo, Escribir criterio, Generar imagen, Armar mi semana.
  - ia-siri-chat → estados de voz (escuchando, procesando, hablando) y la onda, conectados al volumen REAL de `@11labs/client`. Nada de datos al azar ni modo demo.
  - ai-chat-image-generation → revelado progresivo atado al estado real de `frecuencia_imagenes`. Nada de temporizador falso.
- Antes de instalar algo, confirmá si el repo tiene Tailwind o shadcn. Si no los tiene, no se agregan: todo en CSS Modules.

### 5.5 Voz
`ElevenLabsWidget` con `agentId` y `label` por prop. El agente recibe contexto: Dial de hoy, bloque actual, tareas postergadas y objetivo. Tono: `frecuencia_knowledge_blocks['tono_agente']` (hoy en `todo: true`, con una propuesta; confirma Diego). El agente detecta lenguaje de escasez y ayuda a resintonizar.

### 5.6 Imágenes
- Imagen mental del objetivo ("la mesa se crea dos veces") y ancla visual por tarea.
- Una imagen por pedido, sin variantes. Límite diario desde knowledge_blocks (5 por día).
- Se sube a `frecuencia-imagenes/<user_id>/<uuid>.<ext>` y se guarda en `frecuencia_imagenes` con su estado (pendiente, generando, lista, error).

---

## 6. TAREA 4: FASE 6 — EL EQUIPO
La base ya está lista (ver 2.4). Falta la interfaz:
- **Criterios:** crear y editar criterios con los 4 puntos (`frecuencia_knowledge_blocks['criterio']`). "Si no está escrito, no es criterio."
- **Delegaciones:** delegar una tarea a un compañero de equipo, siempre con un criterio escrito. El receptor ve la tarea y el criterio. Quien delega marca si la tarea "volvió". Test del líder: tareas delegadas que volvieron.
- **Co-conductor:** compromiso mensual compartido con avance.
- **Equipos:** pantalla de admin para crear equipos, asignar líder y miembros.
- **Vista del líder:** bloques, evidencia, compromisos y delegaciones de su equipo. NUNCA el dial, el espejo ni la identidad.

---

## 7. TAREA 5: LO QUE FALTA DEL PRODUCTO (no es IA ni equipo)

Esto estaba en el diseño original y todavía no existe. Va después de las tareas 1 y 2, y puede ir antes o en paralelo con la Fase 5 si Diego lo pide. Todo el contenido sale de knowledge_blocks y el copy sigue el criterio de la tarea 2.

**7.1 Pantalla Espejo** (ya está en el dock):
- Check-in de mañana: cómo me veo, cómo me percibo, cómo me siento con lo que llevo puesto, foto opcional en `frecuencia-imagenes/<user_id>/espejo/<uuid>.<ext>`.
- La noche anterior se elige la vestimenta (ya se guarda en el Cierre del día: mostrala acá a la mañana).
- Guardarropa mínimo: pocas prendas que te representan, con foto. Si hace falta una tabla nueva, se propone por el protocolo de la sección 9.
- Historial de autopercepción con el efecto de máscara + tilt tipo coverflow (`scroll-locked-video-hero.tsx`, reusar).
- Idea de fondo: "cuando te ves bien, te parás distinto". El Espejo es íntimo: solo lo ve el dueño.

**7.2 Revisión semanal y ritual del domingo:**
- "Decite la verdad": métrica principal = entrenamiento cumplido (bloques y dosis cumplidos); métrica secundaria = avance del objetivo ("medimos el entrenamiento, no el partido").
- Qué funcionó (se repite) y qué no (se saca). Se guarda en `frecuencia_revisiones`.
- Volver a puntuar las áreas (¿cambió la palanca o la manzana podrida?).
- Si toca, volver a diagnosticar la energía (cada `frecuencia_rediagnostico_semanas` semanas).
- Termina corriendo `armarSemana` para la semana siguiente.

**7.3 Escalado automático de dosis:** con los umbrales de `reglas_dosis`, cuando una tarea se cumple de forma sostenida sube la dosis; cuando se incumple de forma sistemática, baja, y se avisa sin culpa ("esto era esfuerzo heroico, lo hacemos sostenible"). Siempre se propone y el usuario confirma.

**7.4 Dieta de entradas (parte de Abundancia FM):** horario elegido para noticias y redes, y un registro simple de horas de pantalla. Contar, no prohibir: solo hacerlo consciente ya baja el consumo.

**7.5 Estándar mínimo:** recordatorio visible de lo que la persona escribió que no acepta por debajo (sale de `frecuencia_identidad.estandar_minimo`).

**7.6 Lenguaje de escasez:** en los textos libres que escribe el usuario (evidencia, cierre, ideas), si aparecen las 4 energías de escasez, la app ofrece "cambiar de dial". Sin juicio. Las palabras a detectar van en knowledge_blocks, no en el código. Con la IA (Fase 5), esto lo hace el agente.

---

## 8. PENDIENTES CONOCIDOS
- Borrar la clave `preguntas_onboarding` cuando la tarea 1 esté verificada (lo hace Diego).
- `tono_agente` está en `todo: true`.
- Más adelante: landing pública de Frecuencia como gancho comercial, registro externo y acceso de students. Está fuera de alcance hasta que Diego lo pida.
- Los valores numéricos del plan son propuestas editables en knowledge_blocks; Diego puede ajustarlos.
- **Los 4 componentes de 21st.dev de la Fase 5 NO están en el repo.** Diego los pega cuando arranque esa fase.
- Este documento es la única referencia del diseño de Frecuencia: ante cualquier duda o contradicción, manda lo que dice acá.

---

## 9. PROTOCOLO PARA CUALQUIER CAMBIO DE BASE DE DATOS
1. Escribí el SQL en un archivo nuevo de `supabase/migrations/`, siguiendo la regla 0.4.
2. Actualizá el rollback.
3. Prepará la consulta de chequeo previo (que los nombres nuevos no existan, en un solo resultado con `union all`) y la consulta de verificación posterior (con los números esperados).
4. Pasale a Diego las tres cosas, en ese orden, y esperá. No sigas con nada que dependa de ese cambio hasta que Diego confirme la verificación.
5. Si el cambio afecta la seguridad (RLS), actualizá el test de aislamiento C8 y pedí correrlo: tiene que dar todo OK, incluido residuo cero.
