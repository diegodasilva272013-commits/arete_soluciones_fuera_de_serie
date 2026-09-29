'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

// Video con audio propio (no un loop de fondo, un video con intención de
// verse) con botón de sonido y de pantalla completa. Versión genérica de
// "ProvidusLogoVideo" de la propuesta de Providus.
export function LogoVideo({ src, poster, rounded = true }: { src: string; poster?: string; rounded?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [isFull, setIsFull] = useState(false);

  const toggleSonido = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: rounded ? 18 : 0, border: rounded ? '1px solid var(--linea)' : 'none', background: '#050505' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster={poster}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.45) 0%, transparent 35%)', pointerEvents: 'none' }} />
      {/* Dos botones chicos, del mismo tamaño y estilo, juntos en la misma
          esquina — antes eran una píldora grande con texto (sonido) más un
          círculo suelto (pantalla completa) en la esquina opuesta, y en
          videos chicos (ej. la card del agente) quedaba desprolijo. */}
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={toggleSonido}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 999, flexShrink: 0,
            background: muted ? 'rgba(47,123,246,0.85)' : 'rgba(5,5,5,0.6)',
            border: `1px solid ${muted ? 'rgba(47,123,246,1)' : 'rgba(255,255,255,0.2)'}`,
            color: '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
        >
          {muted ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button
          onClick={toggleFullscreen}
          aria-label={isFull ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 999, flexShrink: 0,
            background: 'rgba(5,5,5,0.6)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)',
            transition: 'all 0.2s',
          }}
        >
          {isFull ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>
    </div>
  );
}
