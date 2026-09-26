import { cookies } from 'next/headers';
import { ProvidusClient } from './_client';

export const metadata = {
  title: 'Propuesta — Providus S.A.',
  robots: 'noindex,nofollow',
};

export default function ProvidusPage() {
  const jar      = cookies();
  const hasClave = !!process.env.PROPUESTA_PROVIDUS_CLAVE;
  const unlocked = !hasClave || jar.get('propuesta-providus')?.value === 'ok';

  return <ProvidusClient unlocked={unlocked} />;
}
