'use client';

import { useEffect, useRef } from 'react';

type Etapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; etapas: Etapa[] };

export function HeroOverlay({
  hero, progressRef, active, showScrollHint = true,
}: {
  hero: HeroContent; progressRef: React.MutableRefObject<number>; active: boolean; showScrollHint?: boolean;
}) {
  const introRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Los textos entran/salen con fade según `progress`, leído directo del ref
  // en un loop propio — no dispara setState en cada frame (mismo criterio
  // que la escena 3D).
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const loop = () => {
      const p = progressRef.current;
      if (introRef.current) {
        const introOpacity = 1 - Math.min(1, p / 0.06);
        introRef.current.style.opacity = String(introOpacity);
      }
      hero.etapas.forEach((etapa, i) => {
        const el = stageRefs.current[i];
        if (!el) return;
        if (!etapa.kicker && !etapa.titulo && !etapa.texto) { el.style.opacity = '0'; return; }
        const span = etapa.hasta - etapa.desde;
        const fadeIn = etapa.desde + span * 0.15;
        const fadeOutStart = etapa.hasta - span * 0.2;
        let o = 0;
        if (p < etapa.desde || p > etapa.hasta) o = 0;
        else if (p < fadeIn) o = (p - etapa.desde) / (fadeIn - etapa.desde);
        else if (p > fadeOutStart) o = 1 - (p - fadeOutStart) / (etapa.hasta - fadeOutStart);
        else o = 1;
        el.style.opacity = String(Math.max(0, Math.min(1, o)));
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, hero, progressRef]);

  const textStyle: React.CSSProperties = {
    position: 'absolute', left: 0, right: 0, bottom: '14%',
    textAlign: 'center', padding: '0 20px',
    pointerEvents: 'none',
  };
  const scrimStyle: React.CSSProperties = {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(5,5,5,0.65) 0%, transparent 45%)',
    pointerEvents: 'none',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={scrimStyle} />

      {/* Pantalla inicial: marca + bajada + indicación de scroll */}
      <div ref={introRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
        <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#2F7BF6', marginBottom: 14 }}>
          {hero.marca}
        </span>
        <h1 style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,5vw,52px)', color: '#F2EFE9', margin: '0 0 18px', letterSpacing: '-0.02em' }}>
          {hero.bajada}
        </h1>
        {showScrollHint && (
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A8A8A' }}>
            ↓ {hero.indicacion_scroll}
          </span>
        )}
      </div>

      {/* Textos por etapa */}
      {hero.etapas.map((etapa, i) => (
        <div key={i} ref={(el) => { stageRefs.current[i] = el; }} style={{ ...textStyle, opacity: 0 }}>
          {etapa.kicker && (
            <span style={{ display: 'block', fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#2F7BF6', marginBottom: 10 }}>
              {etapa.kicker}
            </span>
          )}
          {etapa.titulo && (
            <h2 style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 'clamp(22px,3.4vw,36px)', color: '#F2EFE9', margin: '0 0 10px' }}>
              {etapa.titulo}
            </h2>
          )}
          {etapa.texto && (
            <p style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 15, color: 'rgba(242,239,233,0.85)', margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              {etapa.texto}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
