import fs from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { PaymaClient } from './_client';

// Sin esto, el link hereda el title/description/OG del layout raíz (la
// academia "Fuera de Serie"), que es lo que aparecía mal en las previews
// de WhatsApp de esta propuesta.
export const metadata = {
  title: 'Propuesta — Organización Payma',
  description: 'Web de propiedades y agentes de inteligencia artificial, por Areté Soluciones.',
  robots: 'noindex,nofollow',
  openGraph: {
    title: 'Propuesta — Organización Payma',
    description: 'Web de propiedades y agentes de inteligencia artificial, por Areté Soluciones.',
  },
};

type HeroEtapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; etapas: HeroEtapa[] };

function readContent() {
  const root = process.cwd();
  const heroRaw = fs.readFileSync(path.join(root, 'content', 'hero.json'), 'utf-8');
  const hero = JSON.parse(heroRaw) as HeroContent;
  return { hero };
}

export default function PaymaPage() {
  const { hero } = readContent();

  const jar = cookies();
  const hasClave = !!process.env.PROPUESTA_PAYMA_CLAVE;
  const unlocked = !hasClave || jar.get('propuesta-payma')?.value === 'ok';

  return <PaymaClient hero={hero} unlocked={unlocked} />;
}
