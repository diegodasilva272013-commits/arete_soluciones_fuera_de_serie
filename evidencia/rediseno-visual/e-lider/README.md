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

## Decisiones / avisos
- La base sí le deja leer a la líder la evidencia tipo "aprendizaje" (la RLS de 0078 no distingue tipos); la pantalla la oculta. Si querés que ni la base lo permita, hace falta un SQL nuevo: decime.
- La líder ve bloques sin título de tarea (no tiene permiso sobre las tareas ajenas): solo tipo, hora y estado.
