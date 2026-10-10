# 6.1 — Administración de equipos

**Qué hay:** `/frecuencia/equipo` (hub: mis equipos, accesos) y `/frecuencia/equipo/admin` (solo admin: crear equipo, elegir líder con buscador real de personas, agregar y sacar miembros, cambiar líder). Link "Equipo →" en Hoy para quien integra un equipo o es admin. Todo con el cliente de sesión (RLS), nada de service role; el servidor además exige admin.
Los accesos Criterios / Delegaciones / Compromiso / Vista del líder del hub se activan en los PR 6.2–6.5 (apilados).

## Verificado (cuentas de prueba: 1 admin, 2 setters; servidor de producción local contra la base real)
| Prueba | Resultado |
|---|---|
| Crear equipo "Setters de prueba" eligiendo líder por búsqueda | ok; el líder queda como miembro solo (trigger) |
| Agregar miembro por búsqueda | ok |
| Hacer líder a otra persona | ok (cambia el rótulo "líder") y volver a cambiar |
| Sacar miembro | ok; el líder no tiene botón "Sacar" |
| No admin: insertar en `frecuencia_equipos` / `frecuencia_equipo_miembros` | rechazado por RLS (error 42501 en ambos) |
| No admin entra a `/frecuencia/equipo/admin` | redirige a `/frecuencia/equipo`; no ve el acceso "Administrar equipos" |
| Búsqueda | solo roles habilitados en Frecuencia; sin comodines ni comas inyectables |
| Residuo | 0 (se borra el equipo de prueba y las cuentas) |

Capturas desktop / mobile / reduced-motion + videos en esta carpeta.
