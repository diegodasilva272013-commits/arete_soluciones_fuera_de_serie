import fs from 'node:fs';
import path from 'node:path';
import { PaymaClient } from './_client';

export const dynamic = 'force-static';

type HeroEtapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; etapas: HeroEtapa[] };

function readContent() {
  const root = process.cwd();
  const md = fs.readFileSync(path.join(root, 'content', 'propuesta.md'), 'utf-8');
  const heroRaw = fs.readFileSync(path.join(root, 'content', 'hero.json'), 'utf-8');
  const hero = JSON.parse(heroRaw) as HeroContent;
  return { md, hero };
}

export default function PaymaPage() {
  const { md, hero } = readContent();
  return <PaymaClient markdown={md} hero={hero} />;
}
