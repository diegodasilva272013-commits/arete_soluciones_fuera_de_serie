import type { Metadata } from 'next';
import { existsSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import c from '@/app/empresa/corp.module.css';
import s from './t1.module.css';
import { SEO_FDS, SITE_URL } from '@/app/empresa/_seo';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { BlurIn, Countdown, DockProfes, ProximoEpisodio, Programa, VideoTemporada } from './_efectos';
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
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.title,
    description: SEO.description,
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
  const hayPoster = existsSync(path.join(process.cwd(), 'public', POSTER_TEMPORADA));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_SCHEMA) }}
      />

      {/* ══════════════ HERO (azul, mismo que Metodología / Contacto) ══════════════ */}
      <section className={c.pageHero} style={{ isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={`${c.pageHeroInner} ${s.heroInner}`}>
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
                <span className={c.metaDd}>9 clases en vivo</span>
              </div>
              <div className={c.metaItem}>
                <span className={c.metaDt}>Duración</span>
                <span className={c.metaDd}>90 minutos</span>
              </div>
              <div className={c.metaItem}>
                <span className={c.metaDt}>Horario (ARG)</span>
                <span className={c.metaDd}>Lun y Mié 20 h · Sáb 18 h</span>
              </div>
              <div className={c.metaItem}>
                <span className={c.metaDt}>Inversión</span>
                <span className={c.metaDd}><em>Gratis</em></span>
              </div>
            </div>
          </BlurIn>
          <BlurIn delay={0.46}>
            <ProximoEpisodio />
          </BlurIn>
          <BlurIn delay={0.56}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#registro" className={c.btnPrimary}>
                Reservar mi lugar <ArrowRight size={14} />
              </a>
              <a href="#programa" className={c.btnGhost}>
                Ver el programa
              </a>
            </div>
            <Countdown />
          </BlurIn>
        </div>
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
      <section id="programa" className={`${c.section} ${c.sectionAlt}`} style={{ scrollMarginTop: 68 }}>
        <div className={c.inner}>
          <BlurIn className={c.sectionLockup}>
            <p className={c.kickerLabel} style={{ marginBottom: 14 }}>02 · El programa</p>
            <h2 className={c.sectionTitle}>Tres semanas.<br /><em>Nueve episodios.</em></h2>
            <p className={c.sectionSub}>Cada episodio es una parte de la misma conversación. Tocá uno para ver el detalle.</p>
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
          {hayPoster && (
            <BlurIn delay={0.1} className={s.poster}>
              <Image
                src={POSTER_TEMPORADA}
                alt="Diego Da Silva, Mauro Benitez, Fátima Rivera, Cecilia Gutierrez y Daniel Peña · Fuera de Serie Temporada 1"
                width={1932}
                height={1932}
                sizes="(max-width: 820px) 100vw, 760px"
              />
            </BlurIn>
          )}
          <BlurIn delay={0.1}>
            <DockProfes />
          </BlurIn>
        </div>
      </section>

      {/* ══════════════ REGISTRO ══════════════ */}
      <section id="registro" className={`${c.section} ${c.sectionAlt}`} style={{ scrollMarginTop: 68 }}>
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
    </>
  );
}
