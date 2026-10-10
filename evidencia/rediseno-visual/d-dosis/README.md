# Escalado automático de dosis (Tarea 5, punto 7.3) — evidencia
Build local de `claude/frecuencia-dosis` contra Supabase real; cuenta `setter` de prueba sembrada con 2 semanas de historia (con su propia sesión) y borrada al final (residuo cero). Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores.

Recorrido: la tarea "Entrenar" (dosis 2, objetivo 4) se cumplió el 100 % las 2 últimas semanas → se propone subir a 3; "Escribir el informe" (dosis 3) 0 % → se propone bajar a 2 con texto sin culpa. Se acepta la primera (la base pasa de 2 a 3) y se deja la segunda como está (la base queda en 3).

| Qué se pidió | Dónde |
|---|---|
| Umbrales desde `reglas_dosis` (subir ≥80 % durante 2 semanas, bajar ≤50 % durante 2 semanas): nada hardcodeado | `src/lib/frecuencia-dosis.ts` (lee `getReglasDosis`) |
| Lógica pura y testeada: 10 tests nuevos (sube, baja, tope en la dosis objetivo, nunca menos de 1, datos insuficientes, por tarea…) | `src/lib/frecuencia/dosis.ts`, `dosis.test.ts` (22/22 verdes con los del motor) |
| Se propone, el usuario confirma; el servidor recalcula y solo aplica si coincide con la propuesta | `aplicarAjusteDosis` en `actions.ts` (cliente de sesión) |
| Aviso sin culpa ("esto era un esfuerzo heroico y lo vamos a hacer sostenible") | `copy.dosis` en `_copy.ts` |
| Panel visible en Semana, con "Aceptar" y "Dejarlo como está" | `semana/_ajustes-dosis.tsx` |
| El armado de la semana ahora agenda la dosis ACTUAL (veces por semana), que crece hasta la dosis objetivo | `src/lib/frecuencia-semana.ts` |

## Cambio de comportamiento a revisar
Antes `armarSemana` agendaba la **dosis objetivo** desde el primer día; ahora agenda la **dosis actual** (arrancar chica y crecer, "hábitos en oferta"). Si preferís lo anterior, es una línea.
