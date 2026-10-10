# 6.2 — Criterios (crear y editar con los 4 puntos)

**Qué hay:** `/frecuencia/criterios` (lista propia + los que me delegaron, solo lectura; la regla y el test salen de `frecuencia_knowledge_blocks.criterio`), `/criterios/nuevo` y `/criterios/[id]` (formulario: qué se decide, qué entra, qué queda afuera, costo si sale mal, reversible + tiempo, quién asume; ámbito personal o de equipo). Usa la acción `guardarCriterio` que ya existía (la misma que usa el agente), sin lógica duplicada.

## Verificado (cuentas de prueba, producción local contra la base real)
| Prueba | Resultado |
|---|---|
| Lista vacía con regla y test del método | ok |
| Guardar incompleto | no guarda, avisa "Faltan puntos"; el aviso se va al seguir escribiendo |
| Guardar con los 4 puntos, reversible 48 h, ámbito de equipo | ok, aparece en la lista |
| Editar el título | ok |
| Compañera de equipo SIN delegación lee el criterio | 0 filas (RLS) |
| Compañera intenta editarlo | 0 filas afectadas (RLS) |
| Residuo | 0 (se borran criterios, equipo y cuentas de prueba) |

Capturas desktop / mobile / reduced-motion + videos en esta carpeta.
