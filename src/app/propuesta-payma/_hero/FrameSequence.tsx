'use client';

import { useEffect, useRef, useState } from 'react';

// Hero de /propuesta-payma: secuencia de cuadros fotorrealistas dibujada en un
// <canvas> 2D según el progreso del scroll (misma técnica que usa Apple).
// Todo lo del recorrido (cantidad de cuadros, tamaños, rutas) sale de
// public/propuesta-payma/frames/manifest.json, generado por
// scripts/payma-frames.mjs. Acá no hay datos del recorrido.

type Manifest = {
  count: number;
  patron: string;
  juegos: Record<string, { ancho: number; alto: number; bytes: number }>;
};

const BASE = '/propuesta-payma/frames';

function frameUrl(juego: string, patron: string, i: number) {
  // patron del estilo "f_%04d.webp"; i es 0-based
  const n = String(i + 1);
  const name = patron.replace(/%0(\d)d/, (_, w) => n.padStart(Number(w), '0'));
  return `${BASE}/${juego}/${name}`;
}

export function FrameSequence({
  progressRef,
  mobile,
  staticProgress,
}: {
  progressRef: React.MutableRefObject<number>;
  mobile: boolean;
  /** Si viene, se dibuja un único cuadro fijo (prefers-reduced-motion). */
  staticProgress?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loadedPct, setLoadedPct] = useState(0);
  const [ready, setReady] = useState(false);

  // 1. Manifest
  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/manifest.json`)
      .then((r) => r.json())
      .then((m: Manifest) => { if (!cancelled) setManifest(m); })
      .catch(() => { /* sin manifest: queda el fondo negro con el overlay */ });
    return () => { cancelled = true; };
  }, []);

  // 2. Carga progresiva: 1er cuadro → 1 de cada 8 → 1 de cada 4 → el resto.
  useEffect(() => {
    if (!manifest) return;
    const juego = mobile && manifest.juegos.mobile ? 'mobile' : 'desktop';
    const total = manifest.count;
    imagesRef.current = new Array(total).fill(null);

    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => { if (i >= 0 && i < total && !seen.has(i)) { seen.add(i); order.push(i); } };
    push(0);
    if (staticProgress !== undefined) {
      push(Math.round(staticProgress * (total - 1)));
    } else {
      for (let i = 0; i < total; i += 8) push(i);
      push(total - 1);
      const firstPass = order.length;
      for (let i = 0; i < total; i += 4) push(i);
      for (let i = 0; i < total; i++) push(i);
      let firstPassDone = 0;
      let cancelled = false;
      let cursor = 0;
      const CONCURRENCY = 6;
      const next = () => {
        if (cancelled || cursor >= order.length) return;
        const idx = order[cursor];
        const isFirstPass = cursor < firstPass;
        cursor++;
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => {
          if (cancelled) return;
          if (img.naturalWidth) imagesRef.current[idx] = img;
          if (isFirstPass) {
            firstPassDone++;
            setLoadedPct(Math.round((firstPassDone / firstPass) * 100));
            if (firstPassDone === firstPass) setReady(true);
          }
          next();
        };
        img.src = frameUrl(juego, manifest.patron, idx);
      };
      for (let k = 0; k < CONCURRENCY; k++) next();
      return () => { cancelled = true; };
    }

    // Modo estático: solo los cuadros necesarios.
    let cancelled = false;
    order.forEach((idx) => {
      const img = new Image();
      img.onload = () => { if (!cancelled) { imagesRef.current[idx] = img; setReady(true); } };
      img.src = frameUrl(juego, manifest.patron, idx);
    });
    return () => { cancelled = true; };
  }, [manifest, mobile, staticProgress]);

  // 3. Dibujo: solo cuando cambia el índice o el tamaño.
  useEffect(() => {
    if (!manifest) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let lastDrawn = -1;
    let lastW = 0;
    let lastH = 0;

    const nearestLoaded = (target: number) => {
      const imgs = imagesRef.current;
      if (imgs[target]) return target;
      for (let d = 1; d < imgs.length; d++) {
        if (imgs[target - d]) return target - d;
        if (imgs[target + d]) return target + d;
      }
      return -1;
    };

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      const sizeChanged = w !== lastW || h !== lastH;
      if (sizeChanged) { canvas.width = w; canvas.height = h; lastW = w; lastH = h; }

      const p = staticProgress ?? progressRef.current;
      // Fundido hacia la propuesta al final del recorrido (0.94 → 1). Tope en
      // 0.6 (no a negro puro): al soltarse el pin, esta última imagen queda
      // congelada y tarda ~1 pantalla en salir de vista mientras el usuario
      // sigue scrolleando — si llegaba a negro total (#050505, igual al fondo
      // de la página) esa pantalla se veía vacía/rota. Oscurecida pero
      // reconocible, se lee como una transición intencional, no como un hueco.
      const FADE_MAX = 0.6;
      if (fadeRef.current) fadeRef.current.style.opacity = String(FADE_MAX * Math.max(0, Math.min(1, (p - 0.94) / 0.06)));
      const target = Math.round(Math.max(0, Math.min(1, p)) * (manifest.count - 1));
      const idx = nearestLoaded(target);
      if (idx >= 0 && (idx !== lastDrawn || sizeChanged)) {
        const img = imagesRef.current[idx]!;
        // cover
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        lastDrawn = idx;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [manifest, progressRef, staticProgress]);

  const showLoader = staticProgress === undefined && !ready;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} aria-hidden="true" />
      {/* Terminación: viñeta + grano muy leve */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,5,5,0.35) 100%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.05, mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
      <div ref={fadeRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#050505', opacity: 0 }} />
      {showLoader && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <p style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#2F7BF6', margin: 0 }}>Areté Soluciones</p>
          <p style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 32, color: '#F2EFE9', margin: 0 }}>{loadedPct}%</p>
        </div>
      )}
    </div>
  );
}
