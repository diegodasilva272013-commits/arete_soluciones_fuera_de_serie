'use client';

import { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import s from './Problema.module.css';

const FRICCIONES = [
  {
    t: 'El mismo dato se carga tres veces',
    d: 'Porque los sistemas no se hablan entre ellos. Cada área tiene su propia versión de la verdad, y nadie sabe cuál es la real.',
  },
  {
    t: '"Eso lo maneja Sandra"',
    d: 'Si Sandra no está, el proceso se frena. El conocimiento vive en la cabeza de una persona, no en un sistema que cualquiera pueda operar.',
  },
  {
    t: 'Para saber cómo viene el mes hay que llamar a cinco personas',
    d: 'No existe un lugar único donde ver el estado real de la operación. La información está repartida y desactualizada apenas se junta.',
  },
  {
    t: 'El mismo error, en el mismo punto, semana tras semana',
    d: 'Sin sistema, no hay corrección: cada vez que algo falla se resuelve una vez y se vuelve a romper la semana siguiente.',
  },
];

export function Problema() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        });
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className={s.section}>
      <div className={s.list}>
        {FRICCIONES.map((f, i) => {
          const isActive = active === i;
          return (
            <div
              key={f.t}
              ref={(el) => { itemRefs.current[i] = el; }}
              data-index={i}
              data-active={isActive}
              className={s.item}
            >
              <span className={s.light} aria-hidden="true" />
              <h3 className={s.headline}>{f.t}</h3>
              <AnimatePresence initial={false}>
                {isActive && (
                  <m.div
                    className={s.explain}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <p className={s.explainInner}>{f.d}</p>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
