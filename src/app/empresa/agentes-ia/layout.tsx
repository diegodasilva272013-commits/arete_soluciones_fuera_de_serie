import type { Metadata } from 'next';
import { SEO } from '../_seo';

export const metadata: Metadata = {
  title: SEO.agentesIa.title,
  description: SEO.agentesIa.description,
  alternates: { canonical: SEO.agentesIa.canonical },
  openGraph: {
    title: SEO.agentesIa.title,
    description: SEO.agentesIa.description,
    url: SEO.agentesIa.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.agentesIa.title,
    description: SEO.agentesIa.description,
  },
};

export default function AgentesIALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
