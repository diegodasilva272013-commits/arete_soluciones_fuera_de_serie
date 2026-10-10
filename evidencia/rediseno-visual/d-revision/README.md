# Revisión semanal / ritual del domingo (Tarea 5, punto 7.2) — evidencia
Build local de `claude/frecuencia-revision-semanal` contra Supabase real; cuenta `setter` de prueba sembrada con 2 semanas de historia, bloques de esta semana y un mapa de energía de hace 100 días (con su propia sesión), borrada al final (residuo cero). Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores de página.

Recorrido completo: Decite la verdad → qué funcionó / qué no → volver a puntuar áreas → rediagnóstico de energía (porque toca) → armar y guardar la semana que viene → semana cerrada. Verificado en la base: la revisión quedó guardada en `frecuencia_revisiones` (`que_funciono`, `que_no`, `carga_siguiente` = 11 bloques de 3 tareas).

| Qué se pidió | Dónde |
|---|---|
| "Decite la verdad": métrica principal = entrenamiento cumplido (bloques cumplidos / planificados); secundaria = avance del objetivo (tareas con al menos un bloque cumplido). "Medimos el entrenamiento, no el partido" | `revision/page.tsx` (cálculo), `_revision-cliente.tsx` (`Medidor`) · captura 01 |
| Qué funcionó (se repite) / qué no (se saca), guardado en `frecuencia_revisiones` | `guardarRevision` en `actions.ts` · captura 02 |
| Volver a puntuar las áreas (¿cambió la palanca o la manzana?) | reusa `Ecualizador` · captura 03 |
| Rediagnóstico de energía solo si toca (`frecuencia_rediagnostico_semanas` de la base: 12) con las preguntas del `onboarding_copy` | `page.tsx` + paso `energia` · captura 04 |
| Termina armando la semana siguiente (`armarSemana`, guardada para la semana que viene con `confirmarSemana(…, true)`); si ya está armada, lo avisa | pasos `semana` · capturas 05, 05b |
| Entrada: desde Hoy, destacada los domingos | `hoy/page.tsx` |
| Flujo de pantalla completa sin dock, una sola barra fija | `_dock-visibilidad.ts` |
| Sin culpa, todo el texto en `_copy.ts` (`copy.revision`) | `_copy.ts` |

Bug encontrado y corregido durante la prueba: al guardar la energía la página se revalida y el paso "energía" desaparecía, saltando el índice y salteando "la semana que viene". Los pasos ahora se congelan al abrir.
