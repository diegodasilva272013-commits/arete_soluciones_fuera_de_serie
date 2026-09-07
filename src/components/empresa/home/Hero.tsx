'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import s from './Hero.module.css';
import corp from '../../../app/empresa/corp.module.css';
import { MaskTitle } from '../MaskTitle';
import { MediaFrame } from '../MediaFrame';

export function Hero() {
  const mediaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 1.06 },
        { scale: 1, duration: 1.4, ease: 'cubic-bezier(0.16, 1, 0.30, 1)' },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className={s.hero}>
      <div className={s.textCol}>
        <MaskTitle
          as="h1"
          trigger="load"
          className={s.title}
          lines={[
            'La fricción no está',
            'en las herramientas.',
            <em key="pull">Está entre ellas.</em>,
          ]}
        />
        <p className={s.lead}>
          Una empresa puede tener veinte sistemas y un equipo completo, y seguir funcionando mal.
          Entramos, entendemos cómo trabaja de verdad, y recién después construimos.
        </p>
        <div className={s.acts}>
          <a href="#dos-frentes" className={corp.btn}>
            Ver cómo trabajamos
          </a>
          <a href="/empresa/metodologia" className={s.secondary}>
            El método
          </a>
        </div>

        <div className={s.scrollCue} aria-hidden="true">
          <span className={s.scrollLabel}>Scroll</span>
          <span className={s.scrollLine} />
        </div>
      </div>

      <div className={s.mediaCol}>
        <div ref={mediaRef} className={s.mediaColInner}>
          <MediaFrame
            aspect="full"
            light="left"
            bevel={false}
            className={s.mediaColInner}
            videoSrc="/video_hero.mp4"
            poster="/video_hero-poster.jpg"
          />
        </div>
      </div>
    </section>
  );
}
