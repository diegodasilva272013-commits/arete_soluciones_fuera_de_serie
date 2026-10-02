import Image from 'next/image';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import s from './academia.module.css';

const PDF_HREF = '/Arete_Fuera_de_Serie_Manual_01_Fundamentos_de_la_Conversacion_Comercial.pdf';

export default function AcademiaFueraDeSeriePage() {
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

      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/video_logo_fuera_de_serie.mp4"
        posterSrc="/academia-fuera-de-serie-poster.jpg"
        bgImageSrc="/academia-fuera-de-serie-poster.jpg"
        date="Academia Areté Fuera de Serie"
        scrollToExpand="Desplazá para descargar"
      >
        <div className={s.heroContent}>
          <p className={s.eyebrow}>Manual 01</p>
          <h1 className={s.h1}>
            Fundamentos de la<br /><em>Conversación Comercial</em>
          </h1>
          <p className={s.lead}>
            El primer manual de la Academia Areté Fuera de Serie. La base para
            entender cómo se arma una conversación comercial de verdad, antes
            de meterse con prospección, objeciones o cierre.
          </p>
          <a href={PDF_HREF} download className={s.btn}>
            Descargar el manual (PDF)
          </a>
        </div>
      </ScrollExpandMedia>

      <p className={s.footer}>Academia Areté Fuera de Serie</p>
    </>
  );
}
