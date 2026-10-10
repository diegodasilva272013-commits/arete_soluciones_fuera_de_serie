# 5.5 — Agente de voz (lado app)

**Qué hay:** botón "Hablar" en `/frecuencia/chat` (ElevenLabs, `@11labs/client`), con onda real del micrófono/agente, transcripción, y dos endpoints:
`POST /api/frecuencia/voz/herramientas` (ejecuta las MISMAS 7 herramientas que el chat de texto) y `GET /api/frecuencia/voz/contexto` (variables dinámicas).
Guía para crear el agente: `docs/AGENTE_VOZ_FRECUENCIA.md` (+ `_conocimiento.md`).

## Verificado (cuenta de prueba, servidor de producción local, IA simulada)
| Prueba | Resultado |
|---|---|
| Sin `NEXT_PUBLIC_FRECUENCIA_AGENT_ID` | Se ve "La voz todavía no está conectada…" (captura 01), sin errores de consola |
| Herramienta inexistente | 400 "Herramienta desconocida" |
| `crear_objetivo`, `crear_tarea` | ok, filas creadas por la sesión de la persona (RLS) |
| `armar_semana` (propone) | ok, devuelve `propuesta_hash`, no guarda |
| confirmar sin que la persona haya dicho sí | rechazado: "esperá su sí" |
| confirmar con hash falso | rechazado: "Esa no es la propuesta que se le mostró" |
| confirmar con hash correcto + sí | ok → 9 bloques guardados |
| `registrar_evidencia` | ok |
| Residuo después de limpiar | 0 |

## ⛔ Sin verificar
La conversación real por voz: falta el `agentId` de ElevenLabs (lo crea Diego con la guía) y la clave de NVIDIA. Cuando estén, se prueba hablar → crea tarea → arma semana.

Capturas: desktop / mobile / reduced-motion. Video: `video-voz-*.webm`.

## Revisión independiente (arreglado)
Doble click / desmontar / "Cortar" durante la conexión (sesión y micrófono quedaban vivos), micrófono sin liberar tras pedir permiso, fetch caído sin manejar, fallo de contexto silencioso, mensaje distinto sin micrófono, panel de propuesta que no se limpiaba al guardar, texto libre en variables (saltos de línea/llaves). La semana ahora también se confirma con el botón "Sí, guardala" (no depende del reconocimiento de voz). Se agregaron variables `objetivos_con_id` y `bloques_con_id` para que el agente pueda usar ids reales.

## ⚠️ Riesgos que quedan (decisión de Diego)
- El agentId es público (como en cualquier widget de ElevenLabs): alguien sin cuenta podría gastar minutos. Mitigación: "Allowed hosts" = aretesoluciones.space y tope de gasto en ElevenLabs. Opción más fuerte (URL firmada por servidor) queda para cuando haya agentId.
- La voz se manda a ElevenLabs (tercero): conviene avisarlo en la política de privacidad.
- La compuerta de la semana protege contra el modelo, no contra el propio usuario (guardar su propia semana no le da permisos extra).
