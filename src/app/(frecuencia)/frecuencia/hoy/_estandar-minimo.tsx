/**
 * Estándar mínimo (7.5): recordatorio visible de lo que la persona escribió
 * que NO acepta por debajo (frecuencia_identidad.estandar_minimo, onboarding).
 * Solo lectura; si no escribió nada, no se muestra.
 */
import { copy } from '../_copy';
import s from './_estandar-minimo.module.css';

export function EstandarMinimo({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section className={s.caja} aria-label={copy.estandar.titulo}>
      <p className={s.titulo}>{copy.estandar.titulo}</p>
      <ul className={s.lista}>
        {items.map((x, i) => (
          <li key={`${i}-${x}`} className={s.item}>
            {x}
          </li>
        ))}
      </ul>
      <p className={s.bajada}>{copy.estandar.bajada}</p>
    </section>
  );
}
