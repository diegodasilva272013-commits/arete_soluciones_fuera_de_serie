'use client';

import { useEffect, useState } from 'react';
import { Spotlight } from '@/components/ui/spotlight';
import { SplineScene } from '@/components/ui/splite';
import { Countdown } from './_countdown';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

export function Hero() {
  // Spotlight solo en dispositivos con cursor preciso (mouse).
  // En touch (pointer:coarse), el mouseenter al tocar muestra el glow dorado
  // como una bola visible — lo ocultamos en esos dispositivos.
  const [hasCursor, setHasCursor] = useState(false);
  useEffect(() => {
    setHasCursor(!window.matchMedia('(pointer: coarse)').matches);
  }, []);

  return (
    <section className={s.heroWrap}>
      {hasCursor && <Spotlight size={480} />}
      <div className={s.heroGlow} />

      <div className={s.heroSplit}>

        {/* ── Texto ── */}
        <div className={s.heroLeft}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
            <span style={{ width: '34px', height: '1px', background: '#2F7BF6', flexShrink: 0 }} />
            <span style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: '10px', fontWeight: 500,
              letterSpacing: '0.32em', textTransform: 'uppercase',
              color: '#5C9AFF',
            }}>
              Areté — Reclutamiento
            </span>
          </div>

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

          {/* Botón igual a la web principal */}
          <a href="#postularme" className={c.btn}>
            Postularme
            <svg className={c.btnIcon} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <div style={{ marginTop: '52px' }}>
            <Countdown />
          </div>
        </div>

        {/* ── Spline 3D ── */}
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
