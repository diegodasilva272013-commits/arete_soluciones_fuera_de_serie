'use client';

/**
 * SHELL INMERSIVO de Frecuencia: pantalla completa, sin el sidebar ni la
 * barra superior de la plataforma (este grupo de rutas no hereda el
 * layout de (private)). Arma, en este orden:
 *
 *  - el fondo vivo sintonizado con el Dial de hoy (_fondo-vivo.tsx),
 *  - un header mínimo propio (nombre de la app + salir a la plataforma),
 *  - la transición entre pantallas con salida y entrada visibles,
 *    (RevealObserver + data-reveal para lo que queda bajo el pliegue se
 *    suma pantalla por pantalla en los PRs de cada una),
 *  - el dock (pantallas normales) o el espacio de la barra fija de
 *    Atrás/Continuar (flujos de varios pasos).
 *
 * También expone el contexto que usan las pantallas:
 *  - useSintonia(): mover el fondo en vivo (el Dial, en vivo mientras se mueve la aguja).
 *  - useFlujoActivo(activo): declarar un flujo que no es una ruta propia
 *    (EN EL AIRE, armar semana) → se oculta el dock.
 *  - useEnFlujo(): lo lee la barra de pasos para fijarse abajo.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { PushAutoPrompt } from '@/components/push-auto-prompt';
import { FondoVivo } from './_fondo-vivo';
import { Dock } from './_dock';
import { esRutaDeFlujo, DOCK_CLEARANCE_CSS, BARRA_CLEARANCE_CSS } from './_dock-visibilidad';
import { copy } from './_copy';
import s from './_shell.module.css';

type ShellCtx = {
  enFlujo: boolean;
  setFrecuencia: (f: number | null) => void;
  /** Vuelve el fondo al dial real de hoy (el que trajo el servidor). */
  restaurarSintonia: () => void;
  registrarFlujo: () => () => void;
  capaFija: HTMLElement | null;
};

const Ctx = createContext<ShellCtx>({
  enFlujo: false,
  setFrecuencia: () => {},
  restaurarSintonia: () => {},
  registrarFlujo: () => () => {},
  capaFija: null,
});

export function useEnFlujo() {
  return useContext(Ctx).enFlujo;
}

export function useSintonia() {
  return useContext(Ctx).setFrecuencia;
}

export function useRestaurarSintonia() {
  return useContext(Ctx).restaurarSintonia;
}

/** Mientras `activo` sea true, la pantalla cuenta como flujo de varios pasos (sin dock). */
export function useFlujoActivo(activo: boolean) {
  const { registrarFlujo } = useContext(Ctx);
  useEffect(() => (activo ? registrarFlujo() : undefined), [activo, registrarFlujo]);
}

/**
 * Todo lo que es position: fixed dentro de una pantalla (barra de pasos,
 * barra de progreso, overlays) se monta acá, FUERA del contenedor que se
 * anima. Un ancestro con transform o filter (la transición entre
 * pantallas, la cascada de entrada) convierte a un fixed en relativo a
 * ese ancestro: sin esta capa, la barra aparecía pegada al contenido y
 * recién al terminar la animación saltaba abajo.
 */
export function CapaFija({ children }: { children: React.ReactNode }) {
  const { capaFija } = useContext(Ctx);
  // El portal sigue dentro del árbol de React de la pantalla: cuando esa
  // pantalla está saliendo, lo fijo se desvanece con ella en vez de
  // quedar opaco y desaparecer de golpe.
  const presente = useIsPresent();
  if (!capaFija) return null;
  return createPortal(
    <div style={{ opacity: presente ? 1 : 0, transition: 'opacity 0.3s ease' }}>{children}</div>,
    capaFija
  );
}

/**
 * Congela el árbol de la ruta SOLO mientras sale: sin esto, en el App
 * Router el contenido viejo se reemplaza por el nuevo antes de que
 * AnimatePresence pueda animar la salida (por eso template.tsx solo podía
 * animar la entrada). Mientras la ruta está presente el contexto se sigue
 * actualizando — si se congelara siempre, router.refresh() y las server
 * actions con revalidatePath dejarían la pantalla con datos viejos.
 */
function RutaCongelada({ children }: { children: React.ReactNode }) {
  const contexto = useContext(LayoutRouterContext);
  const presente = useIsPresent();
  const ultimo = useRef(contexto);
  if (presente) ultimo.current = contexto;
  return <LayoutRouterContext.Provider value={ultimo.current}>{children}</LayoutRouterContext.Provider>;
}

const EASE = [0.16, 0.84, 0.28, 1] as const;

/**
 * Frecuencia es solo oscura. El toggle de tema de la plataforma deja
 * html.light puesto si el usuario lo eligió; acá se saca mientras se está
 * dentro y se restaura al salir, sin tocar la preferencia guardada.
 */
function useForzarOscuro() {
  useEffect(() => {
    const html = document.documentElement;
    const teniaClaro = html.classList.contains('light');
    if (teniaClaro) html.classList.remove('light');
    return () => {
      if (teniaClaro) html.classList.add('light');
    };
  }, []);
}

export function FrecuenciaShell({
  frecuenciaInicial,
  children,
}: {
  frecuenciaInicial: number | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reducido = useReducedMotion();
  const [frecuencia, setFrecuencia] = useState<number | null>(frecuenciaInicial);
  const [flujosManuales, setFlujosManuales] = useState(0);
  const [capaFija, setCapaFija] = useState<HTMLElement | null>(null);
  // Ruta que se está MOSTRANDO: con mode="wait" la pantalla nueva recién
  // monta cuando la vieja terminó de salir. Dock / barra fija se deciden
  // por esta ruta, no por la de destino — si no, el dock aparecía encima
  // de la pantalla de flujo que todavía se estaba yendo.
  const [rutaMostrada, setRutaMostrada] = useState(pathname);

  // Si el servidor trae un dial nuevo (revalidatePath después de guardar), se sigue.
  const frecuenciaDelServidor = useRef(frecuenciaInicial);
  useEffect(() => {
    frecuenciaDelServidor.current = frecuenciaInicial;
    setFrecuencia(frecuenciaInicial);
  }, [frecuenciaInicial]);
  const restaurarSintonia = useCallback(() => setFrecuencia(frecuenciaDelServidor.current), []);
  useForzarOscuro();

  const registrarFlujo = useCallback(() => {
    setFlujosManuales((n) => n + 1);
    return () => setFlujosManuales((n) => Math.max(0, n - 1));
  }, []);

  const enFlujo = esRutaDeFlujo(rutaMostrada) || flujosManuales > 0;
  const valor = useMemo(
    () => ({ enFlujo, setFrecuencia, restaurarSintonia, registrarFlujo, capaFija }),
    [enFlujo, restaurarSintonia, registrarFlujo, capaFija]
  );

  return (
    <Ctx.Provider value={valor}>
      {/* El shader se apaga donde algo más ocupa la GPU: EN EL AIRE (estudio
          3D a pantalla completa). */}
      <FondoVivo frecuencia={frecuencia} gradienteActivo={flujosManuales === 0} />

      <header className={s.header}>
        <Link href="/frecuencia" className={s.marca}>
          <span className={s.marcaOnda} aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={s.marcaNombre}>{copy.shell.nombreApp}</span>
        </Link>
        <Link href="/dashboard" className={s.salir}>
          <span className={s.salirLargo}>{copy.shell.salirAPlataforma}</span>
          <span className={s.salirCorto}>{copy.shell.salirCorto}</span>
          <span aria-hidden className={s.salirFlecha}>↗</span>
        </Link>
      </header>

      <div
        className={s.contenido}
        style={{ paddingBottom: enFlujo ? BARRA_CLEARANCE_CSS : DOCK_CLEARANCE_CSS }}
      >
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => setRutaMostrada(pathname)}>
          <motion.div
            key={pathname}
            initial={reducido ? false : { opacity: 0, y: 18, filter: 'blur(10px)' }}
            // transitionEnd: al terminar no queda ni transform ni filter en el
            // contenedor (un filter: blur(0px) residual seguiría creando un
            // containing block para los fixed de adentro).
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none', transform: 'none' } }}
            exit={reducido ? { opacity: 0 } : { opacity: 0, y: -10, filter: 'blur(8px)' }}
            transition={{ duration: reducido ? 0.15 : 0.42, ease: EASE }}
          >
            <RutaCongelada>{children}</RutaCongelada>
          </motion.div>
        </AnimatePresence>
      </div>

      <div ref={setCapaFija} />

      {!enFlujo && <Dock />}

      {/* Mismo aviso de notificaciones que en la plataforma, levantado
          por encima del dock. Montado una sola vez (si se desmontara al
          entrar a un flujo, reaparecería a los 3 s cada vez); en los
          flujos solo se oculta. */}
      <div className={enFlujo ? s.pushOculto : s.pushSobreDock}>
        <PushAutoPrompt />
      </div>
    </Ctx.Provider>
  );
}
