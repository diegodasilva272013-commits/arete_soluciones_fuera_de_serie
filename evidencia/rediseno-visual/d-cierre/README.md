# (d4) Cierre del día — evidencia
Build local de `claude/frecuencia-cierre-visual` contra Supabase real, cuenta `setter` de prueba (borrada al final, residuo cero). Recorrido real: Hoy → Salir al aire → Terminé (la app escribe la evidencia sola) → Cierre completo (registro → aprendizaje → dial → mañana → fin). Videos desktop/mobile (.webm), capturas desktop/mobile/reduced-motion, `marcas-*.json`, 0 errores de página.

| Efecto pedido | Componente | Archivo | Dónde se ve |
|---|---|---|---|
| Registro de emisión como bitácora: hora · nodo · texto, en cascada | `.bitacora*` | `cierre/_cierre-cliente.tsx`, `_cierre.module.css` | 01, 01b |
| Códigos internos traducidos (ENTRENAMIENTO_CUMPLIDO → "Bloque cumplido", MANUAL → "Anotado a mano"…); si aparece uno nuevo se muestra "Registro", nunca el código | `copy.cierre.registro.tipoLabel` | `_copy.ts` | 01 |
| "Lo que aprendiste hoy": paso propio, separado del registro, frases destacadas con comillas | paso `aprendiste` | `_cierre-cliente.tsx`, `cierre/page.tsx`, acción `guardarAprendizaje` | 02, 02b |
| Fin de la transmisión: la pantalla se apaga como un televisor (línea que se achica) y aparece "Día cerrado." | `.apagon*`, `.finEtiqueta` | `_cierre.module.css` | 05a, 05 |
| Mismo Dial (radio) con Atrás/Continuar en una sola barra | `Dial` | `_dial.tsx` (PR #6) | 03 |
| prefers-reduced-motion: sin cascada ni apagón | media query | `_cierre.module.css` | `*-reducido.png` |

## Base de datos
Sin cambios. "Lo que aprendiste hoy" se guarda en `frecuencia_evidencia` con `tipo = 'APRENDIZAJE'` (la columna es texto libre y la política RLS ya permite insertar lo propio); la acción usa el cliente de sesión de la persona. El registro lo excluye y el paso nuevo lo muestra aparte.

## Revisor independiente
Bloqueantes: ninguno. Corregido: si falla el guardado del aprendizaje ahora se avisa (texto de `_copy.ts`), tope de 500 caracteres (campo y acción), la acción ya no devuelve el mensaje crudo de la base, "Siguiente" guarda lo escrito (se sacó el botón redundante de tres botones apretados en 390), el apagón ya no hace un destello blanco (arranca con un resplandor tenue y solo la línea final es blanca), ids locales únicos, `label` con `htmlFor`.
Anotado sin cambiar: los videos `.webm` quedan en el repo como evidencia pedida por el protocolo (pesan ~12 MB); `pasos_falla` no tiene Atrás (ya era así).
