'use client';

/**
 * Dock inferior de navegación de Frecuencia: Hoy · Dial · Áreas ·
 * Espejo. Se oculta durante el onboarding (no tiene sentido navegar a
 * destinos que todavía no se completaron) y en /frecuencia/onboarding
 * no se muestra. "Hoy" y "Espejo" están deshabilitados: sus pantallas
 * son de una fase posterior — se muestran sin link roto, no se
 * esconden, para que se entienda que van a existir.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { copy } from './_copy';
import { dockVisibleEnRuta } from './_dock-visibilidad';
import s from './frecuencia.module.css';

const ITEMS = [
  { href: '/frecuencia/hoy', label: copy.dock.hoy, habilitado: false },
  { href: '/frecuencia/semana', label: copy.dock.semana, habilitado: true },
  { href: '/frecuencia/dial', label: copy.dock.dial, habilitado: true },
  { href: '/frecuencia/areas', label: copy.dock.areas, habilitado: true },
  { href: '/frecuencia/espejo', label: copy.dock.espejo, habilitado: false },
] as const;

export function Dock() {
  const pathname = usePathname();

  if (!dockVisibleEnRuta(pathname)) return null;

  return (
    <div className={s.dockWrap}>
      <nav className={s.dock} aria-label="Navegación de Frecuencia">
        {ITEMS.map((item) => {
          const activo = pathname === item.href || !!pathname?.startsWith(item.href);

          if (!item.habilitado) {
            return (
              <span
                key={item.href}
                className={s.dockItemDeshabilitado}
                aria-disabled="true"
                title={copy.dock.proximamente}
              >
                {item.label}
              </span>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={activo ? s.dockItemActivo : s.dockItem}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
