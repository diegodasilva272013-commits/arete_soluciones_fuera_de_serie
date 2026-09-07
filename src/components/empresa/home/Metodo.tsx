import s from './Metodo.module.css';

const ETAPAS = [
  { n: '01', title: 'Inmersión', line: 'Entender la empresa desde adentro, con dirección y con quien ejecuta.' },
  { n: '02', title: 'Auditoría', line: 'Mapear la operación real: fricciones, duplicaciones, dependencias.' },
  { n: '03', title: 'Priorización', line: 'El 20% de problemas que genera el 80% de la pérdida.' },
  { n: '04', title: 'Arquitectura', line: 'Diseñar cómo debería funcionar. Recién ahí se elige tecnología.' },
  { n: '05', title: 'Implementación', line: 'Construir por prioridad de impacto, no todo junto.' },
  { n: '06', title: 'Evolución', line: 'Medir, observar, ajustar. Una empresa no es estática.' },
];

/**
 * Flujo normal de documento, sin pin de ScrollTrigger — el pin causaba
 * que esta seccion se superpusiera con las de al lado. Seis bloques
 * apilados, siempre visibles, en todos los tamaños de pantalla.
 */
export function Metodo() {
  return (
    <div className={s.wrapper}>
      <div className={s.stacked}>
        {ETAPAS.map((e) => (
          <div key={e.n} className={s.stackItem}>
            <span className={s.stackNumber}>{e.n}</span>
            <div>
              <h3 className={s.stackTitle}>{e.title}</h3>
              <p className={s.stackLine}>{e.line}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
