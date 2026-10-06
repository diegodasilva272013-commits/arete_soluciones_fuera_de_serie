/**
 * Versión compacta y de solo lectura del Dial (ver ../_dial.tsx) para
 * la cabecera de Hoy — muestra la frecuencia ya guardada del día, sin
 * arrastre. Si no hay lectura de hoy, no se inventa un 0: se muestra el
 * estado vacío (ver _hoy-cliente.tsx).
 */
import { copy } from '../_copy';
import s from './_dial-mini.module.css';

export function DialMini({ valor }: { valor: number }) {
  const enAbundancia = valor >= 0;
  const porcentaje = ((valor + 100) / 200) * 100;

  return (
    <div className={s.wrap}>
      <span className={`${s.lectura} ${enAbundancia ? s.lecturaAbundancia : s.lecturaEscasez}`}>{valor > 0 ? `+${valor}` : valor}</span>
      <div style={{ flex: 1 }}>
        <div className={s.barra}>
          <div className={s.barraRelleno} style={valor >= 0 ? { left: '50%', width: `${porcentaje - 50}%` } : { right: '50%', width: `${50 - porcentaje}%` }} />
          <div className={s.marcaCero} />
        </div>
        <p className={s.estacion} style={{ marginTop: 6 }}>{enAbundancia ? copy.dial.abundanciaFm : copy.dial.escasezFm}</p>
      </div>
    </div>
  );
}
