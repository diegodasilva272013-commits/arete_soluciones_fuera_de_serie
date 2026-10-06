# (c) Onboarding con copy nuevo — evidencia

Build de producción local de la rama `claude/frecuencia-onboarding`, contra la base real (Supabase), con cuentas de prueba `setter` del dominio `frecuencia-test.aretesoluciones.space` creadas vía Auth y borradas al final (residuo cero, ver abajo). Los datos de cada cuenta los escribió la propia app con la sesión del usuario (cliente de sesión, RLS real).

- Videos: `video-onboarding-desktop.webm` (1440×900) y `video-onboarding-mobile.webm` (390×844): recorrido completo, intro → 7 pasos → cierre → Dial.
- Capturas: `NN-*-desktop.png`, `NN-*-mobile.png` y `NN-*-desktop-reducido.png` (prefers-reduced-motion).
- `marcas-*.json`: minuto:segundo de cada captura dentro de su video y errores de página (0 en las tres corridas).

> Nota sobre el contenedor: no tiene GPU (render por software, ~5 cuadros por segundo), así que en los videos las transiciones se ven más lentas que en un equipo real.

## Tabla de efectos (efecto pedido → componente → archivo → dónde se ve)

| Efecto pedido | Componente | Archivo | Video desktop | Video mobile |
|---|---|---|---|---|
| Intro: 3 pantallas antes del paso 1, una por pantalla, con transición | `Intro` (AnimatePresence, entrada desde desenfoque) | `onboarding/intro/_intro.tsx` | 00:11 → 00:30 | 00:11 → 00:27 |
| Dial animado de fondo moviéndose solo de escasez a abundancia | `DialAutomatico` modo `barrido` (aguja, display luminoso, señal ruido→onda azul) | `onboarding/_dial-automatico.tsx` | 00:11 – 00:30 | 00:11 – 00:27 |
| El fondo vivo de la app sintoniza con esa aguja | `DialAutomatico moverFondo` → `useSintonia()` del shell | `onboarding/_dial-automatico.tsx` | 00:11 vs 00:20 | 00:11 vs 00:19 |
| Botón de la 3ª pantalla con `intro[2].cta` | `Intro` | `onboarding/intro/_intro.tsx` | 00:30 | 00:27 |
| Cada pregunta a pantalla completa con kicker / gancho / razón / pregunta / ejemplo / ayuda leídos de `onboarding_copy` | `PantallaPregunta` | `onboarding/_pantalla-pregunta.tsx` | 00:35 → 03:01 | 00:31 → 02:22 |
| Kicker con línea que se dibuja + "Paso n de 7" | `PantallaPregunta` (`.kickerLine.on`) | `onboarding/_pantalla-pregunta.tsx` | todas | todas |
| Segmentos tipo LED con la pregunta actual dentro del paso | `PantallaPregunta` (`.segmentos`) | `onboarding/_onboarding.module.css` | 00:55 → 01:18 | 00:40 → 00:59 |
| Número del paso gigante en contorno detrás del contenido | `PantallaPregunta` (`.marca`) | `onboarding/_onboarding.module.css` | 00:55 | — (en 390 queda arriba, tenue) |
| Cascada de entrada de cada bloque + transición entre preguntas | `.etapa` + AnimatePresence | `onboarding/_pantalla-pregunta.tsx` | 01:06, 01:12, 01:18 | 00:49, 00:54, 00:59 |
| Campo "línea de transmisión": sin caja, texto grande, línea que se dibuja en azul al enfocar | `LineaTransmision` | `onboarding/_linea-transmision.tsx` | 01:01 | 00:45 |
| El campo arranca con el comienzo de frase del placeholder | `inicioDeFrase` | `onboarding/_linea-transmision.tsx` | 00:55 | 00:40 |
| "Por ejemplo:" debajo del campo (texto en `_copy.ts`) | `PantallaPregunta` | `_copy.ts` (`onboarding.porEjemplo`) | 00:55 | 00:40 |
| Ayuda / `sin_saber` como nota chica | `PantallaPregunta` (`notas`) | `onboarding/_pasos/paso-energia.tsx` | 02:07 | 01:38 |
| No negociables / estándar mínimo como registro numerado (01, 02…) | `Registro` | `onboarding/_pasos/paso-no-negociables.tsx` | 01:34 | 01:12 |
| Ecualizador: gancho, razón y pregunta arriba de las bandas | `PasoEcualizador` | `onboarding/_pasos/paso-ecualizador.tsx` | 01:47 | 01:23 |
| Ecualizador: preguntas de palanca y manzana podrida de `onboarding_copy` | `Ecualizador` (`preguntaPalanca`/`preguntaManzana`) | `_ecualizador.tsx` | 01:53 | 01:28 |
| Área del objetivo como frecuencias numeradas 01…10 | `PasoObjetivo` (`.frecuencias`) | `onboarding/_pasos/paso-objetivo.tsx` | 02:56 | 02:18 |
| Cierre desde `pasos.cierre`, el Dial se sintoniza solo hasta +100, cta al Dial | `OnboardingCompletoPage` + `DialAutomatico` modo `sintonizar` | `onboarding/completo/page.tsx` | 03:12 → 03:18 | 02:31 → 02:34 |
| Barra fija Atrás / Continuar sin dock | `BarraPasos` (del shell) + `BotonAtras` | `onboarding/_boton-atras.tsx` | todas | todas |
| prefers-reduced-motion | Dial quieto, sin cascada, sin transición | `*-desktop-reducido.png` | — | — |

## Lo que todavía NO cambia en este PR (va en otros puntos)
- El Dial del paso 1 (aguja, banda, tabla de energías) es el componente de siempre: se rehace en (b).
- Las bandas del Ecualizador y sus botones de palanca y manzana son los de siempre: se rehacen en (d).
