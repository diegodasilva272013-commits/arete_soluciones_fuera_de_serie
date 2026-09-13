'use client';

import { Spotlight } from '@/components/ui/spotlight';
import { SplineScene } from '@/components/ui/splite';
import { Countdown } from './_countdown';
import s from './recl.module.css';

export function Hero() {
  return (
    <section className={s.heroWrap}>
      {/* Spotlight — sigue el cursor */}
      <Spotlight size={480} />

      {/* Glow ambiental azul */}
      <div className={s.heroGlow} />

      {/* Split layout */}
      <div className={s.heroSplit}>

        {/* ── Columna izquierda: texto ── */}
        <div className={s.heroLeft}>

          {/* Kicker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
            <span style={{ width: '34px', height: '1px', background: '#2F7BF6', flexShrink: 0 }} />
            <span style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#5C9AFF',
            }}>
              Areté — Reclutamiento
            </span>
          </div>

          {/* Título */}
          <h1 style={{
            margin: '0 0 28px',
            fontFamily: "'Montserrat', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(38px, 5.5vw, 68px)',
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            color: '#F2EFE9',
            maxWidth: '640px',
          }}>
            ¿Podés<br />
            <em style={{ fontStyle: 'normal', color: '#2F7BF6' }}>sostener</em><br />
            el proceso?
          </h1>

          {/* Subtítulo */}
          <p style={{
            margin: '0 0 44px',
            fontFamily: "'Spectral', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 'clamp(17px, 2vw, 21px)',
            fontWeight: 300,
            lineHeight: 1.65,
            color: 'rgba(242,239,233,.55)',
            maxWidth: '52ch',
          }}>
            Buscamos setters y cold callers que ejecuten todos los días, sin excusas.
            Compromiso real — no un currículum perfecto.
          </p>

          {/* CTA */}
          <div>
            <a
              href="#postularme"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                background: '#2969D1',
                color: '#F2EFE9',
                fontFamily: "'Montserrat', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2259B2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#2969D1')}
            >
              Postularme
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Countdown */}
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
