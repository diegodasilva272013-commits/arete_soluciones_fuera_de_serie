'use client';

import { ExternalLink } from 'lucide-react';
import {
  InfoCard,
  InfoCardContent,
  InfoCardTitle,
  InfoCardDescription,
  InfoCardMedia,
  InfoCardFooter,
  InfoCardAction,
} from '@/components/ui/info-card';
import * as d from './_content/bombas.data';

// Cards de ejemplo de los productos del catálogo (InfoCard sobre fondo
// oscuro). El degradé inferior de la imagen toma el color de --info-card-bg.
export function ProductosDemo() {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {d.productosDemo.map((p) => (
        <InfoCard
          key={p.nombre}
          className="border-white/10 bg-[#050505] p-4 text-[#F2EFE9] [--info-card-bg:#050505]"
        >
          <InfoCardContent className="gap-1.5">
            <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>
              {p.categoria}
            </span>
            <InfoCardTitle className="mb-0 text-[15px] leading-snug" style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700 }}>
              {p.nombre}
            </InfoCardTitle>
            <InfoCardDescription className="lg:min-h-[80px] text-[13px] leading-5 text-[rgba(242,239,233,0.62)]" style={{ fontFamily: 'var(--f-texto), Spectral, serif' }}>
              {p.descripcion}
            </InfoCardDescription>
            <InfoCardMedia
              shrinkHeight={150}
              expandHeight={230}
              media={[{ src: p.img, alt: p.alt, className: 'h-[230px] border-white/10 object-cover' }]}
            />
            <InfoCardFooter className="pt-2 text-[rgba(242,239,233,0.8)]">
              <InfoCardAction>
                <span className="flex flex-row items-center gap-1 underline">
                  {d.productosDemoAccion} <ExternalLink size={12} />
                </span>
              </InfoCardAction>
            </InfoCardFooter>
          </InfoCardContent>
        </InfoCard>
      ))}
    </div>
  );
}
