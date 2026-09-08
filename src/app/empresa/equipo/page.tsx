import type { Metadata } from 'next';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import type { SmoothSliderItem } from '@/components/ui/arc-flow-carousel';
import { EquipoCarousel } from './_equipo-carousel';

export const metadata: Metadata = {
  title: 'Equipo — Areté Soluciones',
  description: 'El equipo detrás del sistema: quiénes diagnostican, diseñan e implementan en cada proyecto.',
};

// Mismas fotos reales que ya usamos en el resto del sitio (home). Sin
// titulos ni descripciones inventadas por foto — no tenemos bios reales
// de cada persona todavia, asi que no se fabrican.
const EQUIPO_IMAGES: SmoothSliderItem[] = [
  '/1.png', '/2.png', '/3.png',
  '/galeria1.png', '/galeria2.png', '/galeria3.png', '/galeria4.png',
  '/galeria5.png', '/galeria6.png', '/galeria7.png', '/galeria8.png',
  '/galeria9.png', '/galeria10.png',
].map((src) => ({ src, alt: 'Equipo Areté Soluciones' }));

export default function EquipoPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Equipo</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            La gente detrás<br /><em>del sistema.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Cada proyecto lo llevan adelante personas, no una metodología abstracta. Arrastrá para conocer al equipo.
          </p>
        </div>
      </section>

      <EquipoCarousel items={EQUIPO_IMAGES} />
    </>
  );
}
