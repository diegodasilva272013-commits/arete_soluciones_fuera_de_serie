# Rediseño visual — (a) Shell inmersivo + fondo vivo + dock

Rama `claude/frecuencia-shell-inmersivo`. Evidencia generada con Playwright contra
**builds de producción** (`next build && next start`) de la rama (`:3000`) y de `main`
(`:3001`), las dos conectadas a un **Supabase simulado local** (`arnes/server.mjs`):
Auth + PostgREST mínimos en memoria, con el seed del método de la migración `0078`.
No se tocó la base real. El código de la app corre sin cambios: middleware, layouts,
server actions y RLS simulada del lado del mock.

Para reproducirlo: `node arnes/server.mjs`, compilar y levantar con `. arnes/env-local.sh`
y después `node arnes/evidencia.cjs http://localhost:3000 http://localhost:3001 ./salida`.
Cuentas simuladas (contraseña `prueba-local`): `setter@prueba.local` (con onboarding
completo), `student@prueba.local` y `nuevo@prueba.local` (setter sin onboarding).

> Datos agregados solo en el mock, porque el seed de `0078` no los trae y en
> producción sí existen: `preguntas_onboarding` (textos marcados `[Mock]`),
> `reglas_plan.imprevistos_porcentaje_dia` y `reglas_decision.umbral_fatiga`.

## Pruebas automáticas: 28/28 OK (`log.tsv`)

| Prueba | Resultado |
|---|---|
| Sin sesión, `/frecuencia` | → `/login?redirectTo=%2Ffrecuencia` |
| Student: link en el sidebar / `/frecuencia` por URL | no aparece / rebota a `/dashboard` |
| Setter: link "Frecuencia" del sidebar de la plataforma | → `/frecuencia/dial`, sin sidebar ni topbar, con header propio |
| "Salir a la plataforma" | → `/dashboard`, con el sidebar de la plataforma |
| Fondo según el dial de hoy −95 / 0 / +95 | `data-sintonia` 0.03 / 0.50 / 0.97 |
| Guardar el Dial | el fondo pasa de 0.70 a 0.05 en vivo, sin recargar |
| Server action con `revalidatePath` (estacionar idea en Hoy) | la pantalla trae los datos nuevos del servidor (dial mini +40 → −60) |
| Onboarding, cierre del día, semana con propuesta | sin dock, una sola barra fija abajo y el CTA recibe el toque |
| Descartar la propuesta, volver a Hoy | vuelve el dock |
| Dial y Hoy con scroll hasta el final (móvil y desktop) | el contenido termina antes del dock |
| Móvil 390 | sin scroll horizontal |
| `prefers-reduced-motion` | sin WebGL y sin animación de grano (fondo estático) |

## Antes / después de la plataforma (`antes-despues/`)

Capturas de página completa de `main` y de la rama, con el mismo usuario y los mismos datos:

| Pantalla | Desktop 1440 | Móvil 390 |
|---|---|---|
| `/dashboard` | idénticas píxel a píxel | idénticas píxel a píxel |
| `/leads` | difieren en 6×6 px: es el punto pulsante de "En vivo", capturado en otro instante de su animación | idénticas píxel a píxel |

## Tabla de efectos

Los tiempos son minuto:segundo del video, con ±1 s de margen (se registran desde que se
crea el contexto del navegador).

| Efecto pedido | Componente usado | Archivo | Se ve en |
|---|---|---|---|
| Sin barra superior ni sidebar en /frecuencia, sin tocar `topbar.tsx` | grupo de rutas `(frecuencia)`, que no hereda `(private)/layout.tsx` | `src/app/(frecuencia)/frecuencia/layout.tsx` | `01` 0:14 |
| Header mínimo propio (app + salir) | `FrecuenciaShell` → `header` (barras de señal que laten) | `_shell.tsx`, `_shell.module.css` | `01` 0:14 · `01` 0:31 (salir) · `04` 0:14 |
| Fondo vivo en toda la app | `FondoVivo`: `AnimatedGradient` preset Prism (reusado, a media resolución) + grano animado + halo + viñeta | `_fondo-vivo.tsx` | `01` 0:14 en adelante |
| La mezcla sigue el dial de hoy (bajo: grano y desaturado; alto: azul limpio) | `sintoniaDe()` → opacidad y filtro de cada capa | `_fondo-vivo.tsx`, `layout.tsx` (`frecuenciaDeHoy`) | `02` 0:03 (−95) · 0:08 (0) · 0:13 (+95) |
| El fondo cambia en vivo al guardar el Dial | `useSintonia()` desde `Dial` | `_shell.tsx`, `_dial.tsx` | `02` 0:22 |
| `prefers-reduced-motion`: versión estática | `useReducedMotion` + CSS | `_fondo-vivo.tsx`, `_shell.module.css` | `capturas/desktop-reduced-motion.png` |
| Dock con la magnificación real de temporada-1 | `useMagnificacion` (la matemática y el resorte de `DockEpisodio`) | `src/components/ui/use-magnificacion.ts`, `_dock.tsx` | `01` 0:17 · `capturas/desktop-dock-magnificado.png` |
| Dock de vidrio oscuro chanfleado, ítem activo con glow azul | `.dock` (backdrop-filter + clip-path), `.dockItemActivo` + LED que respira | `_shell.module.css` | `01` 0:17–0:31 · `04` |
| Dock oculto en flujos, con su barra Atrás/Continuar fija y sin superposición | `esRutaDeFlujo`, `useFlujoActivo`, `BarraPasos`, `CapaFija` | `_dock-visibilidad.ts`, `_barra-pasos.tsx`, `_shell.tsx` | `03` 0:03 (onboarding) · 0:12 (cierre) · 0:15 (semana) · 0:24 (vuelve el dock) |
| Transición entre pantallas con AnimatePresence visible | `AnimatePresence mode="wait"` + `RutaCongelada`: sale con blur, entra con blur y subida | `_shell.tsx` | `01` 0:22 · 0:24 · 0:26 · 0:29 · `04` 0:06–0:12 |
| Entrada en cascada | `.pantalla > *` con un retardo escalonado | `frecuencia.module.css` | cada cambio de pantalla en `01` y `04` |
| Kicker con línea que se dibuja | `.kickerLine.on`, ahora con keyframe (antes no se animaba nunca) | `frecuencia.module.css` | cada cambio de pantalla en `01` y `04` |
| Títulos con el patrón heroTitle (segunda línea en Spectral itálica azul) | `.titulo` / `.tituloAcento` (bloque con glow) | `frecuencia.module.css` | `01` 0:14 y 0:29 (Dial: "Escasez FM / *Abundancia FM*") |
| Botón primario chanfleado con glow en hover; secundario chanfleado en contorno, con el mismo alto | chanfle en `::before`/`::after`, glow con `drop-shadow` | `frecuencia.module.css` | `03` 0:15 · `capturas/movil-semana-propuesta.png` |

## Lo que hacía `src/app/(private)/layout.tsx` y qué pasó con cada cosa

| Lo que aportaba | ¿Lo necesita Frecuencia? | Dónde quedó |
|---|---|---|
| `metadata.robots` noindex/nofollow | Sí | replicado en `(frecuencia)/frecuencia/layout.tsx` |
| `AppShell` → `getCurrentUserContext()` (sesión y rol) | Sí | el layout de Frecuencia lo llama, y además `tieneAccesoFrecuencia()` con redirect |
| `AppShell` → `tieneAccesoFrecuencia()` (para mostrar el link del sidebar) | Sí, como control de acceso | lo mismo de arriba. El middleware también filtra por pathname y no cambió |
| `AppShell` → conteo de altas del día (admin, service role) | No | solo alimentaba un badge del sidebar y la topbar |
| `Sidebar` | No (pedido explícito) | — |
| `Topbar`: notificaciones, menú de usuario y logout, buscador, toggle de tema, `MobileNav` | No (pedido explícito) | se llega a todo con "Salir a la plataforma". El tema: Frecuencia es solo oscura, así que el shell saca `html.light` mientras estás adentro y lo restaura al salir |
| `<main>` con su padding y fondo `bg-brand-black` | No | lo reemplazan el fondo vivo y el layout propio (se sacaron los márgenes negativos que lo compensaban) |
| `PushAutoPrompt` | Sí | replicado en el shell: montado una sola vez, por encima del dock y oculto en los flujos |
| `loading.tsx` / `error.tsx` / `not-found.tsx` de `(private)` | — | no existen. Lo global (globals.css, Inter, SplashLoader, PWARegister y JSON-LD) viene del layout raíz, que sigue envolviendo a Frecuencia |
