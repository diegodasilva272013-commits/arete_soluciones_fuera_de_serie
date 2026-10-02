import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { DownloadButton } from './download-button';
import s from './academia.module.css';

export const dynamic = 'force-dynamic';

async function getDownloadCount(): Promise<number> {
  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const { data } = await supabase
    .from('academia_descargas')
    .select('count')
    .eq('slug', 'manual-01')
    .maybeSingle();
  return data?.count ?? 0;
}

export default async function AcademiaFueraDeSeriePage() {
  const count = await getDownloadCount();

  return (
    <>
      <header className={s.topbar}>
        <Image
          src="/arete-fuera-de-serie-logo.png"
          alt="Academia Areté Fuera de Serie"
          width={180}
          height={44}
          className={s.logo}
          priority
        />
      </header>

      <section className={s.hero}>
        <div className={s.heroText}>
          <p className={s.eyebrow}>Manual 01</p>
          <h1 className={s.h1}>
            Fundamentos de la<br /><em>Conversación Comercial</em>
          </h1>
          <p className={s.lead}>
            El primer manual de la Academia Areté Fuera de Serie. La base para
            entender cómo se arma una conversación comercial de verdad, antes
            de meterse con prospección, objeciones o cierre.
          </p>
          <DownloadButton initialCount={count} />
        </div>

        <div className={s.videoCard}>
          <div className={s.videoCardInner}>
            <video
              className={s.video}
              src="/video_logo_fuera_de_serie.mp4"
              poster="/academia-fuera-de-serie-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      <p className={s.footer}>Academia Areté Fuera de Serie</p>
    </>
  );
}
