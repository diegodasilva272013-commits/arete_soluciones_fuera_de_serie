'use client';

import { useEffect } from 'react';

// @splinetool/viewer como web component — carga via CDN en el browser,
// no pasa por webpack ni tiene problemas de WASM en el build.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { url?: string },
        HTMLElement
      >;
    }
  }
}

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  useEffect(() => {
    if (customElements.get('spline-viewer')) return;
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@splinetool/viewer@2.0.46/build/spline-viewer.js';
    document.head.appendChild(s);
  }, []);

  return (
    <spline-viewer
      url={scene}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
