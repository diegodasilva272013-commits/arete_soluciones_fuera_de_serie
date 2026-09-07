import s from './FilmLayer.module.css';

/**
 * Capa de película global — grano + viñeta, casi invisibles, es lo que
 * saca la sensación de "CSS plano". Montada una sola vez en el layout
 * de /empresa, fixed sobre todo el sitio. No se re-renderiza nunca:
 * es un server component estático, sin estado ni props.
 *
 * La aberración cromática de los bordes (v3 · 03.3) se omite: la propia
 * spec la marca como opcional si complica el render, y sin poder ver el
 * resultado no vale el riesgo de un artefacto visual roto en producción.
 */
export function FilmLayer() {
  return (
    <div className={s.layer} aria-hidden="true">
      <svg className={s.grain} xmlns="http://www.w3.org/2000/svg">
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>
      <div className={s.vignette} />
    </div>
  );
}
