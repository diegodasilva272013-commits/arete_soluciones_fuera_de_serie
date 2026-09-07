'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './Metodo.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ETAPAS = [
  { n: '01', title: 'Inmersión', line: 'Entender la empresa desde adentro, con dirección y con quien ejecuta.' },
  { n: '02', title: 'Auditoría', line: 'Mapear la operación real: fricciones, duplicaciones, dependencias.' },
  { n: '03', title: 'Priorización', line: 'El 20% de problemas que genera el 80% de la pérdida.' },
  { n: '04', title: 'Arquitectura', line: 'Diseñar cómo debería funcionar. Recién ahí se elige tecnología.' },
  { n: '05', title: 'Implementación', line: 'Construir por prioridad de impacto, no todo junto.' },
  { n: '06', title: 'Evolución', line: 'Medir, observar, ajustar. Una empresa no es estática.' },
];

export function Metodo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const lightBarRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinEnabled, setPinEnabled] = useState(false);

  useLayoutEffect(() => {
    const desktop = window.innerWidth >= 1024;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPinEnabled(desktop && !reduce);
    if (!desktop || reduce || !wrapperRef.current || !pinnedRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinnedRef.current,
        scrub: true,
        onUpdate(self) {
          const idx = Math.min(ETAPAS.length - 1, Math.floor(self.progress * ETAPAS.length));
          setActive(idx);
          if (lightBarRef.current) {
            lightBarRef.current.style.transform = `translateY(${self.progress * (ETAPAS.length - 1) * 100}%)`;
          }
        },
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className={s.wrapper} data-pinned={pinEnabled}>
      <div ref={pinnedRef} className={s.pinned}>
        <div className={s.left}>
          <div ref={lightBarRef} className={s.lightBar} aria-hidden="true" />
          <div className={s.numberStack} aria-hidden="true">
            {ETAPAS.map((e, i) => (
              <span key={e.n} className={s.number} data-active={active === i}>
                {e.n}
              </span>
            ))}
          </div>
        </div>
        <div className={s.right}>
          {ETAPAS.map((e, i) => (
            <div key={e.n} className={s.etapa} data-active={active === i}>
              <h3 className={s.etapaTitle}>{e.title}</h3>
              <p className={s.etapaLine}>{e.line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* <1024px: sin pin, seis bloques apilados */}
      <div className={s.stacked}>
        {ETAPAS.map((e) => (
          <div key={e.n} className={s.stackItem}>
            <span className={s.stackNumber}>{e.n}</span>
            <div>
              <h3 className={s.stackTitle}>{e.title}</h3>
              <p className={s.stackLine}>{e.line}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
