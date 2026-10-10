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

## Revisión independiente (arreglado)
**En la app:** el servidor ya no deja pasar errores de lectura como "no hay nada"; carrera de duplicados frenada también por la base (ver SQL); "Quitar delegación" (la otra persona deja de ver tarea y criterio); no se puede borrar una tarea delegada sin quitar antes la delegación (evita que la otra persona la pierda en silencio y que cambie el "volvieron X de Y"); criterio sin campos vacíos; encabezados `h2`, `aria-label` por tarea, estado anunciado.
**En la base (migración nueva `0083_frecuencia_delegaciones_acceso*.sql`, la corrés vos: chequeo → SQL → verificación):**
1. Quien recibió una delegación solo ve la tarea y el criterio mientras SIGA en el equipo de quien delegó (antes los veía para siempre).
2. Quien delega no puede reasignar la delegación a alguien de otro equipo.
3. Una tarea no puede estar delegada dos veces a la misma persona mientras siga en sus manos (índice único).
Sin correr 0083 todo funciona igual, solo quedan abiertos esos tres huecos.
