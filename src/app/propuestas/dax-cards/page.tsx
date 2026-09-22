import { cookies } from 'next/headers';
import { DaxCardsClient } from './_client';

export const metadata = {
  title: 'Propuesta — Dax Cards',
  robots: 'noindex,nofollow',
};

export default function DaxCardsPage() {
  const jar       = cookies();
  const hasClave  = !!process.env.PROPUESTA_DAX_CLAVE;
  // Si no hay env var configurada → modo preview (Diego ve el diseño sin clave)
  // Si hay env var → requiere cookie válida
  const unlocked  = !hasClave || jar.get('propuesta-dax')?.value === 'ok';
  const agentId   = process.env.ELEVENLABS_DAX_AGENT_ID ?? '';

  return <DaxCardsClient unlocked={unlocked} agentId={agentId} />;
}
