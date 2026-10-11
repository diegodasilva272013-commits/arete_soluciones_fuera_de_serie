'use client';

import { ExternalLink } from 'lucide-react';
import {
  InfoCard,
  InfoCardContent,
  InfoCardTitle,
  InfoCardDescription,
  InfoCardMedia,
  InfoCardFooter,
  InfoCardDismiss,
  InfoCardAction,
} from '@/components/ui/info-card';
import * as d from './_content/bombas.data';

// Cards de ejemplo de los productos del catálogo (InfoCard sobre fondo
// oscuro). Cada card apila 3 fotos del catálogo: la del producto va arriba y
// las otras dos quedan atrás; al pasar el cursor se abren en abanico, la
// card crece y aparece la descripción del producto con las acciones.
export function ProductosDemo() {
  const total = d.productosDemo.length;
  return (
    <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {d.productosDemo.map((p, i) => {
        const atras = [d.productosDemo[(i + 1) % total], d.productosDemo[(i + 2) % total]];
        const media = [...atras, p].map((x) => ({
          src: x.img,
          alt: x.alt,
          className: 'border-white/10 shadow-black/60',
        }));
        return (
          <InfoCard
            key={p.nombre}
            className="border-white/10 bg-[#050505] p-4 text-[#F2EFE9] [--info-card-bg:#050505]"
          >
            <InfoCardContent className="gap-1">
              <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>
                {p.categoria}
              </span>
              <InfoCardTitle className="text-[15px] leading-snug" style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700 }}>
                {p.nombre}
              </InfoCardTitle>
              <InfoCardMedia media={media} shrinkHeight={120} expandHeight={190} />
              <InfoCardFooter className="flex-col gap-3 overflow-hidden pt-3 text-[rgba(242,239,233,0.8)]">
                <InfoCardDescription className="text-[13px] leading-[19px] text-[rgba(242,239,233,0.72)]" style={{ fontFamily: 'var(--f-texto), Spectral, serif' }}>
                  {p.descripcion}
                </InfoCardDescription>
                <div className="flex justify-between text-xs">
                  <InfoCardDismiss>{d.productosDemoCerrar}</InfoCardDismiss>
                  <InfoCardAction>
                    <span className="flex flex-row items-center gap-1 underline">
                      {d.productosDemoAccion} <ExternalLink size={12} />
                    </span>
                  </InfoCardAction>
                </div>
              </InfoCardFooter>
            </InfoCardContent>
          </InfoCard>
        );
      })}
    </div>
  );
}
