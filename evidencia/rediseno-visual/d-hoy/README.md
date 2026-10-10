# (d3) Hoy + EN EL AIRE — evidencia
Build local de `claude/frecuencia-hoy-visual` contra Supabase real, cuenta `setter` de prueba sembrada (objetivo + tarea + bloque de hoy) y borrada al final (residuo cero). Recorrido: guardar dial +70 → Hoy → bandeja de ideas → SALIR AL AIRE → cronómetro → Terminé → vuelve a Hoy. Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores de página.

| Efecto pedido | Componente | Archivo | Dónde se ve |
|---|---|---|---|
| Dial de hoy como display de radio (dígitos luminosos, regla con aguja) | `DialMini` | `hoy/_dial-mini.tsx` | 01 |
| Línea vertical del día: riel con un nodo por bloque, tramo recorrido en azul | `.linea/.fila/.nodo` | `hoy/_hoy-cliente.tsx`, `_hoy.module.css` | 01, 04 |
| Bloque actual: tarjeta que respira con glow azul + badge AHORA + nodo que pulsa | `.itemActual` | `_hoy.module.css` | 01 |
| SALIR AL AIRE: botón grande de ancho completo | `.salirAlAire` | `_hoy.module.css` | 01 |
| Estados traducidos (Cumplido / No salió), nunca códigos internos | `copy.hoy.estadoLabel` | `_copy.ts` | 04 |
| Bandeja de ideas como cajón que se abre y cierra | `.ideasCajon` | `_hoy-cliente.tsx` | 02 |
| EN EL AIRE: el bloque se expande a pantalla completa (layoutId) | `EnElAire` | `hoy/_en-el-aire.tsx` | 03 |
| ON AIR chanfleado con punto rojo que pulsa | `.onAir` | `_en-el-aire.module.css` | 03 |
| Cronómetro gigante monoespaciado con dos puntos que parpadean, glow azul | `.cronometro/.dosPuntos` | `_en-el-aire.module.css` | 03 |
| Estudio 3D de fondo (import dinámico, solo con potencia suficiente y sin reduced-motion) | `VolumetricStudio` | `_en-el-aire.tsx` | 03 (en este contenedor sin GPU se ve el fondo estático) |
| prefers-reduced-motion: sin respiración, pulso, parpadeo ni cajón animado | media queries | CSS de la carpeta | `*-reducido.png` |

Textos nuevos en `_copy.ts` (bloque `hoy`): `lineaDelDia`, `abrirIdeas`, `cerrarIdeas`, `estadoLabel`, `entreLasDos`. Sin cambios en acciones ni datos.
⚠️ El estudio 3D no se pudo ver en este contenedor (sin GPU): se verá en un equipo real.
