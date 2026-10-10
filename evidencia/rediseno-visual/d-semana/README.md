# (d2) Semana — evidencia
Build local de `claude/frecuencia-semana-visual` contra Supabase real, cuenta `setter` de prueba sembrada con datos mínimos (objetivo + tarea + bloque de hoy) y borrada al final (residuo cero). Videos desktop 1440 / mobile 390 (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json` (minuto:segundo, 0 errores de página).

| Efecto pedido | Componente | Archivo | Dónde se ve |
|---|---|---|---|
| Bloques chanfleados con look por tipo (no negociable hueso, ejecutar azul con glow, orquestar contorno, imprevistos punteado) | `.bloqueNoNegociable/.bloqueEjecutar/...` | `semana/_semana.module.css` | 01, 03 |
| Leyenda de tipos con los mismos estilos | `.leyenda` | `semana/_semana-cliente.tsx` | 01 |
| Línea "AHORA" azul con glow y rombo que pulsa, en la columna de hoy, se mueve sola cada 30 s | `.ahora` | `_semana-cliente.tsx`, `_semana.module.css` | 01 |
| Columna de hoy resaltada; la pantalla se acomoda para ver la grilla/AHORA al abrir; en celular arranca parada en hoy | `.diaHoy`, efectos de montaje | `_semana-cliente.tsx` | 01 mobile |
| Vista previa de la propuesta dentro de la grilla (bloques punteados que respiran) + lista para revisar | `.bloqueFantasma` | `_semana-cliente.tsx` | 02 |
| Al confirmar: sin recargar la página, los bloques nuevos entran en cascada | `router.refresh()` + `bloqueEntra` con retraso por bloque | `_semana-cliente.tsx`, `_semana.module.css` | 03a, 03 |
| Encabezado de días fijo al bajar (desktop) | `.diaNombre` sticky | `_semana.module.css` | — |
| prefers-reduced-motion: sin cascada, sin pulso | media query | `_semana.module.css` | `*-reducido.png` |

Textos nuevos en `_copy.ts`: `semana.ahora`, `semana.leyenda`, `semana.vistaPrevia`. Sin cambios en acciones ni datos.

## Revisor independiente
Bloqueantes: ninguno. Corregido: la vista previa no se veía en celular (la grilla ahora se lleva al primer día de la propuesta), parpadeo al confirmar (la vista previa queda hasta que llegan los bloques reales, con `useTransition`), el scroll automático respeta reduced-motion, clase `undefined` en la leyenda, color a token.
Anotado sin cambiar: `hoyIndex` se calcula en render (ya estaba así antes; solo podría diferir justo a medianoche); la etiqueta AHORA queda cortada si la hora cae pegada a las 05:00.
