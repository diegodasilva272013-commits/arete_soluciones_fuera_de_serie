'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function HomePage() {

  useEffect(() => {
    const v1 = document.getElementById('hero-v1') as HTMLVideoElement | null;
    const v2 = document.getElementById('hero-v2') as HTMLVideoElement | null;
    if (!v1 || !v2) return;

    // Forzar muted nativo (fix autoplay iOS/Android)
    v1.muted = true; v1.volume = 0;
    v2.muted = true; v2.volume = 0;

    // Crossfade: v1 → v2 → v1 → ...
    function playV1() {
      v2!.style.opacity = '0';
      v1!.style.opacity = '1';
      v1!.currentTime = 0;
      v1!.play().catch(() => {});
    }
    function playV2() {
      v1!.style.opacity = '0';
      v2!.style.opacity = '1';
      v2!.currentTime = 0;
      v2!.play().catch(() => {});
    }

    v1.addEventListener('ended', playV2);
    v2.addEventListener('ended', playV1);

    // Arrancar
    v1.play().catch(() => {});

    return () => {
      v1.removeEventListener('ended', playV2);
      v2.removeEventListener('ended', playV1);
    };
  }, []);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════════════
          HERO — video fullscreen + logo encima
      ═══════════════════════════════════════════ */}
      <section style={{ position: 'relative', width: '100%', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>

        {/* Videos de fondo — dangerouslySetInnerHTML garantiza muted nativo en HTML */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: `
            <video id="hero-v1" src="/video_1.mp4" autoplay muted playsinline preload="auto"
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;transition:opacity 1.2s ease;"></video>
            <video id="hero-v2" src="/video_2.mp4" muted playsinline preload="auto"
              style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;"></video>
          ` }}
        />

        </div>
        {/* Overlay multicapa encima de los videos */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,5,0.5) 0%, rgba(5,5,5,0.15) 40%, rgba(5,5,5,0.35) 70%, rgba(5,5,5,0.88) 100%)', pointerEvents: 'none', zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 25%, rgba(5,5,5,0.65) 100%)', pointerEvents: 'none', zIndex: 2 }} />

        {/* NAV flotante */}
        <header style={{ position: 'relative', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px 32px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrandLogo size="md" priority />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Areté Soluciones</p>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a6fff' }}>Fuera de Serie</p>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" style={{ padding: '9px 22px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.04)' }}>
              Iniciar sesión
            </Link>
            <Link href="/register" style={{ padding: '9px 22px', borderRadius: '999px', background: '#1a6fff', fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 24px rgba(26,111,255,0.45)' }}>
              Crear cuenta
            </Link>
          </nav>
        </header>

        {/* Contenido centrado — logo + CTAs */}
        <div style={{ position: 'relative', zIndex: 30, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px 80px' }}>

          {/* Logo grande — mix-blend-mode:screen elimina el fondo negro del PNG */}
          <div style={{ marginBottom: '28px', filter: 'drop-shadow(0 0 60px rgba(26,111,255,0.4))' }}>
            <Image
              src="/Aretea_fuera _de_serie_logo.png"
              alt="Areté Soluciones — Fuera de Serie"
              width={360}
              height={360}
              priority
              style={{ width: 'min(360px, 68vw)', height: 'auto', display: 'block', mixBlendMode: 'screen' }}
            />
          </div>

          {/* Bajada */}
          <p style={{ margin: '0 0 36px', fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 400, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em', lineHeight: 1.6, maxWidth: '440px' }}>
            Plataforma privada de entrenamiento<br />para vendedores de alto rendimiento.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 32px', borderRadius: '999px', background: '#1a6fff', fontSize: '15px', fontWeight: 700, color: '#fff', textDecoration: 'none', boxShadow: '0 8px 40px rgba(26,111,255,0.45)', letterSpacing: '-0.01em' }}>
              Entrar a la comunidad <ArrowRight style={{ width: '17px', height: '17px' }} />
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '15px 28px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.03)' }}>
              Ya tengo cuenta
            </Link>
          </div>

          {/* Indicador de scroll */}
          <div style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.3 }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>Scroll</p>
            <ChevronDown style={{ width: '16px', height: '16px', color: '#fff', animation: 'bounce 2s infinite' }} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECCIÓN 2 — strip de propuesta de valor
      ═══════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
          {[
            { n: '01', t: 'Entrenamiento real', d: 'Apertura, manejo de objeciones y cierre con estructura clara para escalar resultados.' },
            { n: '02', t: 'Comunidad privada', d: 'Feedback directo, llamadas compartidas y red activa de closers de alto rendimiento.' },
            { n: '03', t: 'Mentorías en vivo', d: 'Roleplays y revisiones personalizadas cada semana con los mejores del equipo.' },
          ].map((f) => (
            <div key={f.n} style={{ padding: '36px 32px', background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ margin: '0 0 18px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(26,111,255,0.5)' }}>{f.n}</p>
              <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em' }}>{f.t}</p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.65', color: 'rgba(255,255,255,0.28)' }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 32px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>
        © {new Date().getFullYear()} Areté Soluciones · Todos los derechos reservados
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>

    </div>
  );
}
