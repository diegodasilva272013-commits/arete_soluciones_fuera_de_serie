# Frecuencia — estado final (reemplaza las tablas de estado de `FRECUENCIA_HANDOFF.md`)

Fecha de este corte: 2026-10-10. Rama `claude/frecuencia-integracion` = TODO junto (PR único de integración).
El método, las reglas de trabajo y el contexto del `FRECUENCIA_HANDOFF.md` siguen vigentes; solo cambia el estado.

## 1. Qué existe y está probado (con evidencia en `/evidencia/rediseno-visual/*`)
| Área | Estado |
|---|---|
| Shell inmersivo, onboarding con copy nuevo, Ecualizador (palanca/manzana automáticas) | ✅ ya en producción (PR #2–#5 cerrados) |
| Dial como una radio, Ecualizador visual, Semana, Hoy + EN EL AIRE, Cierre del día (visual) | ✅ probado local (desktop, mobile, reduced-motion, video) |
| Espejo (check-in, foto, historial), Dosis automática, Revisión semanal (domingo), Estándar mínimo + lenguaje de escasez | ✅ probado local |
| IA: base NVIDIA (cliente, límites, 7 herramientas), descomposición del objetivo, chat con memoria, imágenes, agente de voz (lado app) | ✅ probado con servidor de IA **simulado** · ⛔ sin probar contra NVIDIA real (falta la clave) |
| Equipos: admin (crear, líder, miembros), criterios (4 puntos), delegaciones (criterio obligatorio, "volvió", test del líder), co-conductor (compromiso mensual con avance), vista del líder (sin dial/espejo/identidad) | ✅ probado local con cuentas reales + revisor independiente |
| Test de aislamiento C8 (`scripts/frecuencia-c8.mjs`) | ✅ **224/224**, residuo cero |

## 2. Qué falta (y por qué)
| Pendiente | Motivo / quién |
|---|---|
| **SQL 0080, 0081, 0082, 0083, 0084, 0085** | Los corrés vos (chequeo → SQL → verificación; cada uno trae CHECK, VERIFY y ROLLBACK en `supabase/migrations/`). La app funciona sin 0083–0085 pero quedan abiertos los huecos que cierran. |
| UI del **guardarropa** y de la **dieta de entradas** (7.4) | Esperan que corras y verifiques el SQL 0080 (crea las tablas). |
| **Copy**: aplicar `evidencia/copy-propuesta.md` | Espera tu aprobación. |
| **IA con NVIDIA real** | Falta `NVIDIA_API_KEY` en Vercel y en el entorno de la nube (nunca por chat). Después de cargarla hay que probar chat, descomposición e imágenes en vivo y ajustar si el formato de respuesta de NVIDIA difiere. |
| **Voz con ElevenLabs** | Crear el agente con `docs/AGENTE_VOZ_FRECUENCIA.md` y cargar `NEXT_PUBLIC_FRECUENCIA_AGENT_ID` en Vercel. Después probar "hablar → crea una tarea → arma la semana". |
| `CRON_SECRET` | Quedó expuesto en el historial (commit 94efd94): hay que **rotarlo**. El PR #1 saca los `.env` del repo. |
| Borrar `preguntas_onboarding` (Tarea 3B) | SQL tuyo, pendiente. |
| Cerrar la otra sesión "Rediseño visual de Frecuencia" | Es un duplicado; que no mergee nada. |

## 3. Decisiones nuevas
- **Evidencia visible para el líder:** lista blanca `ENTRENAMIENTO_CUMPLIDO` + `MANUAL` (las reflexiones nunca). SQL 0085 lo aplica también en la base. Si no querés que el líder vea `MANUAL`, se saca de la lista.
- **Delegaciones:** quien recibe ve la tarea y el criterio solo mientras siga en el equipo (0083); no se puede borrar una tarea delegada sin quitar antes la delegación.
- **Compromiso:** uno por persona y mes (índice único, 0084); el co-conductor solo toca el avance y solo mientras comparta equipo.
- **Dosis semanal:** `frecuencia-semana.ts` ahora usa `dosisSemanal(dosis_actual, dosis_objetivo)` (cambio de comportamiento avisado en el PR de dosis).
- **Quien administra equipos** es solo el rol admin; el líder no administra miembros.
- El dock tiene 6 ítems (Hoy, Semana, Dial, Áreas, Espejo, Agente); Equipo se entra desde Hoy.

## 4. Cómo se prueba todo
1. `npx vitest run src/lib/frecuencia` (83 tests).
2. `NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/frecuencia-c8.mjs` → debe terminar en `C8: N/N OK`. Volver a correrlo después de cada SQL de seguridad.
3. Evidencia visual: `/evidencia/rediseno-visual/` (cada carpeta tiene README con la tabla de pruebas; `z-recorrido-final/` es el recorrido completo mobile y desktop).

## 5. Variables de entorno de Frecuencia
`NVIDIA_API_KEY` (servidor, secreta) · `NEXT_PUBLIC_FRECUENCIA_AGENT_ID` (pública, no es secreto) · opcionales de prueba `NVIDIA_CHAT_BASE_URL`, `NVIDIA_IMAGES_BASE_URL`, `FRECUENCIA_IA_MODO_PRUEBA` (**nunca en producción**: solo habilitan servidores de IA simulados).
Modelos y prompts de la IA viven en `frecuencia_knowledge_blocks` (`modelos_ia`, `prompt_chat`, `prompt_descomposicion`, `prompt_imagen`, `limite_imagenes_diario`), no en el código.

## 6. Orden de merge
Mergeá **solo el PR de integración** (todo junto, ya sin conflictos). Los PR #6–#27 quedan redundantes y se cierran sin mergear (siguen sirviendo como historial punto por punto, cada uno con su evidencia).
