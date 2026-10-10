# (d1) Ecualizador — evidencia
Build de producción local de la rama `claude/frecuencia-ecualizador-visual` contra Supabase real, cuenta `setter` de prueba (creada/borrada vía Auth, residuo cero). Videos desktop 1440×900 / mobile 390×844 (.webm), capturas `NN-*-{desktop,mobile,desktop-reducido}.png`, `marcas-*.json` con minuto:segundo y errores de página (0).

| Efecto pedido | Componente | Archivo | Dónde se ve |
|---|---|---|---|
| 10 bandas verticales hechas de segmentos tipo LED (10 por banda), se arrastran desde cualquier punto | `BandaVertical` | `_ecualizador.tsx`, `.pistaVertical/.seg` en `_ecualizador.module.css` | 02 |
| Palanca: banda azul con glow y etiqueta "Palanca" | `.bandaPalanca` | `_ecualizador.module.css` | 02 |
| Manzana podrida: gris que titila (sin movimiento con reduced-motion) | `.bandaManzana`, `@keyframes titilar` | `_ecualizador.module.css` | 02 (`*-reducido`) |
| Cascada de entrada de las bandas (retraso por banda) | `bandaEntra` + `--i` | `_ecualizador.module.css` | 01 |
| Todo el ecualizador entra en 390 sin scroll horizontal; nombres en vertical | `.nombre` (writing-mode) | `_ecualizador.module.css` | 02 mobile |
| Teclado: ↑↓←→, Home, End | `onKeyDown` | `_ecualizador.tsx` | nota en `marcas` |
| Persistencia: tras guardar y recargar vuelven valores, palanca y manzana | `guardarAreas` (sin cambios) | `actions.ts` | 03 |

Sin cambios de lógica: la palanca/manzana automáticas (PR #5) y los textos (`_copy.ts`) siguen igual. El onboarding usa el mismo componente.
