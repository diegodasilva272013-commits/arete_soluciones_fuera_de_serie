import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';
import { RevealObserver } from '@/app/empresa/_reveal';
import { waUrl, WA_MSG_GENERAL } from '@/app/empresa/_content';
import { SEO_FDS } from '@/app/empresa/_seo';

export const metadata: Metadata = {
  title: SEO_FDS.incorporarEquipo.title,
  description: SEO_FDS.incorporarEquipo.description,
  alternates: { canonical: SEO_FDS.incorporarEquipo.canonical },
  robots: { index: false, follow: true },
  openGraph: {
    title: SEO_FDS.incorporarEquipo.title,
    description: SEO_FDS.incorporarEquipo.description,
    url: SEO_FDS.incorporarEquipo.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_FDS.incorporarEquipo.title,
    description: SEO_FDS.incorporarEquipo.description,
  },
};

const WA = waUrl(WA_MSG_GENERAL);

export default function IncorporarEquipoComercialPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Fuera de Serie · Búsqueda y selección</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            {SEO_FDS.incorporarEquipo.h1.split(' a tu')[0]}.<br />
            <em>a tu equipo.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Sumá a tu empresa personas formadas con el método Areté, evaluadas sobre conversaciones reales. No candidatos con CV: personas con criterio demostrado.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar disponibilidad <ArrowRight size={14} />
            </a>
            <Link href="/fuera-de-serie" className={s.btnGhost}>
              Ver todas las líneas
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRÓXIMAMENTE ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 640 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 20 }}>En preparación</p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'rgba(242,239,233,0.55)' }}>
              Estamos preparando el detalle completo de esta línea. Si tenés una necesidad concreta de incorporar comerciales capacitados a tu empresa, escribinos y hablamos directamente.
            </p>
            <div style={{ marginTop: 36 }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Consultar disponibilidad <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Necesitás incorporar<br /><em>comerciales ahora?</em></h2>
            <p className={s.ctaSub}>Contactanos y te contamos qué candidatos tenemos disponibles.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/fuera-de-serie" className={s.btnGhost}>
                Ver otras líneas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
