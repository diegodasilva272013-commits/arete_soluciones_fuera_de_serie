'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Brandmark } from '@/components/brand/brandmark';
import hStyles from './header.module.css';
import styles from './hero.module.css';
import bStyles from './bands.module.css';

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

    // Reveal on scroll para las bandas
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add(bStyles.revealOn);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
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

      {/* ══ BANDAS ALTERNADAS ══ */}
      <section className={bStyles.section}>

        {/* Intro */}
        <div className={bStyles.intro}>
          <div className={`${bStyles.introContent} ${bStyles.reveal}`} data-reveal="">
            <p className={bStyles.eyebrow}>Qué pasa adentro</p>
            <h2 className={bStyles.introTitle}>No es una biblioteca<br />de videos</h2>
            <p className={bStyles.introSub}>Tres instancias que funcionan en paralelo desde el primer día. Ninguna se completa mirando.</p>
          </div>
        </div>

        {/* ── Banda 01 — Entrenamiento ── */}
        <div className={bStyles.band}>
          <div className={bStyles.bandInner}>
            <div className={`${bStyles.shot} ${bStyles.reveal}`} data-reveal="">
              <div className={bStyles.frame}>
                <Image className={bStyles.frameImg} src="/1.png" alt="Entrenamiento frente al monitor" fill sizes="(max-width:960px) 100vw, 50vw" />
              </div>
              <span className={bStyles.shotBorder} aria-hidden="true" />
            </div>
            <div className={`${bStyles.text} ${bStyles.reveal} ${bStyles.revealDelay}`} data-reveal="">
              <div className={bStyles.kicker}>
                <span className={bStyles.kickerLine} />
                <b className={bStyles.kickerLabel}>Formación</b>
              </div>
              <h3 className={bStyles.title}>Entrenamiento<br />con estructura</h3>
              <p className={bStyles.body}>La conversación comercial desarmada en partes: cómo abrir sin sonar a libreto, cómo entender el problema antes de proponer una solución, y qué hacer cuando el precio aparece antes de tiempo.</p>
              <p className={bStyles.body}>Cada módulo cierra con un ejercicio que se practica. No hay avance por reproducción de video.</p>
              <p className={bStyles.pull}>Los guiones que vas a leer son los que usamos nosotros, con las palabras exactas.</p>
              <dl className={bStyles.meta}>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Formato</dt><dd className={bStyles.metaDd}>Manuales + ejercicios</dd></div>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Módulos</dt><dd className={bStyles.metaDd}><em>12</em> unidades</dd></div>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Acceso</dt><dd className={bStyles.metaDd}>Permanente</dd></div>
              </dl>
            </div>
          </div>
        </div>

        {/* ── Banda 02 — Comunidad (flip) ── */}
        <div className={bStyles.band}>
          <div className={`${bStyles.bandInner} ${bStyles.bandInnerFlip}`}>
            <div className={`${bStyles.shot} ${bStyles.reveal}`} data-reveal="">
              <div className={bStyles.frame}>
                <Image className={bStyles.frameImg} src="/2.png" alt="Comunidad revisando llamadas en grupo" fill sizes="(max-width:960px) 100vw, 50vw" />
              </div>
              <span className={bStyles.shotBorder} aria-hidden="true" />
            </div>
            <div className={`${bStyles.text} ${bStyles.reveal} ${bStyles.revealDelay}`} data-reveal="">
              <div className={bStyles.kicker}>
                <span className={bStyles.kickerLine} />
                <b className={bStyles.kickerLabel}>Comunidad</b>
              </div>
              <h3 className={bStyles.title}>Revisión<br />entre pares</h3>
              <p className={bStyles.body}>Un espacio cerrado donde se comparten conversaciones reales para que el resto del equipo las revise. No es un canal de novedades ni un grupo de motivación.</p>
              <p className={bStyles.body}>Cada intervención busca lo mismo: identificar el momento exacto en que la conversación se desvió, y qué se podría haber preguntado en su lugar.</p>
              <p className={bStyles.pull}>Se entra por invitación y se participa mostrando trabajo propio.</p>
              <dl className={bStyles.meta}>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Integrantes</dt><dd className={bStyles.metaDd}><em>40+</em> activos</dd></div>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Respuesta</dt><dd className={bStyles.metaDd}>Menos de <em>24</em> h</dd></div>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Ingreso</dt><dd className={bStyles.metaDd}>Por invitación</dd></div>
              </dl>
            </div>
          </div>
        </div>

        {/* ── Banda 03 — Mentorías ── */}
        <div className={bStyles.band}>
          <div className={bStyles.bandInner}>
            <div className={`${bStyles.shot} ${bStyles.reveal}`} data-reveal="">
              <div className={bStyles.frame}>
                <Image className={bStyles.frameImg} src="/3.png" alt="Mentoría en vivo con panel de diagramas" fill sizes="(max-width:960px) 100vw, 50vw" />
              </div>
              <span className={bStyles.shotBorder} aria-hidden="true" />
            </div>
            <div className={`${bStyles.text} ${bStyles.reveal} ${bStyles.revealDelay}`} data-reveal="">
              <div className={bStyles.kicker}>
                <span className={bStyles.kickerLine} />
                <b className={bStyles.kickerLabel}>Mentoría</b>
              </div>
              <h3 className={bStyles.title}>Acompañamiento<br />en vivo</h3>
              <p className={bStyles.body}>Práctica dirigida con alguien que ya atravesó el caso que tenés adelante. Se simula la conversación completa, se corta donde hace falta y se vuelve a empezar.</p>
              <p className={bStyles.body}>La sesión no termina cuando se acaba el tiempo, sino cuando la estructura quedó incorporada y podés repetirla sin ayuda.</p>
              <p className={bStyles.pull}>Cupo reducido, porque el que mira sin hablar no aprende.</p>
              <dl className={bStyles.meta}>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Frecuencia</dt><dd className={bStyles.metaDd}><em>2</em> por semana</dd></div>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Duración</dt><dd className={bStyles.metaDd}><em>60</em> min</dd></div>
                <div className={bStyles.metaItem}><dt className={bStyles.metaDt}>Cupo</dt><dd className={bStyles.metaDd}>Máx. <em>8</em></dd></div>
              </dl>
            </div>
          </div>
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
