# C8 — test de aislamiento (RLS) + residuo cero

`scripts/frecuencia-c8.mjs` (nuevo en el repo). Crea 6 cuentas de prueba (admin, líder, 2 miembros, ajeno, sin rol habilitado), hace **todas** las comprobaciones con la sesión de cada cuenta (anon key + login = RLS real; la service role solo crea/borra las cuentas y cuenta el residuo), y al final borra todo y verifica residuo cero.

Cómo correrlo: `NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/frecuencia-c8.mjs` (sale 0 si todo OK).

Cubre: equipos (solo admin), datos íntimos de 14 tablas (nadie más los lee: líder, admin, compañero, ajeno, sin rol), lo que el líder SÍ lee (bloques, evidencia, compromisos, delegaciones: solo lectura), delegaciones, co-conductor, escrituras en cuenta ajena, knowledge_blocks, anon sin sesión en las 21 tablas, bucket de imágenes, y residuo cero (tablas, auth, bucket).

**Resultado (salida completa en `salida.txt`): `C8: 224/224 OK`, incluido residuo cero.**

Nota: el test se corrió sin haber aplicado todavía los SQL nuevos 0083 y 0084 (los cierres de "salida del equipo" no están cubiertos hasta que los corras); cuando los corras, volvé a correr el test: `scripts/frecuencia-c8.mjs` es el que da el visto bueno.
