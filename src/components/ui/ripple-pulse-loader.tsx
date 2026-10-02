import Image from 'next/image';
import s from './ripple-pulse-loader.module.css';

/** Loader de ondas concéntricas con el logo quieto en el centro.
 *  Adaptado del snippet pegado por el usuario: se corrigió el bug
 *  class -> className (no compila en JSX/TSX) y se reconstruyó el
 *  CSS base que faltaba (el original solo traía los @keyframes). */
export const Component = () => {
  return (
    <div className={s.loader}>
      <div className={`${s.box} ${s.logoBox}`}>
        <div className={s.logo}>
          <Image
            src="/arete-fuera-de-serie-logo.png"
            alt="Areté Fuera de Serie"
            width={480}
            height={480}
            priority
          />
        </div>
      </div>
      <div className={s.box}></div>
      <div className={s.box}></div>
      <div className={s.box}></div>
      <div className={s.box}></div>
    </div>
  );
};
