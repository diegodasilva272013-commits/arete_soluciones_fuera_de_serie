# Fase 5 (2/5): descomposición del objetivo con IA — evidencia
Rama apilada sobre `claude/frecuencia-ia-base` (#17). Build local contra Supabase real; cuenta `setter` de prueba (borrada, residuo cero).

## ⛔ Qué NO está verificado
**No hay `NVIDIA_API_KEY`**, así que no se habló con NVIDIA de verdad: la IA fue un **servidor falso local** (formato OpenAI) con una respuesta fija, y el contenido de la base que todavía no existe (`modelos_ia` con modelos y `prompt_descomposicion`, SQL 0082 pendiente de Diego) lo simuló el relay de pruebas de este contenedor. Lo que SÍ se probó de punta a punta: pantalla, estados, validación, guardado real en la base con la sesión de la persona, dependencias y metas.

| Qué se pidió | Dónde |
|---|---|
| Objetivo → metas por período → tareas con protocolo, dependencias y tipo de energía | `descomposicion.ts` (validación), `_descomponer-actions.ts` |
| La IA propone y la persona confirma ANTES de guardar; después, armar la semana | `_descomposicion.tsx` · capturas 02 (propuesta, 0 tareas nuevas guardadas) → 03 (guardada + botón "Armar mi semana") |
| El prompt y las reglas del método salen de la base (nada en el código); sin configuración, falla cerrado con mensaje | `getPromptDescomposicion`, `getModelosIA` |
| Lo que devuelve la IA no es confiable: se extrae el JSON (aun con ``` o texto), se acota todo y se descartan dependencias inválidas o con ciclos; lo que vuelve del navegador se re-valida | `descomposicion.ts` · 11 tests |
| Arrancan con dosis 1 ("hábitos en oferta") y crecen hasta la dosis objetivo con el escalado de dosis | `guardarDescomposicion` |
| Si algo falla al guardar no queda a medias (se borran las recién creadas) | `guardarDescomposicion` |
| Estados reales: "pensando" mientras dura el pedido (ecualizador chico), errores en lenguaje normal | captura 01b, `copy.descomposicion.errores` |
| Cliente de sesión, nunca service role | acciones |

Bug real encontrado con la prueba de punta a punta y corregido: al confirmar, el navegador mandaba la propuesta ya normalizada y el servidor la leía con la forma cruda de la IA, perdiendo dosis, dependencias y metas. Ahora hay `revalidarPropuesta` con test.
