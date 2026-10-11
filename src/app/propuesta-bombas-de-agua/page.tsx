import { cookies } from 'next/headers';
import { BombasClient } from './_client';

const TITULO = 'Propuesta — Bombas y motores de agua | Areté Soluciones';
const DESCRIPCION = 'Web con catálogo, panel propio y botón de WhatsApp, por Areté Soluciones.';

export const metadata = {
  title: TITULO,
  description: DESCRIPCION,
  robots: 'noindex,nofollow',
  openGraph: { title: TITULO, description: DESCRIPCION },
};

export default function BombasPage() {
  const jar = cookies();
  const hasClave = !!process.env.PROPUESTA_BOMBAS_CLAVE;
  const unlocked = !hasClave || jar.get('propuesta-bombas-de-agua')?.value === 'ok';

  return <BombasClient unlocked={unlocked} />;
}
