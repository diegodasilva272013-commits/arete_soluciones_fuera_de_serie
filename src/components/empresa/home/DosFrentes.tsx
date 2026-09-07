import s from './DosFrentes.module.css';
import { MediaFrame } from '../MediaFrame';

const FRENTES = [
  {
    href: '/empresa/servicios',
    title: 'Areté Soluciones',
    desc: 'Diseñamos e implementamos sistemas empresariales que se adaptan a cómo trabaja tu empresa. No al revés.',
    items: ['Diagnóstico de las cuatro áreas', 'Arquitectura antes que tecnología', 'Desarrollo a medida'],
    light: 'left' as const,
  },
  {
    href: null,
    title: 'Areté Fuera de Serie',
    desc: 'No formamos vendedores. Formamos solucionadores de problemas: personas capaces de comprender una situación y decidir qué corresponde hacer.',
    items: ['Personal formado para tu empresa', 'Capacitación de tu equipo comercial', 'Mentorías individuales'],
    light: 'right' as const,
  },
];

/** Split 50/50 con corte horizontal — nunca texto sobre el media. */
export function DosFrentes() {
  return (
    <section id="dos-frentes" className={s.section}>
      {FRENTES.map((f) => {
        const inner = (
          <>
            <div className={s.mediaZone}>
              <MediaFrame aspect="full" light={f.light} bevel={false} />
              <span className={s.cutLight} aria-hidden="true" />
            </div>
            <div className={s.contentZone}>
              <h3 className={s.title}>{f.title}</h3>
              <p className={s.desc}>{f.desc}</p>
              <ul className={s.list}>
                {f.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        );
        return f.href ? (
          <a key={f.title} href={f.href} className={s.half}>
            {inner}
          </a>
        ) : (
          <div key={f.title} className={s.half}>
            {inner}
          </div>
        );
      })}
    </section>
  );
}
