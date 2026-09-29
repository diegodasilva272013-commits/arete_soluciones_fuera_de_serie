'use client';

import { useEffect, useRef, useState } from 'react';
import { FrameSequence } from './FrameSequence';
import { HeroOverlay } from './HeroOverlay';
import { useScrollProgress } from './useScrollProgress';

type Etapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = {
  marca: string;
  bajada: string;
  indicacion_scroll: string;
  etapas: Etapa[];
  /** Punto del recorrido (0..1) que se muestra fijo con prefers-reduced-motion. */
  cuadro_estatico?: number;
  /** Largo del recorrido en vh de scroll. */
  recorrido_vh?: number;
};

export function HeroSection({ hero }: { hero: HeroContent }) {
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const [caps, setCaps] = useState<{ reducedMotion: boolean; mobile: boolean } | null>(null);

  useEffect(() => {
    setCaps({
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      mobile: window.innerWidth <= 768,
    });
  }, []);

  const disabled = !caps || caps.reducedMotion;
  const progressRef = useScrollProgress(pinTargetRef, disabled, hero.recorrido_vh ?? 600);
  const staticProgress = hero.cuadro_estatico ?? 0.4;
  const staticProgressRef = useRef(staticProgress);

  return (
    <div ref={pinTargetRef} style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', background: '#050505' }}>
      {caps && (
        <FrameSequence
          progressRef={progressRef}
          mobile={caps.mobile}
          staticProgress={caps.reducedMotion ? staticProgress : undefined}
        />
      )}
      <HeroOverlay
        hero={hero}
        progressRef={caps?.reducedMotion ? staticProgressRef : progressRef}
        active={!disabled}
        showScrollHint={!caps?.reducedMotion}
      />
    </div>
  );
}
