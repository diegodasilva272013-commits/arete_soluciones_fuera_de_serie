/**
 * Versión compacta y de solo lectura del Dial (ver ../_dial.tsx) para
 * la cabecera de Hoy — muestra la frecuencia ya guardada del día como el
 * display de una radio, sin arrastre. Si no hay lectura de hoy, no se
 * inventa un 0: se muestra el estado vacío (ver _hoy-cliente.tsx).
 */
import { copy } from '../_copy';
import s from './_dial-mini.module.css';

export function DialMini({ valor }: { valor: number }) {
  const enAbundancia = valor > 0;
  const enEscasez = valor < 0;
  const izquierda = ((valor + 100) / 200) * 100;
  const signo = valor > 0 ? '+' : valor < 0 ? '-' : ' ';
  const estacion = enAbundancia ? copy.dial.abundanciaFm : enEscasez ? copy.dial.escasezFm : copy.hoy.entreLasDos;

  return (
    <div className={`${s.wrap} ${enAbundancia ? s.alto : enEscasez ? s.bajo : ''}`}>
      <div className={s.display}>
        <span className={s.digitos}>
          <span className={s.apagado} aria-hidden>
            -888
          </span>
          <span className={s.encendido} aria-label={String(valor)}>
            {`${signo}${String(Math.abs(valor)).padStart(3, ' ')}`}
          </span>
        </span>
        <span className={s.estacion}>
          <i className={s.led} aria-hidden />
          {estacion}
        </span>
      </div>
      <div className={s.regla} aria-hidden>
        <div className={s.aguja} style={{ left: `${izquierda}%` }} />
      </div>
    </div>
  );
}
