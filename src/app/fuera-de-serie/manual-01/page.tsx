import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import s from '@/app/empresa/corp.module.css';
import { RevealObserver } from '@/app/empresa/_reveal';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { DownloadButton } from './download-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manual 01: Fundamentos de la Conversación Comercial | Areté Fuera de Serie',
  description: 'Descargá gratis el Manual 01 de la Academia Areté Fuera de Serie: Fundamentos de la Conversación Comercial.',
};

async function getDownloadCount(): Promise<number> {
  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const { data } = await supabase
    .from('academia_descargas')
    .select('count')
    .eq('slug', 'manual-01')
    .maybeSingle();
  return data?.count ?? 0;
}

export default async function Manual01Page() {
  const count = await getDownloadCount();

  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero} style={{ isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.pageHeroInner} style={{ position: 'relative', zIndex: 1 }}>
          <div
            className={s.contentGrid}
            style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}
          >
            <div>
              <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
                <span className={s.kickerLine} />
                <span className={s.kickerLabel}>Academia Areté Fuera de Serie · Manual 01</span>
              </div>
              <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ maxWidth: 640 }}>
                Fundamentos de la<br /><em>Conversación Comercial</em>
              </h1>
              <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="" style={{ maxWidth: 520 }}>
                El primer manual de la Academia Areté Fuera de Serie. La base para
                entender cómo se arma una conversación comercial de verdad, antes
                de meterse con prospección, objeciones o cierre.
              </p>
              <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="">
                <DownloadButton initialCount={count} />
              </div>
            </div>

            <div className={`${s.glowCard} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
              <div className={s.glowCardInner} style={{ aspectRatio: '16 / 9' }}>
                <video
                  src="/video_logo_fuera_de_serie.mp4"
                  poster="/academia-fuera-de-serie-poster.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
