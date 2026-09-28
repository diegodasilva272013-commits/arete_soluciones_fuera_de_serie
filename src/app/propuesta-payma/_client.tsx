'use client';

import { HeroSection } from './_hero/HeroSection';
import { Proposal } from './_content/Proposal';
import s from './payma.module.css';

type Etapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; etapas: Etapa[] };

export function PaymaClient({ markdown, hero }: { markdown: string; hero: HeroContent }) {
  return (
    <div className={s.page}>
      <HeroSection hero={hero} />
      <Proposal markdown={markdown} />
      <footer className={s.footer}>Areté Soluciones — aretesoluciones.space</footer>
    </div>
  );
}
