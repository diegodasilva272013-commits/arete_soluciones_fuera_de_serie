import s from './recl.module.css';

const PUNTOS = [
  {
    title: 'Buscamos personas, no robots',
    body: 'Para lo robótico ya usamos IA. Lo que no podemos automatizar es el criterio, la persistencia y la forma real de conectar con alguien del otro lado del teléfono — eso lo pone la persona, no un script.',
  },
  {
    title: 'Más que experiencia, compromiso',
    body: 'No nos importa tanto cuánto sabés hoy — nos importa si vas a sostener el proceso todos los días, si te hacés cargo de tus resultados y si seguís cuando algo no sale a la primera.',
  },
  {
    title: 'Qué vas a hacer',
    body: 'Llamar y setear leads: contactar prospectos, calificarlos y agendar reuniones para el equipo de ventas. Trabajo de ejecución diaria, no de teoría.',
  },
];

const DESCALIFICA = [
  'No poder sostener un compromiso diario',
  'Poner excusas en vez de mostrar resultados',
  'Inconsistencia — arrancar fuerte y abandonar a la semana',
  'No querer seguir un proceso ya probado',
];

export function Cultura() {
  return (
    <section className={s.blk}>
      <div className={s.inner}>
        <div className={s.shead}>
          <p className={s.mono}>Nuestra cultura</p>
          <h2>Ser distinto no es un slogan acá — es el filtro.</h2>
        </div>

        <div className={s.culturaGrid}>
          {PUNTOS.map((p) => (
            <div key={p.title} className={s.culturaItem}>
              <h3 className={s.culturaTitle}>{p.title}</h3>
              <p className={s.culturaBody}>{p.body}</p>
            </div>
          ))}
        </div>

        <div className={s.descalifica}>
          <span className={s.descalificaTitle}>Esto te descalifica</span>
          <div className={s.descalificaGrid}>
            {DESCALIFICA.map((d) => (
              <div key={d} className={s.descalificaItem}>
                <span className={s.descalificaDot} aria-hidden />
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
