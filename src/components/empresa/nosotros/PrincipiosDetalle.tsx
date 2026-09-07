import s from './PrincipiosDetalle.module.css';

const PRINCIPIOS = [
  {
    n: '01',
    title: 'Si no entendemos el proceso, no podemos automatizarlo',
    body: 'Cada proyecto empieza con inmersión en la operación real. Nunca con un documento de requerimientos escrito por el cliente.',
  },
  {
    n: '02',
    title: 'Si no sabemos qué problema resolvemos, no desarrollamos',
    body: 'Antes de construir cualquier cosa, sabemos exactamente qué fricción va a desaparecer y quién va a sentir la diferencia.',
  },
  {
    n: '03',
    title: 'Si una tecnología no genera impacto, no la implementamos',
    body: 'No vendemos herramientas. Si la solución más efectiva para un problema es una planilla bien diseñada, eso entregamos.',
  },
  {
    n: '04',
    title: 'Si podemos simplificar antes de automatizar, simplificamos',
    body: 'Automatizar un proceso mal diseñado solo produce errores más rápido. El orden correcto es: diseñar, simplificar, automatizar.',
  },
  {
    n: '05',
    title: 'Si el sistema obliga a la empresa a trabajar peor, diseñamos mal',
    body: 'Un sistema que no adopta el equipo es un gasto, no una inversión. Si no funciona en la práctica real, volvemos al diseño.',
  },
];

/** Desarrollo en profundidad de cada principio — el manifiesto corto vive en el home. */
export function PrincipiosDetalle() {
  return (
    <section className={s.section}>
      <div className={s.list}>
        {PRINCIPIOS.map((p) => (
          <div key={p.n} className={s.item}>
            <span className={s.n}>{p.n}</span>
            <div>
              <h3 className={s.title}>{p.title}</h3>
              <p className={s.body}>{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
