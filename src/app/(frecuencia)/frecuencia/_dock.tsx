'use client';

/**
 * Dock inferior de navegación de Frecuencia: Hoy · Semana · Dial ·
 * Áreas · Espejo. Lo monta el shell solo fuera de los flujos de varios
 * pasos (ver _dock-visibilidad.ts). "Espejo" sigue deshabilitado: su
 * pantalla es de una fase posterior — se muestra sin link roto, no se
 * esconde, para que se entienda que va a existir.
 *
 * Magnificación: la misma de fuera-de-serie/temporada-1/_efectos.tsx
 * (useMagnificacion), solo con puntero fino — en táctil no hay "cerca
 * del cursor" y los ítems quedan quietos. Vidrio oscuro chanfleado e
 * ítem activo con glow azul.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useMagnificacion } from '@/components/ui/use-magnificacion';
import { copy } from './_copy';
import s from './_shell.module.css';

type Icono = 'hoy' | 'semana' | 'dial' | 'areas' | 'espejo';

const ITEMS: { href: string; label: string; icono: Icono; habilitado: boolean }[] = [
  { href: '/frecuencia/hoy', label: copy.dock.hoy, icono: 'hoy', habilitado: true },
  { href: '/frecuencia/semana', label: copy.dock.semana, icono: 'semana', habilitado: true },
  { href: '/frecuencia/dial', label: copy.dock.dial, icono: 'dial', habilitado: true },
  { href: '/frecuencia/areas', label: copy.dock.areas, icono: 'areas', habilitado: true },
  { href: '/frecuencia/espejo', label: copy.dock.espejo, icono: 'espejo', habilitado: true },
];

/** Íconos de línea propios (1.5px, 24×24) — no de librería, para que hablen el idioma de la radio. */
function IconoDock({ tipo }: { tipo: Icono }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square' as const };
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden>
      {tipo === 'hoy' && (
        <>
          <path {...p} d="M12 3v18" />
          <circle {...p} cx="12" cy="9" r="2.5" />
          <path {...p} d="M8 15h8M9 19h6" />
        </>
      )}
      {tipo === 'semana' && (
        <>
          <path {...p} d="M4 5h16v15H4z" />
          <path {...p} d="M4 10h16M9.5 10v10M15 10v10" />
        </>
      )}
      {tipo === 'dial' && (
        <>
          <path {...p} d="M3 16a9 9 0 0 1 18 0" />
          <path {...p} d="M12 16l4-6" />
          <path {...p} d="M6 16h1M17 16h1M12 7v1" />
        </>
      )}
      {tipo === 'areas' && (
        <>
          <circle {...p} cx="9" cy="10" r="5" />
          <circle {...p} cx="15" cy="10" r="5" />
          <circle {...p} cx="12" cy="15" r="5" />
        </>
      )}
      {tipo === 'espejo' && (
        <>
          <path {...p} d="M7 3h10v18H7z" />
          <path {...p} d="M10 7l4-2M10 11l4-2" />
        </>
      )}
    </svg>
  );
}

function ItemDock({
  item,
  activo,
  mouseX,
}: {
  item: (typeof ITEMS)[number];
  activo: boolean;
  mouseX: MotionValue<number>;
}) {
  const { ref, valor: ancho } = useMagnificacion<HTMLDivElement>(mouseX, { alcance: 150, base: 60, maximo: 92 });
  const escalaIcono = useTransform(ancho, [60, 92], [1, 1.45]);
  const subida = useTransform(ancho, [60, 92], [0, -6]);

  const cuerpo = (
    <>
      <motion.span className={s.dockIcono} style={{ scale: escalaIcono, y: subida }}>
        <IconoDock tipo={item.icono} />
      </motion.span>
      <span className={s.dockLabel}>{item.label}</span>
      {activo && <span className={s.dockActivoLed} aria-hidden />}
    </>
  );

  return (
    <motion.div ref={ref} style={{ width: ancho }} className={s.dockCelda}>
      {item.habilitado ? (
        <Link
          href={item.href}
          className={activo ? s.dockItemActivo : s.dockItem}
          aria-current={activo ? 'page' : undefined}
        >
          {cuerpo}
        </Link>
      ) : (
        <span className={s.dockItemDeshabilitado} role="link" aria-disabled="true" title={copy.dock.proximamente}>
          {cuerpo}
          <span className={s.soloLector}> ({copy.dock.proximamente})</span>
        </span>
      )}
    </motion.div>
  );
}

export function Dock() {
  const pathname = usePathname();
  const mouseX = useMotionValue(Infinity);
  const [punteroFino, setPunteroFino] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const actualizar = () => setPunteroFino(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  return (
    <div className={s.dockWrap}>
      <nav
        className={s.dock}
        aria-label={copy.dock.ariaNav}
        onPointerMove={punteroFino ? (e) => mouseX.set(e.clientX) : undefined}
        onPointerLeave={() => mouseX.set(Infinity)}
      >
        {ITEMS.map((item) => (
          <ItemDock
            key={item.href}
            item={item}
            mouseX={mouseX}
            activo={pathname === item.href || !!pathname?.startsWith(`${item.href}/`)}
          />
        ))}
      </nav>
    </div>
  );
}
