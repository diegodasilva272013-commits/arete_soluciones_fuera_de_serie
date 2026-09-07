'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from './Track.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type Etapa = {
  n: string;
  title: string;
  duration: string;
  body: string;
  pull: string;
  items: string[];
};

/**
 * Track horizontal pineado — el recurso de /metodologia, distinto al pin
 * vertical de /empresa (ese ya se gastó en el home). Una fuente de luz fija
 * en el centro del viewport (mix-blend-mode: screen) ilumina el panel que
 * pasa por debajo; la luz no se mueve, se mueve la escena.
 */
export function Track({ etapas }: { etapas: Etapa[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pinEnabled, setPinEnabled] = useState(false);

  useLayoutEffect(() => {
    const desktop = window.innerWidth >= 1024;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPinEnabled(desktop && !reduce);
    if (!desktop || reduce || !wrapperRef.current || !pinnedRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinnedRef.current,
        scrub: true,
        onUpdate(self) {
          gsap.set(track, { x: -getDistance() * self.progress });
        },
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className={s.wrapper} data-pinned={pinEnabled}>
      <div ref={pinnedRef} className={s.pinned}>
        <span className={s.fixedLight} aria-hidden="true" />
        <div ref={trackRef} className={s.track}>
          {etapas.map((e) => (
            <Panel key={e.n} e={e} />
          ))}
        </div>
      </div>

      <div className={s.stacked}>
        {etapas.map((e) => (
          <Panel key={e.n} e={e} />
        ))}
      </div>
    </div>
  );
}

function Panel({ e }: { e: Etapa }) {
  return (
    <div className={s.panel}>
      <span className={s.number} aria-hidden="true">{e.n}</span>
      <h3 className={s.title}>{e.title}</h3>
      <span className={s.duration}>{e.duration}</span>
      <p className={s.body}>{e.body}</p>
      <p className={s.pull}>{e.pull}</p>
      <ul className={s.items}>
        {e.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
