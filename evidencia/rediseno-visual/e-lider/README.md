# 6.5 — Vista del líder

**Qué hay:** `/frecuencia/equipo/lider` (solo si liderás un equipo; si no, vuelve al hub). Por cada persona del equipo: bloques de la semana (cumplidos / total, minutos de foco real, lista), evidencia reciente, compromiso del mes con avance y co-conductor, y delegaciones con el test del líder ("Volvieron X de Y"). **Nunca** dial, espejo ni identidad: la pantalla ni siquiera los consulta, y la base tampoco se los entrega al líder. De la evidencia no se muestran los "aprendizajes" del cierre del día (reflexión personal).

## Verificado con la cuenta de la líder (producción local, base real)
Se sembró a la miembra con datos compartibles **y** datos íntimos marcados "SECRETO" (dial -77, espejo, identidad, mapa de energía, áreas, ideas, objetivo, tarea, criterio, aprendizaje) y a una persona ajena al equipo con una evidencia "AJENO".

| Consulta de la líder, por API (RLS real) sobre la miembra | Filas |
|---|---|
| bloques / evidencia / compromisos / delegaciones | 4 / 2 / 1 / 1 (permitido) |
| dial, espejo, identidad, mapa de energía, áreas, ideas, preferencias | **0** |
| objetivos, tareas (también por id), revisiones, imágenes, conversaciones, criterios | **0** |
| archivos de la miembra en el bucket de imágenes (espejo) | **0** |
| evidencia de la persona ajena al equipo | **0** |

En la pantalla: ninguna de las marcas "SECRETO", ni "AJENO", ni el valor del dial aparecen en el HTML. Detalle crudo en `rls-lider.json`. Capturas desktop / mobile / reduced-motion + video.

## Revisión independiente (con cuenta de líder real; arreglado)
El revisor sembró datos íntimos marcados, entró como líder (API + navegador) y comprobó: **0 filas** de dial, espejo, identidad, mapa de energía, preferencias, áreas, ideas, objetivos, tareas, criterios, revisiones, imágenes, conversaciones y mensajes (por consulta general, por filtro y por id), archivos del bucket inaccesibles (list/download/firmado), escrituras del líder rechazadas (insert por RLS, update/delete 0 filas, función de avance rechazada, subir al bucket ajeno rechazado), y los datos de la persona ajena nunca aparecen. Miembro común, admin y ajeno que entran a la URL son redirigidos y no ven nada. Encontró dos problemas reales de la pantalla, ya arreglados:
1. **Evidencia personal:** la pantalla filtraba un tipo que la app nunca escribe y dejaba pasar reflexiones (pasos ante una falla). Ahora es **lista blanca**: solo `ENTRENAMIENTO_CUMPLIDO` (lo cumplido) y `MANUAL` (lo que la persona anotó como evidencia).
2. **Semana en UTC:** la ventana "esta semana" ahora respeta la zona horaria (un bloque del domingo 23:30 ya no cuenta en la semana equivocada).
Además: texto legible con espacios entre fecha y contenido y ventana de evidencia más amplia por persona.

**En la base (migración nueva `0085_frecuencia_lider_lectura_acotada*.sql`, la corrés vos: chequeo → SQL → verificación):** la lista blanca de evidencia también se aplica en la base (hoy el líder puede *leer por API* todos los tipos aunque la pantalla no los muestre), y `frecuencia_comparten_equipo` deja de poder usarse para averiguar si dos personas cualesquiera comparten equipo.

## Avisos
- La líder ve bloques sin título de tarea (no tiene permiso sobre las tareas ajenas): solo tipo, hora y estado.
- Decisión abierta: ¿querés que `MANUAL` (evidencia anotada a mano) la vea el líder? Hoy sí; si no, se saca de la lista blanca.
- Aceptado (sin cambio): el líder puede leer por API todo el histórico de bloques y compromisos de su equipo (no solo la semana/mes actual).
