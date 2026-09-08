'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AutoplayVideo } from './_autoplay-video';
import s from './corp.module.css';

/**
 * Video de fondo a pantalla completa para un pageHero, con un parallax
 * sutil ligado al scroll de la ventana (mismo patrón ya probado en el
 * sitio: framer-motion + useScroll sin contenedor propio, nada de
 * scroll-jacking). Reemplaza a la tarjeta flotante que se probó antes
 * para Nosotros — el video es 16:9, pensado para ocupar todo el hero,
 * no para vivir en una tarjeta chica al costado.
 */
export function ParallaxHeroVideo({ src, side = false }: { src: string; side?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['-6%', '10%']);

  return (
    <div ref={ref} className={s.pageHeroBg}>
      <motion.div className={s.pageHeroBgVideoWrap} style={{ y }}>
        <AutoplayVideo src={src} />
      </motion.div>
      <div className={side ? s.pageHeroBgFadeSide : s.pageHeroBgFade} />
    </div>
  );
}
