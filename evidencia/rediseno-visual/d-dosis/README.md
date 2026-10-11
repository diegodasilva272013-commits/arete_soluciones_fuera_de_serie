# Escalado automático de dosis (Tarea 5, punto 7.3) — evidencia
Build local de `claude/frecuencia-dosis` contra Supabase real; cuenta `setter` de prueba sembrada con 2 semanas de historia (con su propia sesión) y borrada al final (residuo cero). Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores.

Recorrido: la tarea "Entrenar" (dosis 2, objetivo 4) se cumplió el 100 % las 2 últimas semanas → se propone subir a 3; "Escribir el informe" (dosis 3) 0 % → se propone bajar a 2 con texto sin culpa. Se acepta la primera (la base pasa de 2 a 3) y se deja la segunda como está (la base queda en 3).

| Qué se pidió | Dónde |
|---|---|
| Umbrales desde `reglas_dosis` (subir ≥80 % durante 2 semanas, bajar ≤50 % durante 2 semanas): nada hardcodeado | `src/lib/frecuencia-dosis.ts` (lee `getReglasDosis`) |
| Lógica pura y testeada: 11 tests nuevos de dosis + 1 del motor (sube, baja, tope en la dosis objetivo o 7, nunca menos de 1, datos insuficientes, por tarea, sin cadena) | `src/lib/frecuencia/dosis.ts`, `dosis.test.ts`, `plan.test.ts` (24/24 verdes) |
| Se propone, el usuario confirma; el servidor recalcula y solo aplica si coincide con la propuesta | `aplicarAjusteDosis` en `actions.ts` (cliente de sesión) |
| Aviso sin culpa ("esto era un esfuerzo heroico y lo vamos a hacer sostenible") | `copy.dosis` en `_copy.ts` |
| Panel visible en Semana, con "Aceptar" y "Dejarlo como está" | `semana/_ajustes-dosis.tsx` |
| El armado de la semana ahora agenda la dosis ACTUAL (veces por semana), que crece hasta la dosis objetivo | `src/lib/frecuencia-semana.ts` |

## Cambio de comportamiento a revisar
Antes `armarSemana` agendaba la **dosis objetivo** desde el primer día; ahora agenda la **dosis actual** (arrancar chica y crecer, "hábitos en oferta"). Si preferís lo anterior, es una línea.

## Revisor independiente
Había un **bloqueante real**, ya corregido: con el valor por defecto que trae la base (`{"todo": true}` en los umbrales) la pantalla de Semana se caía. Ahora se validan los números (si no son válidos, no se propone nada) y una falla de esta función nunca tumba la pantalla.
Importantes corregidos: no se puede escalar "en cadena" con el mismo historial (solo cuentan semanas que empezaron después del último cambio de la tarea: se ve en la captura 02b, tras aceptar y recargar no vuelve a proponer subir); tope duro de 7 veces por semana si no hay dosis objetivo; si una propuesta quedó obsoleta, la pantalla se refresca; el armado de la semana usa `dosisSemanal` (testeada), sin pasarse de la dosis objetivo; textos con singular/plural y sin porcentajes en las propuestas de bajar.
Anotado: "Dejarlo como está" oculta la propuesta solo en ese navegador; los bloques programados que ya pasaron y no se cerraron cuentan como no cumplidos (por eso importa cerrar el día).
