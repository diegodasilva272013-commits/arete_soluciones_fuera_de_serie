import s from './Track.module.css';

export type Etapa = {
  n: string;
  title: string;
  duration: string;
  body: string;
  pull: string;
  items: string[];
};

/**
 * Flujo normal de documento, sin pin ni track horizontal de ScrollTrigger
 * — el pin causaba que esta sección se superpusiera con las de al lado.
 * Seis bloques apilados, siempre visibles, navegables por teclado.
 */
export function Track({ etapas }: { etapas: Etapa[] }) {
  return (
    <div className={s.wrapper}>
      {etapas.map((e) => (
        <Panel key={e.n} e={e} />
      ))}
    </div>
  );
}

function Panel({ e }: { e: Etapa }) {
  return (
    <div className={s.panel}>
      <span className={s.number} aria-hidden="true">{e.n}</span>
      <h3 className={s.title}>{e.title}</h3>
      <span className={s.duration}>{e.duration}</span>
      <p className={s.body}>{e.body}</p>
      <p className={s.pull}>{e.pull}</p>
      <ul className={s.items}>
        {e.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
