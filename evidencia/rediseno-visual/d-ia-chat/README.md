# Fase 5 (3/5): chat de texto con memoria y herramientas — evidencia
Apilado sobre `claude/frecuencia-ia-descomposicion` (#18) → #17. Build local contra Supabase real; cuenta `setter` de prueba (borrada, residuo cero). Videos desktop/mobile (.webm), capturas incl. reduced-motion, `marcas-*.json`, 0 errores.

## ⛔ Qué NO está verificado
**No hay `NVIDIA_API_KEY`**: la IA fue un **servidor falso local** (formato OpenAI) con respuestas guionadas, y `modelos_ia` + `prompt_chat` (SQL 0082 pendiente de Diego) los simuló el relay de pruebas del contenedor. Probado de verdad: la ruta del servidor, las herramientas contra la base real con la sesión de la persona, la memoria y la interfaz.

| Qué se pidió | Dónde |
|---|---|
| Chat de texto con memoria en `frecuencia_conversaciones` / `frecuencia_mensajes` (RLS: solo el dueño) — la conversación sigue al recargar | `api/frecuencia/chat/route.ts` · captura 06 (10 mensajes recuperados) |
| Tool calling sobre la capa ÚNICA de herramientas (`crear_objetivo` probado de punta a punta: el objetivo quedó en la base) | `_ia/ejecutar.ts` · captura 02 |
| Armar semana: **propone sin guardar** y solo guarda con el sí de la persona en un mensaje POSTERIOR y con el hash de la propuesta mostrada (el modelo intentó guardar con un hash inventado: bloqueado) | `herramientas-def.ts` (`puedeConfirmarSemana`), `historial.ts` · capturas 03, 04, 05; base: 0 bloques tras proponer, 0 tras el intento falso, 8 tras el sí |
| UI con referencia FUNCIONAL de los 4 componentes, diseño Areté (chamfles, mono, sin violetas): caja que crece sola, acciones rápidas (Crear objetivo / Escribir criterio / Armar mi semana), selector de modelo alimentado desde la base | `chat/_chat-cliente.tsx`, `_chat.module.css` · captura 01 |
| Estados reales (no temporizadores): "pensando" mientras dura el pedido; chips de herramientas con lo que realmente hizo | captura 02 |
| Contexto del agente: Dial de hoy, bloque al aire, tareas postergadas, objetivos, estándar mínimo + reglas del método; todo marcado como DATOS, no instrucciones | `_ia/contexto.ts` |
| Prompt y tono de la base; `tono_agente` está en `todo:true` → se usa la propuesta mientras Diego no confirme | `contexto.ts` |
| Tope de mensajes por hora por persona (en la base), modelo solo de la lista de `modelos_ia`, mensaje ≤ 2000 caracteres, cliente de sesión siempre | route |
| Entrada en el dock ("Agente") | `_dock.tsx` |

## Lo que falta de este punto
- **Adjuntos** del componente de referencia (bolt-style) y **estados de voz / onda** (ia-siri) y **revelado de imágenes** (ai-chat-image-generation): los de voz e imágenes van en los puntos 4 y 5; los adjuntos no se hicieron (sin caso de uso real todavía).
- **Los 4 componentes de 21st.dev nunca llegaron al repo ni a la sesión**: se hizo la interfaz con la descripción funcional del traspaso. Si querés que se parezca más a alguno, pasame el código.
