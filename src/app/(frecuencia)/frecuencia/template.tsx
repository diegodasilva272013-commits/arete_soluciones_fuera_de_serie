/**
 * Transición entre pantallas de Frecuencia: "cambiar de sintonía".
 * template.tsx se vuelve a montar en cada navegación dentro de
 * /frecuencia (a diferencia de layout.tsx, que persiste), así que cada
 * pantalla nueva dispara su entrada:
 *  - una línea azul con glow barre el ancho debajo del header (la señal
 *    que se engancha) y se apaga;
 *  - el contenido entra desde un leve desenfoque, como una señal que pasa
 *    de ruido a nítida, con una subida corta.
 *
 * Es animación CSS y no Framer a propósito: sin fill-mode "forwards", al
 * terminar no queda ningún transform/filter en el contenedor. Si quedara
 * (aunque sea blur(0)), rompería los position: fixed de adentro, como el
 * overlay de EN EL AIRE o la barra de progreso del onboarding.
 * Con prefers-reduced-motion no hay animación (_shell.module.css).
 *
 * Nota técnica: en Next 14 el árbol anterior se desmonta antes de montar
 * el siguiente, así que solo se coreografía la ENTRADA.
 */

import s from './_shell.module.css';

export default function FrecuenciaTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className={s.barridoSintonia} aria-hidden />
      <div className={s.entradaPantalla}>{children}</div>
    </>
  );
}
