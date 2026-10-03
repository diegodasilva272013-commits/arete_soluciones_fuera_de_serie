import type { Metadata } from 'next';
import c from '@/app/empresa/corp.module.css';
import s from './t1.module.css';
import { SEO_FDS, SITE_URL } from '@/app/empresa/_seo';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { BlurIn, Countdown, Equipo, HeroEscena, HeroFoto, Programa, ReservaBoton, ReservaProvider, VideoTemporada } from './_efectos';
import { RegistroForm } from './_registro';
import { EPISODIOS, POSTER_TEMPORADA, TEMPORADA_INICIO, TEMPORADA_NOMBRE } from './_data';

const SEO = SEO_FDS.temporada1;

export const metadata: Metadata = {
  title: { absolute: SEO.title },
  description: SEO.description,
  alternates: { canonical: SEO.canonical },
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: SEO.canonical,
    images: [{ url: POSTER_TEMPORADA, width: 1400, height: 1400, alt: TEMPORADA_NOMBRE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
    images: [POSTER_TEMPORADA],
  },
};

const EVENT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EventSeries',
  name: TEMPORADA_NOMBRE,
  description: SEO.description,
  startDate: TEMPORADA_INICIO,
  endDate: '2026-10-24T19:30:00-03:00',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  isAccessibleForFree: true,
  location: { '@type': 'VirtualLocation', url: SEO.canonical },
  organizer: { '@type': 'Organization', name: 'Areté Soluciones', url: SITE_URL },
  subEvent: EPISODIOS.map((e) => ({ '@type': 'Event', name: e.titulo, description: e.bajada })),
};

export default function Temporada1Page() {
  return (
    <ReservaProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_SCHEMA) }}
      />

      {/* ══════════════ HERO (azul, mismo que Metodología / Contacto) ══════════════ */}
      <section className={c.pageHero} style={{ isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={`${c.pageHeroInner} ${s.heroInner}`}>
          <HeroEscena>
            <BlurIn>
              <div className={`${c.kicker} ${c.revealOn}`}>
                <span className={c.kickerLine} />
                <span className={c.kickerLabel}>Areté Fuera de Serie · Clases en vivo</span>
              </div>
            </BlurIn>
            <BlurIn delay={0.12}>
              <h1 className={c.heroTitle}>
                Fuera de Serie.<br /><em>Temporada 1.</em>
              </h1>
            </BlurIn>
            <BlurIn delay={0.24}>
              <p className={c.heroSub}>
                Nueve clases en vivo sobre lo que pasa de verdad en una conversación de venta. Desde el primer minuto hasta el cierre. Porque nunca fue el precio.
              </p>
            </BlurIn>
            <BlurIn delay={0.36}>
              <div className={s.heroMeta}>
                <div className={c.metaItem}>
                  <span className={c.metaDt}>Formato</span>
                  <span className={c.metaDd}>9 clases · 90 min</span>
                </div>
                <div className={`${c.metaItem} ${s.metaAncho}`}>
                  <span className={c.metaDt}>Horario (ARG)</span>
                  <span className={c.metaDd}>Lun y Mié 20 h · Sáb 18 h</span>
                </div>
                <div className={c.metaItem}>
                  <span className={c.metaDt}>Inversión</span>
                  <span className={c.metaDd}><em>Gratis</em></span>
                </div>
              </div>
            </BlurIn>
            <BlurIn delay={0.48}>
              <div className={s.heroCtas}>
                <ReservaBoton id="hero" />
                <a href="#programa" className={c.btnGhost}>
                  Ver el programa
                </a>
              </div>
              <Countdown />
            </BlurIn>
          </HeroEscena>
        </div>
      </section>

      {/* ══════════════ FOTO DEL EQUIPO (completa, después del hero) ══════════════ */}
      <section className={s.fotoBanda}>
        <HeroFoto />
      </section>

      {/* ══════════════ VIDEO ══════════════ */}
      <section className={c.section}>
        <div className={c.inner}>
          <BlurIn className={c.sectionLockup}>
            <p className={c.kickerLabel} style={{ marginBottom: 14 }}>01 · Esta semana</p>
            <h2 className={c.sectionTitle}>Qué va a pasar<br /><em>esta semana.</em></h2>
            <p className={c.sectionSub}>Cómo funcionan las clases, quiénes las dan y qué te llevás de cada una.</p>
          </BlurIn>
          <BlurIn delay={0.1}>
            <VideoTemporada />
          </BlurIn>
        </div>
      </section>

      {/* ══════════════ PROGRAMA ══════════════ */}
      <section id="programa" className={`${c.section} ${c.sectionAlt} ${s.programa}`} style={{ scrollMarginTop: 68 }}>
        <div className={c.inner}>
          <BlurIn className={c.sectionLockup}>
            <p className={c.kickerLabel} style={{ marginBottom: 14 }}>02 · El programa</p>
            <h2 className={c.sectionTitle}>Tres semanas.<br /><em>Nueve episodios.</em></h2>
            <p className={c.sectionSub}>Cada episodio es una parte de la misma conversación. Pasá el cursor por la temporada y tocá un episodio para abrirlo.</p>
          </BlurIn>
          <BlurIn delay={0.1}>
            <Programa />
          </BlurIn>
        </div>
      </section>

      {/* ══════════════ PROFES ══════════════ */}
      <section className={c.section}>
        <div className={c.inner}>
          <BlurIn className={c.sectionLockup}>
            <p className={c.kickerLabel} style={{ marginBottom: 14 }}>03 · Del otro lado</p>
            <h2 className={c.sectionTitle}>Quiénes dan<br /><em>las clases.</em></h2>
            <p className={c.sectionSub}>El equipo de Areté, en vivo. Las mismas personas que entrenan todos los días sobre conversaciones reales.</p>
          </BlurIn>
          <Equipo />
        </div>
      </section>

      {/* ══════════════ REGISTRO ══════════════ */}
      <section id="registro" className={`${c.section} ${c.sectionAlt} ${s.registro}`} style={{ scrollMarginTop: 68 }}>
        <div className={c.inner} style={{ maxWidth: 820 }}>
          <BlurIn className={c.sectionLockup}>
            <p className={c.kickerLabel} style={{ marginBottom: 14 }}>04 · Inscripción</p>
            <h2 className={c.sectionTitle}>Reservá<br /><em>tu lugar.</em></h2>
            <p className={c.sectionSub}>Registrate y te mandamos por mail el link de Zoom para las clases. Agendá las que quieras.</p>
          </BlurIn>
          <BlurIn delay={0.1}>
            <RegistroForm />
          </BlurIn>
        </div>
      </section>
    </ReservaProvider>
  );
}
