'use client';

import { Spotlight } from '@/components/ui/spotlight';
import { SplineScene } from '@/components/ui/splite';
import { Countdown } from './_countdown';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

export function Hero() {
  return (
    <section className={s.heroWrap}>
      {/* Spotlight — sigue el cursor */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        size={420}
      />

      {/* Glow ambiental azul */}
      <div className={s.heroGlow} />

      {/* Split layout */}
      <div className={s.heroSplit}>
        {/* ── Columna izquierda: texto ── */}
        <div className={s.heroLeft}>
          <div className={`${c.kicker} ${c.revealOn}`}>
            <span className={c.kickerLine} style={{ transform: 'scaleX(1)' }} />
            <span className={c.kickerLabel}>Areté — Reclutamiento</span>
          </div>

          <h1 className={c.heroTitle}>
            ¿Podés<br />
            <em>sostener</em><br />
            el proceso?
          </h1>

          <p className={c.heroSub}>
            Buscamos setters y cold callers que ejecuten todos los días, sin excusas.
            Compromiso real — no un currículum perfecto.
          </p>

          <div className={c.homeActs}>
            <a href="#postularme" className={c.btn}>
              Postularme
              <svg className={c.btnIcon} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div style={{ marginTop: '48px' }}>
            <Countdown />
          </div>
        </div>

        {/* ── Columna derecha: escena 3D Spline ── */}
        <div className={s.heroRight}>
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className={s.splineCanvas}
          />
        </div>
      </div>
    </section>
  );
}
