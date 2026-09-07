import type { Metadata } from 'next';
import { Hero } from '@/components/empresa/home/Hero';
import { Problema } from '@/components/empresa/home/Problema';
import { Metodo } from '@/components/empresa/home/Metodo';
import { DosFrentes } from '@/components/empresa/home/DosFrentes';
import { LaPrueba } from '@/components/empresa/home/LaPrueba';
import { Principios } from '@/components/empresa/home/Principios';
import { CtaFinal } from '@/components/empresa/home/CtaFinal';

// title.absolute corta el template "%s — Areté Soluciones" del layout:
// sin esto el home queda como "Areté Soluciones — Areté Soluciones".
export const metadata: Metadata = {
  title: { absolute: 'Areté Soluciones' },
};

// 9.1 — intro de logo-forming.mp4: el asset no existe todavía. Por regla
// explícita del rediseño ("si el asset no está: entrada directa al hero,
// sin loader falso") se omite entero en vez de construir un loader vacío.

export default function EmpresaHome() {
  return (
    <>
      <Hero />
      <Problema />
      <Metodo />
      <DosFrentes />
      <LaPrueba />
      <Principios />
      <CtaFinal />
    </>
  );
}
