'use client';

import { useEffect, useRef } from 'react';

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

    // 2. Ocultar el badge "Built with Spline" via shadow DOM.
    //    Se reintenta cada 300 ms hasta que el shadow root esté disponible.
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
          a[target="_blank"] {
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

  // Sin cover div — evita el cuadrado negro visible en mobile.
  // El badge se oculta únicamente via shadow DOM (arriba).
  return (
    // @ts-ignore — custom element ref
    <spline-viewer
      ref={viewerRef}
      url={scene}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
