# Espejo (Tarea 5, punto 7.1) — evidencia
Build local de `claude/frecuencia-espejo` contra Supabase real; cuenta `setter` de prueba (borrada al final) y fotos de prueba subidas al bucket `frecuencia-imagenes` y **borradas** (0 objetos restantes, residuo cero). Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores de página.

| Qué se pidió | Componente | Archivo | Dónde se ve |
|---|---|---|---|
| Pantalla Espejo propia, habilitada en el dock | `EspejoPage`, dock | `espejo/page.tsx`, `_dock.tsx` | 01 |
| Check-in de mañana: cómo me veo / me percibo / me siento con lo que llevo puesto | `EspejoCliente` | `espejo/_espejo-cliente.tsx` | 02 |
| Foto opcional en `frecuencia-imagenes/<user_id>/espejo/<uuid>.<ext>` (png/jpg/webp, ≤5 MB, validación en cliente y servidor; si la fila falla, la foto se borra) | `guardarCheckinEspejo` | `actions.ts` | 02, 03 |
| La vestimenta elegida la noche anterior (se guarda en el Cierre del día) se muestra acá a la mañana | bloque "La ropa que dejaste elegida" | `espejo/page.tsx` | 01 |
| Historial de autopercepción con efecto coverflow (tarjetas que se inclinan y se atenúan según su distancia al centro, scroll-snap) | `Coverflow` | `_espejo-cliente.tsx`, `_espejo.module.css` | 04, 05 |
| Íntimo: solo el dueño (RLS ya lo garantiza: lectura/escritura `user_id = auth.uid()`; fotos por ruta con su id) | — | `0078_frecuencia_modelo.sql` | — |
| prefers-reduced-motion: sin inclinación | `matchMedia` | `_espejo-cliente.tsx` | `*-reducido.png` |

## Lo que NO está (y por qué)
**Guardarropa mínimo** necesita una tabla nueva (`frecuencia_guardarropa`). Siguiendo la sección 9 del traspaso, el SQL va aparte (PR de SQL) para que lo corras vos; hasta que confirmes la verificación, la pantalla muestra un recuadro "llega en la próxima actualización". La interfaz del guardarropa se construye después de tu confirmación.
Nota: el efecto original sugería reusar `scroll-locked-video-hero.tsx`; ese componente es de video con scroll anclado y no encaja con un carrusel de tarjetas, así que el coverflow es propio (CSS 3D + scroll-snap, sin librerías nuevas).

## Revisor independiente
Bloqueantes: ninguno (subida de foto, rutas y RLS revisadas: sin fuga entre usuarios). Corregido: centrado del coverflow (faltaba `position: relative`, las tarjetas laterales se inclinaban asimétricas), botón trabado si la acción lanza (try/finally), el campo de archivo no se reseteaba al quitar/guardar, una sola llamada para firmar todas las fotos + imagen oculta si la URL vencida falla, semántica de lista (ul/li), contraste de las tarjetas laterales, la ropa de anoche se pide aparte (no depende de las últimas 40 filas), reduced-motion declarado en CSS.
Decisión de producto anotada: se pueden hacer varios check-ins el mismo día (no hay UNIQUE).
