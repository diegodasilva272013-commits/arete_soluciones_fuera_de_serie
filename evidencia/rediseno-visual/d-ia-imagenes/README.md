# Fase 5 (4/5): imágenes (imagen mental del objetivo y ancla por tarea) — evidencia
Apilado sobre #19 → #18 → #17. Build local contra Supabase real; cuenta `setter` de prueba y archivos subidos al bucket **borrados** (0 objetos restantes, residuo cero). Videos desktop/mobile, capturas incl. reduced-motion, `marcas-*.json`, 0 errores.

## ⛔ Qué NO está verificado
**No hay `NVIDIA_API_KEY`**: el generador fue un **servidor falso local** que devuelve un PNG real tras 3,5 s; `modelos_ia` (con los endpoints) y `prompt_imagen` los simuló el relay de pruebas (SQL pendiente de Diego). Probado de verdad: estados, guardado de la fila, subida al bucket con la sesión de la persona, URL firmada, límite diario, la pantalla. **El formato real de la respuesta de FLUX/NVIDIA no se pudo confirmar** (no hay salida a build.nvidia.com): el código acepta `artifacts[0].base64` (formato documentado en el traspaso) y valida la cabecera de la imagen.

| Qué se pidió | Dónde |
|---|---|
| Imagen mental del objetivo ("la mesa se crea dos veces") y ancla visual por tarea | `objetivos/[id]/_generador-imagen.tsx` · capturas 01, 03 |
| Una imagen por pedido, sin variantes | `crearImagen` (una fila por pedido) |
| Límite diario desde la base (`limite_imagenes_diario`, 5 por día; cuentan las que no fallaron, día de la persona): el 6º pedido muestra un mensaje claro y no genera nada | `_ia/imagenes.ts` · captura 04 |
| Se sube a `frecuencia-imagenes/<user_id>/<uuid>.<ext>` y se guarda en `frecuencia_imagenes` con su estado (pendiente → generando → lista \| error) | `procesarImagen` (verificado: 1 fila "lista" con ruta y 1 archivo en el bucket) |
| Revelado atado al estado REAL: mientras está pendiente/generando se ve el estado leído de la base cada 1,2 s; al pasar a "lista" la imagen se revela (de borrosa y oscura a nítida). Nada de temporizador falso | capturas 02, 03a, 03 |
| Solo modelos con licencia comercial confirmada y de la base (nada hardcodeado); el endpoint solo se acepta si es https y host `ai.api.nvidia.com` (anti SSRF) | `nvidia.ts` (`endpointImagenSeguro`), 4 tests nuevos |
| El tipo de archivo se decide por la cabecera real (png/jpg/webp ≤ 5 MB), no por lo que diga el proveedor | `tipoDeImagen` |
| También como herramienta del agente (`generar_imagen`) y acción rápida del chat | `herramientas-def.ts`, `ejecutar.ts` |
| Solo con la sesión de la persona; si falla, la fila queda en "error" (no cuenta para el límite) y el archivo no queda huérfano | `procesarImagen` |
