import { cookies } from 'next/headers';
import { DaxCardsClient } from './_client';

export const metadata = {
  title: 'Propuesta — Dax Cards',
  robots: 'noindex,nofollow',
};

export default function DaxCardsPage() {
  const jar      = cookies();
  const unlocked = jar.get('propuesta-dax')?.value === 'ok';
  const agentId  = process.env.ELEVENLABS_DAX_AGENT_ID ?? '';

  return <DaxCardsClient unlocked={unlocked} agentId={agentId} />;
}
