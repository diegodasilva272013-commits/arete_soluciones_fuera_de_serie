import type { Metadata } from 'next';
import { SEO } from '../_seo';

export const metadata: Metadata = {
  title: { absolute: SEO.agentesIa.title },
  description: SEO.agentesIa.description,
  alternates: { canonical: SEO.agentesIa.canonical },
};

export default function AgentesIALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
