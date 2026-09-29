'use client';

import { ArrowRight, Bath, BedDouble, Expand, MapPin, Sparkles, Phone } from 'lucide-react';
import { PerspectiveFlipCard } from '@/components/ui/card-14';

// Ejemplo de cómo se va a ver la ficha de cada propiedad en la web de Payma
// (sección "03 — La web de propiedades" de la propuesta). Es una propiedad
// de ejemplo para mostrar el formato de la card — no es una propiedad real
// del catálogo de Payma. La foto es un cuadro del mismo recorrido del hero.

const IMG = '/propuesta-payma/card-demo-villa.jpg';

function Front() {
  return (
    <div className="size-full flex flex-col [transform-style:preserve-3d]">
      <div className="relative h-64 w-full [transform-style:preserve-3d] [transform:translateZ(50px)]">
        <div className="absolute inset-0 rounded-xl bg-muted overflow-hidden border border-border/50">
          <img
            src={IMG}
            alt="Casa en San Vicente, Misiones — ejemplo"
            className="h-full w-full object-cover transition duration-700 group-hover/p-card:scale-110"
          />
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border text-[11px] font-medium tracking-tight text-foreground shadow-lg [transform:translateZ(80px)]">
          <Sparkles className="size-3.5 text-primary" />
          <span>Disponible</span>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-grow p-6 py-8 [transform-style:preserve-3d]">
        <div className="space-y-2 [transform-style:preserve-3d] [transform:translateZ(60px)]">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="size-4" />
            <span>Ejemplo de ficha</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground transition duration-300 group-hover/p-card:text-primary leading-tight">
            Casa con pileta y vista a la selva
          </h3>
          <p className="text-[15px] font-medium text-muted-foreground flex items-center gap-1.5 leading-none mt-2">
            <MapPin className="size-4 text-primary" />
            San Vicente, Misiones
          </p>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground [transform:translateZ(40px)]">
          <span className="group-hover/p-card:text-primary group-hover/p-card:translate-x-1 transition-all">
            Pasá el mouse para ver más
          </span>
          <ArrowRight className="size-4 group-hover/p-card:text-primary" />
        </div>
      </div>
    </div>
  );
}

function Back() {
  return (
    <div className="size-full flex flex-col items-center justify-center [transform-style:preserve-3d]">
      <div className="mb-10 w-full [transform-style:preserve-3d] flex justify-center gap-4">
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/80 border border-border/50 [transform:translateZ(130px)] min-w-[90px] [transform-style:preserve-3d]">
          <div className="p-2 rounded-xl bg-card border border-border text-primary [transform:translateZ(20px)] shadow-sm">
            <BedDouble className="size-6" />
          </div>
          <p className="text-[11px] font-bold [transform:translateZ(10px)] tracking-tight">4 dorm.</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/80 border border-border/50 [transform:translateZ(160px)] min-w-[90px] [transform-style:preserve-3d]">
          <div className="p-2 rounded-xl bg-card border border-border text-primary [transform:translateZ(25px)] shadow-sm">
            <Bath className="size-6" />
          </div>
          <p className="text-[11px] font-bold [transform:translateZ(10px)] tracking-tight">3 baños</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/80 border border-border/50 [transform:translateZ(130px)] min-w-[90px] [transform-style:preserve-3d]">
          <div className="p-2 rounded-xl bg-card border border-border text-primary [transform:translateZ(20px)] shadow-sm">
            <Expand className="size-6" />
          </div>
          <p className="text-[11px] font-bold [transform:translateZ(10px)] tracking-tight">280 m²</p>
        </div>
      </div>

      <div className="space-y-3 [transform-style:preserve-3d] px-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground [transform:translateZ(80px)]">
          Así se ve cada ficha
        </h3>
        <p className="text-[13px] font-medium text-muted-foreground leading-relaxed [transform:translateZ(40px)] max-w-[280px] mx-auto">
          Fotos, características y ubicación de un lado; el botón de contacto directo con el agente, del otro.
        </p>
      </div>

      <div className="mt-8 [transform-style:preserve-3d] w-full px-6">
        <button className="h-11 w-full rounded-xl bg-primary text-primary-foreground text-xs font-bold tracking-wider shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.03] active:scale-95 [transform:translateZ(100px)]">
          <Phone className="mr-2 size-3.5 inline-block" />
          Consultar esta propiedad
        </button>
      </div>
    </div>
  );
}

export function PropertyCardDemo() {
  return <PerspectiveFlipCard front={<Front />} back={<Back />} />;
}
