'use client';

import { useEffect, useRef } from 'react';

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
  const viewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 1. Cargar el script si aún no está
    if (!customElements.get('spline-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://unpkg.com/@splinetool/viewer@2.0.46/build/spline-viewer.js';
      document.head.appendChild(s);
    }

    // 2. Ocultar el badge "Built with Spline" inyectando CSS en el shadow root.
    //    Se reintenta cada 300 ms hasta que el shadow root esté disponible (máx 8 s).
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      const el = viewerRef.current;
      if (el?.shadowRoot) {
        const style = document.createElement('style');
        style.textContent = `
          #logo,
          .logo,
          [class*="logo"],
          [id*="logo"],
          a[href*="spline"],
          div[style*="position: absolute"][style*="bottom"] a {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `;
        el.shadowRoot.appendChild(style);
        clearInterval(timer);
      }
      if (attempts > 26) clearInterval(timer); // abandona a los ~8 s
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* @ts-ignore — custom element */}
      <spline-viewer
        ref={viewerRef}
        url={scene}
        className={className}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Tapa de respaldo: cubre el rincón donde aparece el badge */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 180,
          height: 56,
          background: '#050505',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
}
