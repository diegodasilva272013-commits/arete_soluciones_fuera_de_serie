# (b) El Dial como una radio — evidencia

Build de producción local de la rama `claude/frecuencia-dial`, contra la base real (Supabase), con cuenta `setter` de prueba creada vía Auth y borrada al final (residuo cero). Las energías y el valor los guardó la propia app con la sesión del usuario.

- Videos: `video-dial-desktop.webm` (1440×900) y `video-dial-mobile.webm` (390×844).
- Capturas: `NN-*-desktop.png`, `NN-*-mobile.png`, `NN-*-desktop-reducido.png` (prefers-reduced-motion). `marcas-*.json`: minuto:segundo de cada captura y errores de página (0 en las tres).
- El contenedor no tiene GPU (render por software): las animaciones se ven más lentas que en un equipo real.

## Tabla de efectos
| Efecto pedido | Componente | Archivo | Video |
|---|---|---|---|
| Display de radio: dígitos luminosos grandes con los "8" apagados detrás, signo en su casillero | `.display*` | `_dial.tsx`, `_dial.module.css` | todo |
| Estación sintonizada ("Escasez FM / Abundancia FM / Entre las dos radios") con LED | `.displayEstacion` | `_dial.tsx` | todo |
| Estática real (canvas de ruido) que crece cuanto más baja la aguja | `.estatica` + loop rAF | `_dial.tsx` | 02 |
| Onda que se dibuja y se vuelve azul, limpia y con glow al subir; sigue la aguja cuadro a cuadro | `motion.path` + `caminoSenal` | `_dial.tsx` | 05 |
| Banda a todo el ancho, marca por unidad, más larga cada 5 y 25, número cada 25 | `.marcas`, `.numeros` | `_dial.tsx`, `_dial.module.css` | todo |
| Aguja fina hueso con glow azul que cruza señal y banda | `.aguja` | `_dial.module.css` | todo |
| Arrastre desde cualquier punto de la banda + inercia al soltar | pointer handlers + `animate(type:'inertia')` | `_dial.tsx` | 03b |
| "Clic" visual (y háptico en celular) al pasar por cada 25 | `.marcaClic`, `.numeroClic`, `navigator.vibrate` | `_dial.tsx` | 02–04 |
| Teclado: flechas ±1, Shift ±10, Home/End | `onKeyDown` | `_dial.tsx` | 05–06 |
| El fondo vivo de toda la app sintoniza en vivo mientras se mueve la aguja; si se va sin guardar vuelve al dial de hoy | `useSintonia` / `useRestaurarSintonia` | `_dial.tsx`, `_shell.tsx` | 02 → 05 |
| Energías como 4 medidores VU de LEDs verde/ámbar/rojo; un toque prende un LED; botón "−" | `.medidor*`, `.led*` | `_dial.tsx` | 03 |
| Panel "cambiar de dial" con acciones cuando está en escasez | `.panelCambio` | `_dial.tsx` | 02 |
| prefers-reduced-motion: sin inercia, ruido y onda quietos | — | `_dial.tsx` | `*-reducido.png` |
| Shader del fondo ya activo también en `/frecuencia/dial` (el Dial dejó de tener su propio gradiente) | `FondoVivo` | `_shell.tsx` | todo |
| En onboarding no se repite la instrucción de arrastre (la pregunta ya la dice) | prop `sinInstruccion` | `onboarding/_pasos/paso-dial.tsx` | — |

## Qué no cambia
La firma del componente es la misma: lo siguen usando el paso 1 del onboarding, `/frecuencia/dial` y el Cierre del día sin tocar sus archivos (salvo `sinInstruccion` en el onboarding).

## Revisor independiente
Bloqueantes: ninguno. Importantes corregidos: (1) la inercia podía pasarse de ±100 y dejar `NaN` en la onda → clamp; (3) tras guardar en `/dial`, mover la aguja y salir no restauraba el fondo → `guardado` se reinicia al tocar; (4) el dock tapaba el final → más espacio inferior. Menores corregidos: reduced-motion en el primer render, click derecho, PageUp/PageDown, `aria-orientation`, `aria-live` solo en la estación, `useId` para el filtro, se detiene la inercia al desmontar.
No tocado a propósito: (2) el shader ahora corre también en `/dial` — ⚠️ sin medir en un celular real de gama baja; (5) en ±100 la aguja se superpone con la etiqueta del extremo (es la posición real del valor).
Nota: el revisor no encontró `docs/FRECUENCIA_HANDOFF.md` porque vive en otra rama, no en main.
