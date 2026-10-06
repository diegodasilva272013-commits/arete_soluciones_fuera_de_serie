'use client';

/**
 * La intro: una pantalla por idea, con transición entre una y otra. De
 * fondo, el Dial moviéndose solo de Escasez FM a Abundancia FM, y todo el
 * fondo vivo de la app sintonizando con la aguja: se entiende la idea de
 * las dos radios antes de leer una palabra. La última pantalla tiene el
 * botón (intro[2].cta) que lleva al paso 1.
 */

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import { DialAutomatico } from '../_dial-automatico';
import { BarraPasos } from '../../_barra-pasos';
import type { PantallaCopy } from '@/types/frecuencia';

export function Intro({ pantallas, empezarAlFinal = false }: { pantallas: PantallaCopy[]; empezarAlFinal?: boolean }) {
  const reducido = useReducedMotion();
  const [indice, setIndice] = useState(empezarAlFinal ? pantallas.length - 1 : 0);
  const actual = pantallas[indice];
  const esUltima = indice === pantallas.length - 1;

  return (
    <>
      <div className={s.pantalla}>
        <div className={s.cabecera}>
          <span className={`${base.kickerLine} ${base.on}`} />
          <span className={s.introContador}>{copy.onboarding.introDe(indice + 1, pantallas.length)}</span>
        </div>
        <div className={s.segmentos} aria-hidden>
          {pantallas.map((_, i) => (
            <i key={i} className={i <= indice ? s.segmentoOn : undefined} />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={indice}
            className={s.cuerpo}
            initial={reducido ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reducido ? { opacity: 0 } : { opacity: 0, y: -16, filter: 'blur(6px)' }}
            transition={{ duration: 0.5, ease: [0.16, 0.84, 0.28, 1] }}
          >
            <h1 className={`${s.gancho} ${s.etapa}`}>{actual.gancho}</h1>
            {actual.razon && <p className={`${s.razon} ${s.etapa}`}>{actual.razon}</p>}
          </motion.div>
        </AnimatePresence>

        <div className={s.introDial}>
          <DialAutomatico modo="barrido" moverFondo />
        </div>
      </div>

      <BarraPasos>
        {indice > 0 && (
          <button type="button" className={base.btnSec} onClick={() => setIndice((i) => i - 1)}>
            {copy.botones.atras}
          </button>
        )}
        {esUltima ? (
          <Link href="/frecuencia/onboarding/dial" className={base.btn}>
            {actual.cta ?? copy.botones.empezar}
          </Link>
        ) : (
          <button type="button" className={base.btn} onClick={() => setIndice((i) => i + 1)}>
            {actual.cta ?? copy.botones.siguiente}
          </button>
        )}
      </BarraPasos>
    </>
  );
}
