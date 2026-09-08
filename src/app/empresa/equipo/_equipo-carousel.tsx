'use client';

import { useEffect, useState } from 'react';
import ArcFlowCarousel, { type SmoothSliderItem } from '@/components/ui/arc-flow-carousel';

/**
 * El carrusel calcula su geometria (radio, alto de la tarjeta, offset
 * vertical) a partir del ancho del contenedor — valores pensados para
 * pantallas anchas. En un celular angosto eso empuja las tarjetas muy
 * abajo dentro de su propia seccion, dejando un bloque negro enorme
 * entre el titulo de arriba y las fotos. arcOffset mas chico sube las
 * tarjetas dentro de esa misma seccion; mismo patron responsive que ya
 * usa el menu circular (window.innerWidth + resize).
 */
export function EquipoCarousel({ items }: { items: SmoothSliderItem[] }) {
  const [arcOffset, setArcOffset] = useState(0.5);

  useEffect(() => {
    const update = () => setArcOffset(window.innerWidth < 640 ? 0.16 : 0.5);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <ArcFlowCarousel
      items={items}
      surfaceColor="#050505"
      radiusRatio={0.85}
      cardRatio={0.21}
      maxCardWidth={320}
      cardAspect={0.62}
      overlap={-0.04}
      arcOffset={arcOffset}
      smoothing={5.5}
      dragSensitivity={1.2}
      momentum={1}
      snap
      wheelControl="horizontal"
      autoRotateSpeed={0.12}
      pauseOnHover
    />
  );
}
