'use client';

import { useEffect, useState, type CSSProperties } from 'react';

/** Igual que el <video autoPlay loop> de siempre, pero respeta
 *  "reducir movimiento": en ese caso no hace autoplay ni loop y
 *  muestra controles reales en vez de reproducir solo. */
export function AutoplayVideo({
  src,
  style,
}: {
  src: string;
  style?: CSSProperties;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <video
      autoPlay={!prefersReducedMotion}
      muted
      loop={!prefersReducedMotion}
      playsInline
      controls={prefersReducedMotion}
      style={style}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
