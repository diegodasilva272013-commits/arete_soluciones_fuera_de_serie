'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Brandmark } from '@/components/brand/brandmark';
import hStyles from './header.module.css';
import styles from './hero.module.css';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Scroll detection para header frosted glass
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Video crossfade
    const v1 = document.getElementById('hero-v1') as HTMLVideoElement | null;
    const v2 = document.getElementById('hero-v2') as HTMLVideoElement | null;
    if (v1 && v2) {
      v1.muted = true; v1.volume = 0;
      v2.muted = true; v2.volume = 0;

      const playV2 = () => { v1.style.opacity = '0'; v2.style.opacity = '1'; v2.currentTime = 0; v2.play().catch(() => {}); };
      const playV1 = () => { v2.style.opacity = '0'; v1.style.opacity = '1'; v1.currentTime = 0; v1.play().catch(() => {}); };

      v1.addEventListener('ended', playV2);
      v2.addEventListener('ended', playV1);
      v1.play().catch(() => {});

      return () => {
        window.removeEventListener('scroll', onScroll);
        v1.removeEventListener('ended', playV2);
        v2.removeEventListener('ended', playV1);
      };
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ══ HEADER FIJO ══ */}
      <header className={`${hStyles.header} ${scrolled ? hStyles.isScrolled : ''}`}>
        <div className={hStyles.inner}>
          <Brandmark variant="lockup" size="sm" href="/" priority />

          <nav className={hStyles.nav} aria-label="Acceso">
            <Link href="/login" className={hStyles.ghost}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={hStyles.outline}>
              <span>Crear cuenta</span>
            </Link>
          </nav>
        </div>
        <div className={hStyles.hairline} aria-hidden="true" />
      </header>

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

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: 'radial-gradient(120% 80% at 50% 45%, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.82) 68%, #050505 100%)' }} />

        {/* Contenido hero — left-aligned con barra azul */}
        <div style={{ position: 'relative', zIndex: 30, flex: 1, display: 'flex', alignItems: 'center', padding: '120px 32px 80px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
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

      {/* ══ STRIP INFERIOR — image cards ══ */}
      <section style={{ padding: '0 0 0' }}>

        {/* Intro de sección */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 32px 40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(26,111,255,0.8)' }}>
              Lo que vas a encontrar
            </p>
            <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Todo lo que necesitás<br />para cerrar más.
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', maxWidth: '320px' }}>
            Areté es un sistema de entrenamiento privado diseñado para vendedores que quieren resultados reales.
          </p>
        </div>

        {/* Cards full-bleed */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
          {([
            {
              n: '01',
              img: '/1.png',
              t: 'Entrenamiento real',
              d: 'Apertura, manejo de objeciones y cierre con estructura clara para escalar resultados.',
            },
            {
              n: '02',
              img: '/2.png',
              t: 'Comunidad privada',
              d: 'Feedback directo, llamadas compartidas y red activa de closers de alto rendimiento.',
            },
            {
              n: '03',
              img: '/3.png',
              t: 'Mentorías en vivo',
              d: 'Roleplays y revisiones personalizadas cada semana con los mejores del equipo.',
            },
          ] as const).map((f) => (
            <div
              key={f.n}
              style={{ position: 'relative', height: '460px', overflow: 'hidden' }}
            >
              {/* Foto de fondo */}
              <Image
                src={f.img}
                alt={f.t}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  opacity: 0.68,
                  filter: 'grayscale(15%) brightness(0.82) saturate(0.85)',
                }}
              />
              {/* Tinte azul uniforme para todos los cards */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(8,18,40,0.35)',
                mixBlendMode: 'multiply',
              }} />
              {/* Gradiente oscuro hacia arriba desde negro */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.52) 48%, rgba(5,5,5,0.12) 100%)',
              }} />
              {/* Filete azul inferior */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, #1a6fff 0%, rgba(26,111,255,0) 100%)',
              }} />
              {/* Contenido */}
              <div style={{
                position: 'absolute', inset: 0,
                padding: '28px 28px 32px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                {/* Número arriba */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'rgba(26,111,255,0.85)',
                }}>
                  <span style={{
                    display: 'inline-block', width: '16px', height: '1px',
                    background: '#1a6fff', opacity: 0.6,
                  }} />
                  {f.n}
                </span>
                {/* Título + descripción abajo */}
                <div>
                  <p style={{
                    margin: '0 0 10px',
                    fontSize: '17px', fontWeight: 700,
                    color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15,
                  }}>
                    {f.t}
                  </p>
                  <p style={{
                    margin: 0, fontSize: '13px',
                    lineHeight: 1.65, color: 'rgba(255,255,255,0.42)',
                  }}>
                    {f.d}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '2px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <Brandmark variant="lockup" size="sm" href="/" />
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
            © {new Date().getFullYear()} Areté Soluciones · Todos los derechos reservados
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/login" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Ingresar</a>
            <a href="/register" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(26,111,255,0.7)', textDecoration: 'none' }}>Crear cuenta</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
