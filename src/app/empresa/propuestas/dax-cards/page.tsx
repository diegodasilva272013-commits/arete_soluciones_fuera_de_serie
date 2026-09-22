import { cookies } from 'next/headers';
import { DaxCardsClient } from './_client';

export const metadata = {
  title: 'Propuesta — Dax Cards',
  robots: 'noindex,nofollow',
};

export default function DaxCardsPage() {
  const jar      = cookies();
  const hasClave = !!process.env.PROPUESTA_DAX_CLAVE;
  const unlocked = !hasClave || jar.get('propuesta-dax')?.value === 'ok';

  return <DaxCardsClient unlocked={unlocked} />;
}
