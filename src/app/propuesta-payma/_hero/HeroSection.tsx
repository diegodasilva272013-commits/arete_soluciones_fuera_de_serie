'use client';

import { useEffect, useRef, useState } from 'react';
import { Hero3D } from './Hero3D';
import { HeroOverlay } from './HeroOverlay';
import { useScrollProgress } from './useScrollProgress';

type Etapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; etapas: Etapa[] };

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export function HeroSection({ hero }: { hero: HeroContent }) {
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const [caps, setCaps] = useState<{ webgl: boolean; reducedMotion: boolean; mobile: boolean } | null>(null);

  useEffect(() => {
    setCaps({
      webgl: supportsWebGL(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      mobile: window.innerWidth <= 768,
    });
  }, []);

  const disabled = !caps || !caps.webgl || caps.reducedMotion;
  const progressRef = useScrollProgress(pinTargetRef, disabled);

  // Fallback estático: la escena existe pero congelada en un punto fijo
  // (living con lámparas prendidas), sin pin y sin recorrido.
  const staticProgressRef = useRef(0.33);

  return (
    <div ref={pinTargetRef} style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', background: '#050505' }}>
      {caps?.webgl && (
        <Hero3D
          progressRef={caps.reducedMotion ? staticProgressRef : progressRef}
          mobile={caps.mobile}
          dpr={caps.mobile ? [1, 1.5] : [1, 2]}
          static={caps.reducedMotion}
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
