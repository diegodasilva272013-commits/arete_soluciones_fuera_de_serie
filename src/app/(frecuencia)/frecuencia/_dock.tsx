'use client';

/**
 * Dock inferior de navegación de Frecuencia: Hoy · Semana · Dial · Áreas
 * · Espejo. Vidrio oscuro chanfleado, magnificación real con el cursor
 * (la misma del dock de episodios de Temporada 1, vía use-magnificacion)
 * y el ítem activo marcado con un glow azul que se desliza entre ítems
 * (layoutId). En pantallas táctiles no hay cursor: los ítems quedan en su
 * tamaño base.
 *
 * Se esconde en los flujos de varios pasos (useDockVisible, _shell.tsx).
 * "Espejo" sigue deshabilitado: su pantalla es de una fase posterior —
 * se muestra sin link roto para que se entienda que va a existir.
 */

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useDistanciaAlCursor, useMagnificacion } from '@/components/ui/use-magnificacion';
import { copy } from './_copy';
import { useDockVisible } from './_shell';
import s from './_shell.module.css';

type Icono = 'hoy' | 'semana' | 'dial' | 'areas' | 'espejo';

const ITEMS: { href: string; label: string; icono: Icono; habilitado: boolean }[] = [
  { href: '/frecuencia/hoy', label: copy.dock.hoy, icono: 'hoy', habilitado: true },
  { href: '/frecuencia/semana', label: copy.dock.semana, icono: 'semana', habilitado: true },
  { href: '/frecuencia/dial', label: copy.dock.dial, icono: 'dial', habilitado: true },
  { href: '/frecuencia/areas', label: copy.dock.areas, icono: 'areas', habilitado: true },
  { href: '/frecuencia/espejo', label: copy.dock.espejo, icono: 'espejo', habilitado: false },
];

const EASE = [0.23, 1, 0.32, 1] as const;

export function Dock() {
  const pathname = usePathname();
  const visible = useDockVisible();
  const mouseX = useMotionValue(Infinity);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="dock"
            className={s.dockWrap}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <nav
              className={s.dock}
              aria-label={copy.shell.navegacion}
              onPointerMove={(e) => e.pointerType === 'mouse' && mouseX.set(e.clientX)}
              onPointerLeave={() => mouseX.set(Infinity)}
            >
              <LayoutGroup id="dock-frecuencia">
                {ITEMS.map((item) => (
                  <ItemDock
                    key={item.href}
                    {...item}
                    activo={!!pathname?.startsWith(item.href)}
                    mouseX={mouseX}
                  />
                ))}
              </LayoutGroup>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

function ItemDock({
  href,
  label,
  icono,
  habilitado,
  activo,
  mouseX,
}: {
  href: string;
  label: string;
  icono: Icono;
  habilitado: boolean;
  activo: boolean;
  mouseX: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const distancia = useDistanciaAlCursor(ref, mouseX);
  const lado = useMagnificacion(distancia, { rango: 150, desde: 44, hasta: 66 });
  const iconoLado = useTransform(lado, (l) => l * 0.5);

  const contenido = (
    <>
      <motion.span className={s.dockIcono} style={{ width: lado, height: lado }}>
        {activo && <motion.span layoutId="dock-activo" className={s.dockActivoGlow} transition={{ duration: 0.4, ease: EASE }} />}
        <motion.svg viewBox="0 0 24 24" style={{ width: iconoLado, height: iconoLado }} aria-hidden>
          <IconoDock tipo={icono} />
        </motion.svg>
      </motion.span>
      <span className={s.dockLabel}>{label}</span>
    </>
  );

  if (!habilitado) {
    return (
      <div ref={ref} className={`${s.dockItem} ${s.dockItemDeshabilitado}`} aria-disabled="true" title={copy.dock.proximamente}>
        {contenido}
      </div>
    );
  }

  return (
    <div ref={ref} className={s.dockItemCelda}>
      <Link href={href} className={`${s.dockItem} ${activo ? s.dockItemActivo : ''}`} aria-current={activo ? 'page' : undefined}>
        {contenido}
      </Link>
    </div>
  );
}

/** Íconos propios, trazo fino, en el idioma de la radio. */
function IconoDock({ tipo }: { tipo: Icono }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'square' as const };
  switch (tipo) {
    case 'hoy': // línea de tiempo con la marca de ahora
      return (
        <>
          <path d="M12 3v18" {...p} />
          <path d="M8 7h4M8 17h4" {...p} />
          <path d="M12 12h7" {...p} />
          <circle cx="12" cy="12" r="2" {...p} />
        </>
      );
    case 'semana': // grilla de programación
      return (
        <>
          <path d="M3 5h18v14H3z" {...p} />
          <path d="M3 10h18M9 5v14M15 5v14" {...p} />
        </>
      );
    case 'dial': // banda de sintonía con aguja
      return (
        <>
          <path d="M3 15h18" {...p} />
          <path d="M5 15v-2M9 15v-3M13 15v-2M17 15v-3M21 15v-2" {...p} />
          <path d="M14 4v16" {...p} />
        </>
      );
    case 'areas': // ecualizador
      return (
        <>
          <path d="M5 20v-6M10 20V8M15 20v-9M20 20V5" {...p} />
        </>
      );
    case 'espejo':
      return (
        <>
          <path d="M7 3h10v18H7z" {...p} />
          <path d="M10 7l4-2M10 11l4-2" {...p} />
        </>
      );
  }
}
