'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import styles from './hero.module.css';

export default function HomePage() {

  useEffect(() => {
    const v1 = document.getElementById('hero-v1') as HTMLVideoElement | null;
    const v2 = document.getElementById('hero-v2') as HTMLVideoElement | null;
    if (!v1 || !v2) return;

    v1.muted = true; v1.volume = 0;
    v2.muted = true; v2.volume = 0;

    function playV2() {
      v1!.style.opacity = '0';
      v2!.style.opacity = '1';
      v2!.currentTime = 0;
      v2!.play().catch(() => {});
    }
    function playV1() {
      v2!.style.opacity = '0';
      v1!.style.opacity = '1';
      v1!.currentTime = 0;
      v1!.play().catch(() => {});
    }

    v1.addEventListener('ended', playV2);
    v2.addEventListener('ended', playV1);
    v1.play().catch(() => {});

    return () => {
      v1.removeEventListener('ended', playV2);
      v2.removeEventListener('ended', playV1);
    };
  }, []);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', width: '100%', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>

        {/* Videos — dangerouslySetInnerHTML garantiza muted nativo */}
        <div
          style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          dangerouslySetInnerHTML={{
            __html: `
              <video id="hero-v1" src="/video_1.mp4" autoplay muted playsinline preload="auto"
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;transition:opacity 1.2s ease;"></video>
              <video id="hero-v2" src="/video_2.mp4" muted playsinline preload="auto"
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;"></video>
            `,
          }}
        />

        {/* Overlays encima del video */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: 'radial-gradient(120% 80% at 50% 45%, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.82) 68%, #050505 100%)' }} />

        {/* NAV */}
        <header style={{ position: 'relative', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 32px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrandLogo size="md" priority />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Areté Soluciones</p>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1a6fff' }}>Fuera de Serie</p>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/login" style={{ padding: '9px 22px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
              Iniciar sesión
            </Link>
            <Link href="/register" style={{ padding: '9px 22px', borderRadius: '999px', background: '#1a6fff', fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(26,111,255,0.4)' }}>
              Crear cuenta
            </Link>
          </nav>
        </header>

        {/* Contenido hero — left-aligned con barra azul */}
        <div style={{ position: 'relative', zIndex: 30, flex: 1, display: 'flex', alignItems: 'center', padding: '40px 32px 100px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div className={styles.inner}>

            <div className={styles.lockup}>
              <p className={styles.lead}>Sala privada de entrenamiento</p>
              <h1 className={styles.title}>
                Domina el arte de<br />solucionar <em>problemas</em>
              </h1>
            </div>

            <div className={styles.actions}>
              <Link href="/register" className={styles.cta}>
                Entrar a la comunidad <ArrowRight style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              </Link>
              <Link href="/login" className={styles.alt}>
                Ya tengo cuenta
              </Link>
            </div>

            <ul className={styles.creds}>
              <li>Acceso verificado</li>
              <li>Contenido exclusivo</li>
              <li>Comunidad activa</li>
            </ul>

          </div>
        </div>

      </section>

      {/* ══ STRIP INFERIOR ══ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
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

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 32px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>
        © {new Date().getFullYear()} Areté Soluciones · Todos los derechos reservados
      </footer>

    </div>
  );
}
