# (c) Onboarding con copy nuevo — evidencia

Build de producción local de la rama `claude/frecuencia-onboarding`, contra la base real (Supabase), con cuentas de prueba `setter` del dominio `frecuencia-test.aretesoluciones.space` creadas vía Auth y borradas al final (residuo cero). Los datos de cada cuenta los escribió la propia app con la sesión del usuario (cliente de sesión, RLS real).

- Videos: `video-onboarding-desktop.webm` (1440×900) y `video-onboarding-mobile.webm` (390×844): recorrido completo intro → 7 pasos → cierre → Dial.
- Capturas: `NN-*-desktop.png`, `NN-*-mobile.png` y `NN-*-desktop-reducido.png` (prefers-reduced-motion). 84 en total, ninguna vacía (chequeado por varianza de píxeles).
- `marcas-*.json`: minuto:segundo de cada captura dentro de su video + errores de página (0 en las tres corridas).

> El contenedor no tiene GPU (render por software, ~5 cuadros/s) y las acciones pasan por un relay local a Supabase: en los videos las transiciones y los cambios de paso se ven más lentos que en un equipo real.

## Tabla de efectos (efecto pedido → componente → archivo → dónde se ve)

| Efecto pedido | Componente | Archivo | Video desktop | Video mobile |
|---|---|---|---|---|
| Intro: 3 pantallas antes del paso 1, una por pantalla, con transición | `Intro` | `onboarding/intro/_intro.tsx` | 00:11 → 00:30 | 00:11 → 00:25 |
| Dial moviéndose solo de escasez a abundancia | `DialAutomatico` modo `barrido` | `onboarding/_dial-automatico.tsx` | 00:11 – 00:30 | 00:11 – 00:25 |
| El fondo vivo de la app sintoniza con esa aguja (y vuelve al dial real al salir) | `DialAutomatico moverFondo` → `useSintonia` / `useRestaurarSintonia` | `onboarding/_dial-automatico.tsx`, `_shell.tsx` | 00:11 vs 00:18 | 00:11 vs 00:17 |
| Botón de la 3ª pantalla con `intro[2].cta` | `Intro` | `onboarding/intro/_intro.tsx` | 00:30 | 00:25 |
| Cada pregunta a pantalla completa: kicker / gancho / razón / pregunta / ejemplo / ayuda de `onboarding_copy` | `PantallaPregunta` | `onboarding/_pantalla-pregunta.tsx` | 00:39 → 03:32 | 00:30 → 02:42 |
| Kicker con línea que se dibuja + "Paso n de 7" | `PantallaPregunta` | `onboarding/_pantalla-pregunta.tsx` | todas | todas |
| Segmentos tipo LED: qué pregunta del paso | `.segmentos` | `onboarding/_onboarding.module.css` | 00:56 → 01:20 | 00:40 → 00:56 |
| Número del paso gigante en contorno, detrás del texto | `.marca` | `onboarding/_onboarding.module.css` | 01:07 | 00:47 (arriba, tenue) |
| Cascada de entrada + transición entre preguntas | `.etapa` + AnimatePresence | `onboarding/_pantalla-pregunta.tsx` | 01:07, 01:13, 01:20 | 00:47, 00:52, 00:56 |
| Campo "línea de transmisión": sin caja, texto grande, trazo azul al enfocar + "Transmitiendo" | `LineaTransmision` | `onboarding/_linea-transmision.tsx` | 01:02 | 00:44 |
| El campo arranca con el comienzo de frase del placeholder | `inicioDeFrase` | `onboarding/_linea-transmision.tsx` | 00:56 | 00:40 |
| "Por ejemplo:" (gris, texto en `_copy.ts`) | `PantallaPregunta` | `_copy.ts` (`onboarding.porEjemplo`) | 00:56 | 00:40 |
| Ayuda / `sin_saber` como nota + botón "No lo sé" | `PasoEnergia` | `onboarding/_pasos/paso-energia.tsx` | 02:35 | 02:02 (toca "No lo sé") |
| No negociables / estándar mínimo como registro numerado | `Registro` | `onboarding/_pasos/paso-no-negociables.tsx` | 01:34 | 01:07 |
| Ecualizador: gancho, razón y pregunta arriba de las bandas | `PasoEcualizador` | `onboarding/_pasos/paso-ecualizador.tsx` | 01:48 | 01:17 |
| Ecualizador: preguntas de palanca y manzana podrida de `onboarding_copy` | `Ecualizador` | `_ecualizador.tsx` | 02:22 | 01:51 |
| Área del objetivo como frecuencias numeradas 01…10 | `PasoObjetivo` | `onboarding/_pasos/paso-objetivo.tsx` | 03:27 | 02:39 |
| Cierre desde `pasos.cierre`: el Dial sube solo a +100, cta al Dial | `OnboardingCompletoPage` + `DialAutomatico` `sintonizar` | `onboarding/completo/page.tsx` | 03:42 → 03:50 | 02:50 → 02:56 |
| Barra fija Atrás / Continuar, sin dock | `BarraPasos` + `BotonAtras` | `onboarding/_boton-atras.tsx` | todas | todas |
| prefers-reduced-motion: todo quieto, cambios instantáneos, Dial en 0 = "Entre las dos radios" | — | — | `*-desktop-reducido.png` | — |

## Revisor independiente (sin acceso a cómo se construyó)
Bloqueantes: ninguno. Importantes, todos corregidos en el commit siguiente:
1. El número de fondo quedaba debajo del fondo vivo (no se veía) → contexto de apilamiento propio en `.pantalla`.
2. La copy dice "si no lo sabés, no pasa nada" pero el campo era obligatorio → franjas opcionales + botón "No lo sé".
3. La intro dejaba el fondo en el punto medio aunque hubiera dial de hoy → `useRestaurarSintonia` vuelve al dial real.
4. La barra fija tapaba contenido en la primera vista → el alto de la pantalla descuenta la barra.
5. Si `onboarding_copy` venía incompleto, la página rompía o dejaba a la persona en un loop → `getOnboardingCopy` valida la forma y se filtran claves desconocidas.
6. Faltaba una captura y el estado de deploy → capturas completas; preview de Vercel en el PR.

Menores corregidos: 0 se mostraba como "Abundancia" (ahora "Entre las dos radios"), la intro volvía a la pantalla 1 desde "Atrás" (ahora a la 3ª), "Por ejemplo:" en azul (ahora gris), peso de Montserrat no cargado (600 → 700), errores con `role="alert"`, estilo inline en "No tengo objetivo claro".

Encontrado al regrabar: si se escribía mientras la pregunta anterior todavía estaba saliendo, el texto iba a parar a la respuesta anterior → el campo que sale pierde el foco al cambiar de pregunta.

## Lo que NO cambia en este PR (va en otros puntos)
- El Dial del paso 1 (aguja, banda, tabla de energías, instrucción "Arrastrá la aguja…" duplicada con la pregunta) es el componente de siempre: se rehace en (b). En 390 el control queda abajo y hay que scrollear.
- Las bandas del Ecualizador y sus botones de palanca/manzana: se rehacen en (d).
- En No negociables / Estándar mínimo el placeholder se usa como texto gris de la línea (no como comienzo de frase), porque cada ítem es corto.
