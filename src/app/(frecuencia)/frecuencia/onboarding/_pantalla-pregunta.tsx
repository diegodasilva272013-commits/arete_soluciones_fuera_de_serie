'use client';

/**
 * Una pantalla del onboarding = una idea, a pantalla completa. Estructura
 * fija, leída de onboarding_copy (todos los campos son opcionales menos
 * gancho: si no vienen, ese bloque no se renderiza):
 *
 *   kicker   → eyebrow mono con línea que se dibuja + "Paso n de 7"
 *   gancho   → título grande (Montserrat)
 *   razon    → bajada en Spectral itálica, hueso legible (≥ 0.75)
 *   pregunta → texto claro arriba del campo
 *   [campo]  → children (LineaTransmision, chips, Dial, Ecualizador…)
 *   ejemplo  → debajo del campo, gris, con "Por ejemplo:"
 *   ayuda    → nota chica (ayuda / sin_saber)
 *
 * Detrás, el número del paso gigante en contorno (la "frecuencia" de esa
 * pantalla). Cada pregunta entra en cascada; al pasar de una pregunta a
 * otra dentro del mismo paso hay transición propia (AnimatePresence).
 */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { copy } from '../_copy';
import { CapaFija } from '../_shell';
import base from '../frecuencia.module.css';
import s from './_onboarding.module.css';

type Props = {
  claveAnimacion: string;
  kicker?: string;
  gancho: string;
  razon?: string;
  pregunta?: string;
  ejemplo?: string;
  notas?: (string | undefined)[];
  paso?: { actual: number; total: number };
  subPaso?: { actual: number; total: number };
  /** Número grande de fondo (p. ej. "02"). */
  marca?: string;
  children?: React.ReactNode;
};

export function PantallaPregunta({ claveAnimacion, kicker, gancho, razon, pregunta, ejemplo, notas, paso, subPaso, marca, children }: Props) {
  const reducido = useReducedMotion();
  const notasVisibles = (notas ?? []).filter((n): n is string => !!n);

  return (
    <div className={s.pantalla}>
      {paso && (
        <CapaFija>
          <div className={base.progresoWrap}>
            <div className={base.progresoBarra} style={{ width: `${(paso.actual / paso.total) * 100}%` }} />
          </div>
        </CapaFija>
      )}

      {marca && (
        <span className={s.marca} aria-hidden>
          {marca}
        </span>
      )}

      <div className={s.cabecera}>
        <span className={`${base.kickerLine} ${base.on}`} />
        {kicker && <span className={base.kickerLabel}>{kicker}</span>}
        {paso && <span className={base.kickerPaso}>{copy.onboarding.pasoDe(paso.actual, paso.total)}</span>}
      </div>

      {subPaso && subPaso.total > 1 && (
        <div className={s.segmentos} role="img" aria-label={copy.onboarding.preguntaDe(subPaso.actual, subPaso.total)}>
          {Array.from({ length: subPaso.total }, (_, i) => (
            <i key={i} className={i < subPaso.actual ? s.segmentoOn : undefined} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={claveAnimacion}
          className={s.cuerpo}
          initial={reducido ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducido ? { opacity: 0 } : { opacity: 0, x: -28, transition: { duration: 0.22, ease: [0.7, 0, 0.84, 0] } }}
          transition={{ duration: 0.38, ease: [0.16, 0.84, 0.28, 1] }}
        >
          <h1 className={`${s.gancho} ${s.etapa}`}>{gancho}</h1>
          {razon && <p className={`${s.razon} ${s.etapa}`}>{razon}</p>}

          {(pregunta || children) && (
            <div className={`${s.bloqueCampo} ${s.etapa}`}>
              {pregunta && <p className={s.pregunta}>{pregunta}</p>}
              {children}
            </div>
          )}

          {ejemplo && (
            <p className={`${s.ejemplo} ${s.etapa}`}>
              <span className={s.ejemploEtiqueta}>{copy.onboarding.porEjemplo}</span> {ejemplo}
            </p>
          )}

          {notasVisibles.map((n) => (
            <p key={n} className={`${s.nota} ${s.etapa}`}>
              {n}
            </p>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
