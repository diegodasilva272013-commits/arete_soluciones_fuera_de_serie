# Estándar mínimo visible (7.5) y lenguaje de escasez (7.6) — evidencia
Rama `claude/frecuencia-escasez`, que **parte de las ramas de Hoy (#9) y Cierre (#10)** (usa sus pantallas): mergear primero #9 y #10. Build local contra Supabase real, cuenta `setter` de prueba (borrada, residuo cero). Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores.

| Qué se pidió | Dónde |
|---|---|
| 7.5 Recordatorio visible del estándar mínimo (lo que la persona escribió en el onboarding: `frecuencia_identidad.estandar_minimo`), solo lectura, en Hoy | `hoy/_estandar-minimo.tsx`, `hoy/page.tsx` · captura 01 |
| 7.6 Detección de lenguaje de escasez en textos libres (ideas de Hoy, registro y aprendizaje del Cierre): si aparecen palabras de las 4 energías, se OFRECE "cambiar de dial", sin juicio ni bloqueo | `_oferta-dial.tsx` · captura 02 |
| Las palabras NO están en el código: salen de `frecuencia_knowledge_blocks['palabras_escasez']` (si no existe, la detección queda apagada y no pasa nada) | `getPalabrasEscasez` en `frecuencia-kb.ts` |
| Lógica pura con 7 tests (sin acentos ni mayúsculas, frases, palabra entera, prefijo con `*`, varias energías, datos inválidos) | `src/lib/frecuencia/escasez.ts`, `escasez.test.ts` |
| El enlace lleva al Dial | captura 03 |
| Todo el texto en `_copy.ts` (`copy.escasez`, `copy.estandar`) | `_copy.ts` |

## SQL para correr vos (contenido del método)
`supabase/migrations/0081_frecuencia_palabras_escasez*.sql` (CHECK → SQL → VERIFY → ROLLBACK): inserta la fila `palabras_escasez` con una lista PROPUESTA de 38 palabras/frases (editable después con un UPDATE). Hasta que lo corras, la función 7.6 no hace nada visible.
⚠️ **Cómo se probó**: esa fila todavía no existe en la base real, así que en la prueba local el relay de pruebas (solo en este contenedor) devolvió una lista reducida de ejemplo para `palabras_escasez`; el resto de los datos son reales. No se escribió nada en `frecuencia_knowledge_blocks`.
