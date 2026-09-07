import s from './CtaFinal.module.css';
import corp from '../../../app/empresa/corp.module.css';
import { MaskTitle } from '../MaskTitle';
import { waLink } from '../../../app/empresa/constants';

const WA = waLink('Hola, quiero saber más sobre Areté Soluciones');
const MARQUEE_TEXT = 'Comprender · Diagnosticar · Construir · Medir';

/** Único punto medio y único `linear` del sitio — es el marquee, no una regla general. */
export function CtaFinal() {
  return (
    <section className={s.section}>
      <div className={s.glow} aria-hidden="true" />

      <MaskTitle
        as="h2"
        trigger="scroll"
        className={s.title}
        lines={['Contanos cómo', 'trabaja tu empresa.']}
      />
      <p className={s.sub}>
        Una conversación para ver dónde está la fricción. Si vemos que no hay nada para hacer, te lo decimos.
      </p>

      <a href={WA} target="_blank" rel="noopener noreferrer" className={corp.btn} style={{ position: 'relative' }}>
        Escribir a Areté
      </a>

      <div className={s.marquee} aria-hidden="true">
        <div className={s.marqueeTrack}>
          <span className={s.marqueeItem}>{MARQUEE_TEXT}</span>
          <span className={s.marqueeItem}>{MARQUEE_TEXT}</span>
          <span className={s.marqueeItem}>{MARQUEE_TEXT}</span>
          <span className={s.marqueeItem}>{MARQUEE_TEXT}</span>
        </div>
      </div>
    </section>
  );
}
