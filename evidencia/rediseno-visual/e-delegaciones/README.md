# 6.3 — Delegaciones

**Qué hay:** botón "Delegar" en cada tarea (si integrás un equipo) → `/frecuencia/delegaciones/nueva` (tarea, compañero de equipo, **criterio obligatorio**) → `/frecuencia/delegaciones`: "Las que delegué" (con "En sus manos / Volvió", botón para marcar que volvió y el **test del líder**: "Volvieron X de Y — si una tarea delegada vuelve a tu escritorio, no delegaste criterio") y "Las que me delegaron" (el receptor ve la tarea con sus pasos y el criterio completo, solo lectura).

## Verificado (3 cuentas: líder, miembra, ajena; producción local, base real)
| Prueba | Resultado |
|---|---|
| Delegar sin elegir criterio/persona | no se crea nada, aviso |
| Delegar con criterio | ok → "En sus manos", "Volvieron 0 de 1" |
| Quien delegó marca "volvió" | ok → "Volvieron 1 de 1" |
| Receptor ve tarea (con pasos) y criterio completo | ok (captura 06) |
| Receptor: botón "volvió" | 0 botones; por API: marcar volvió = 0 filas, editar tarea = 0, editar criterio = 0 (RLS) |
| Persona ajena: leer tarea / criterio / delegaciones | 0 / 0 / 0 |
| Delegar a quien no comparte equipo | rechazado (42501) |
| Delegar sin criterio (insert directo) | rechazado por la base (23502 not null) |
| Delegarse a sí mismo | rechazado (23514) |
| Delegar "en nombre de" otra persona | rechazado (42501) |
| Residuo | 0 al final (se borran datos, equipo y cuentas) |

Detalle crudo: `rls-delegaciones.json`. Capturas desktop / mobile / reduced-motion + videos del que delega y del que recibe.
