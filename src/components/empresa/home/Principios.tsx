import s from './Principios.module.css';
import { WordReveal } from '../WordReveal';

const SISTEMAS = [
  'Si no entendemos el proceso, no podemos automatizarlo.',
  'Si no sabemos qué problema resolvemos, no debemos desarrollar.',
  'Si una tecnología no genera impacto, no la implementamos.',
  'Si podemos simplificar antes de automatizar, simplificamos.',
  'Si el sistema obliga a la empresa a trabajar peor para poder usarlo, diseñamos mal el sistema.',
];

const PERSONAS = [
  'No formamos vendedores. Formamos solucionadores de problemas.',
  'La intención se percibe. Primero comprender, después diagnosticar, después decidir.',
  'Decir que no también es una buena decisión. La reputación está por encima de cualquier venta.',
  'Conocimiento sin acción es entretenimiento.',
  'No protegemos egos, protegemos crecimiento. La corrección es información.',
  'La realidad está por encima de la interpretación. No asumimos, observamos.',
];

/** Manifiesto tipográfico — no un acordeón. Es el mejor contenido del sitio. */
export function Principios() {
  return (
    <section className={s.section}>
      <div className={s.grid}>
        <span className={s.centerLight} aria-hidden="true" />
        <div>
          <span className={s.colLabel}>Sistemas · Areté Soluciones</span>
          {SISTEMAS.map((line) => (
            <WordReveal key={line} text={line} className={s.manifesto} />
          ))}
        </div>
        <div>
          <span className={s.colLabel}>Personas · Areté Fuera de Serie</span>
          {PERSONAS.map((line) => (
            <WordReveal key={line} text={line} className={s.manifesto} />
          ))}
        </div>
      </div>

      <div className={s.closing}>
        <WordReveal text="Los resultados sostenibles no nacen de memorizar respuestas. Nacen de aprender a pensar." />
      </div>
    </section>
  );
}
