import s from './MediaFrame.module.css';

type Aspect = '16/10' | '16/9' | '3/2' | '4/5' | 'full';
type Light = 'left' | 'right' | 'top' | 'bottom' | 'center';

const ASPECT_CLASS: Record<Aspect, string> = {
  '16/10': s['aspect-16-10'],
  '16/9': s['aspect-16-9'],
  '3/2': s['aspect-3-2'],
  '4/5': s['aspect-4-5'],
  full: s['aspect-full'],
};

const LIGHT_CLASS: Record<Light, string> = {
  left: s.lightLeft,
  right: s.lightRight,
  top: s.lightTop,
  bottom: s.lightBottom,
  center: s.lightCenter,
};

type MediaFrameProps = {
  /** Sin src → plano vacío iluminado. Con src → video a brillo pleno, mismo encuadre. */
  videoSrc?: string;
  imageSrc?: string;
  poster?: string;
  aspect?: Aspect;
  light?: Light;
  bevel?: boolean;
  /** Descripción textual real para media no decorativa (ej. la plataforma). */
  description?: string;
  className?: string;
  videoClassName?: string;
  mediaClassName?: string;
};

/**
 * Plano vacío iluminado cuando no hay archivo, video/imagen a brillo pleno
 * cuando lo hay — mismo encuadre, misma posición en los dos casos. Cargar
 * el archivo después no mueve ni un píxel del layout (sección 8.2 / v3).
 */
export function MediaFrame({
  videoSrc,
  imageSrc,
  poster,
  aspect = '16/10',
  light = 'left',
  bevel = true,
  description,
  className = '',
  videoClassName = '',
  mediaClassName = '',
}: MediaFrameProps) {
  const hasMedia = Boolean(videoSrc || imageSrc);

  return (
    <div
      className={`${s.frame} ${ASPECT_CLASS[aspect]} ${bevel ? s.bevel : ''} ${className}`}
      role={description ? 'img' : undefined}
      aria-label={description}
      aria-hidden={description ? undefined : 'true'}
    >
      {hasMedia ? (
        videoSrc ? (
          <video
            className={`${s.media} ${videoClassName} ${mediaClassName}`}
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={`${s.media} ${mediaClassName}`} src={imageSrc} alt="" aria-hidden="true" />
        )
      ) : (
        <div className={`${s.empty} ${LIGHT_CLASS[light]}`} />
      )}
    </div>
  );
}
