# 6.4 — Co-conductor: compromiso mensual con avance

**Qué hay:** `/frecuencia/compromiso`. La persona escribe su compromiso del mes y elige co-conductor entre sus compañeros de equipo; el avance (0–100) lo mueven las dos personas **solo** por `frecuencia_actualizar_avance_compromiso` (el co-conductor no puede editar nada más). Abajo, "Soy co-conductor de": los compromisos de otras personas que me eligieron este mes.

## Verificado (3 cuentas; producción local; base real)
| Prueba | Resultado |
|---|---|
| Escribir compromiso + elegir co-conductor | ok |
| Dueña pone avance 40 | ok, persistido |
| Co-conductora ve el compromiso ajeno con 40% y lo sube a 70 | ok (por la función) |
| Dueña ve 70% | ok |
| Co-conductora edita el texto o el avance directo | 0 filas (RLS: sin UPDATE directo) |
| Persona ajena: leer / mover avance | 0 filas / "No autorizado" |
| Insertar compromiso en nombre de otra persona | rechazado (42501) |
| Co-conductor fuera del equipo | `comparten_equipo` = false → el servidor lo rechaza; el selector solo ofrece compañeros |
| Residuo | 0 al final |

Detalle crudo: `rls-compromiso.json`. Capturas desktop / mobile / reduced-motion y videos (dueña, co-conductora).
Nota: la base no limita el avance a 0–100; la acción del servidor sí (rechaza otros valores).
