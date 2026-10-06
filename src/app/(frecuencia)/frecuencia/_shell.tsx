'use client';

/**
 * Estado compartido del shell de Frecuencia (vive en el layout, que no se
 * desmonta al navegar):
 *  - dial: frecuencia del Dial de hoy (-100…100, null si todavía no hay
 *    check-in). La lee el fondo vivo. Se actualiza al instante cuando el
 *    Dial guarda (marcarDialGuardado), sin esperar a recargar.
 *  - dock: se oculta por ruta (_dock-visibilidad.ts) o porque una pantalla
 *    entró en un flujo de varios pasos (useOcultarDock), p. ej. EN EL AIRE
 *    o la revisión de la semana armada.
 */

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { dockVisibleEnRuta } from './_dock-visibilidad';

type ShellCtx = {
  dial: number | null;
  marcarDialGuardado: (valor: number) => void;
  dockVisible: boolean;
  pedirOcultarDock: (id: string, ocultar: boolean) => void;
};

const Ctx = createContext<ShellCtx | null>(null);

export function ShellFrecuencia({ dialHoy, children }: { dialHoy: number | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const [dial, setDial] = useState<number | null>(dialHoy);
  const [pedidosOcultar, setPedidosOcultar] = useState<ReadonlySet<string>>(new Set());

  // Si el server trae un dial nuevo (revalidatePath después de guardar,
  // o cambio de día), manda ese.
  useEffect(() => setDial(dialHoy), [dialHoy]);

  const pedirOcultarDock = useCallback((id: string, ocultar: boolean) => {
    setPedidosOcultar((prev) => {
      if (prev.has(id) === ocultar) return prev;
      const next = new Set(prev);
      if (ocultar) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const valor = useMemo<ShellCtx>(
    () => ({
      dial,
      marcarDialGuardado: setDial,
      dockVisible: dockVisibleEnRuta(pathname) && pedidosOcultar.size === 0,
      pedirOcultarDock,
    }),
    [dial, pathname, pedidosOcultar, pedirOcultarDock]
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

function useShell(): ShellCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShell fuera de ShellFrecuencia');
  return ctx;
}

export function useDialDelShell() {
  const { dial, marcarDialGuardado } = useShell();
  return { dial, marcarDialGuardado };
}

export function useDockVisible() {
  return useShell().dockVisible;
}

/** Mientras `activo` sea true, el dock se esconde (flujos de varios pasos). */
export function useOcultarDock(activo: boolean) {
  const { pedirOcultarDock } = useShell();
  const id = useId();
  useEffect(() => {
    pedirOcultarDock(id, activo);
    return () => pedirOcultarDock(id, false);
  }, [id, activo, pedirOcultarDock]);
}
