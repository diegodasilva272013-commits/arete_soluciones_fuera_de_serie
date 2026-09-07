import s from './Founders.module.css';
import { MediaFrame } from '../MediaFrame';

const FOUNDERS = [
  {
    name: 'Lucas Ramos',
    role: 'Socio fundador',
    bio: 'Fundador original de Areté. Identificó los problemas estructurales de la forma tradicional de vender y tomó la decisión de construir una alternativa basada en comprensión, criterio y desarrollo real de personas.',
    light: 'left' as const,
    flip: false,
  },
  {
    name: 'Diego',
    role: 'Socio',
    bio: 'Incorporado a partir de una visión compartida. Aporta sistemas, metodología y una perspectiva complementaria que transformó Areté de una propuesta formativa en un ecosistema completo.',
    light: 'right' as const,
    flip: true,
  },
];

/** Retrato a media página, texto en la otra — nunca texto sobre el retrato. */
export function Founders() {
  return (
    <section className={s.section}>
      {FOUNDERS.map((f) => (
        <div key={f.name} className={s.founder} data-flip={f.flip}>
          <div className={s.portraitCol}>
            <MediaFrame aspect="4/5" light={f.light} bevel={false} />
          </div>
          <div className={s.textCol}>
            <h3 className={s.name}>{f.name}</h3>
            <span className={s.role}>{f.role}</span>
            <p className={s.bio}>{f.bio}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
