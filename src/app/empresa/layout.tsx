import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';
import { CorpHeader } from './_header';
import { CorpFooter } from './_footer';
import { WhatsAppFloat } from './_whatsapp';
import { ElevenLabsWidget } from '@/components/ui/elevenlabs-widget';
import { SEO, SITE_URL } from './_seo';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '700', '800', '900'],
  variable: '--f-display',
  display: 'swap',
});
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--f-texto',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--f-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aretesoluciones.space'),
  title: {
    default: SEO.home.title,
    template: '%s — Areté Soluciones',
  },
  description: SEO.home.description,
  openGraph: {
    type: 'website',
    siteName: 'Areté Soluciones',
    locale: 'es_AR',
    url: SITE_URL,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Areté Soluciones',
  url: SITE_URL,
  logo: `${SITE_URL}/LOGO_ARETE.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+54-9-11-5828-0808',
    contactType: 'customer service',
    areaServed: 'AR',
    availableLanguage: 'Spanish',
  },
};

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
      />
      <div
        className={`${montserrat.variable} ${spectral.variable} ${mono.variable}`}
        style={{
          background: '#050505',
          minHeight: '100vh',
          color: '#F2EFE9',
          fontFamily: 'var(--f-texto), Georgia, serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <CorpHeader />
        <main style={{ paddingTop: '68px' }}>
          {children}
        </main>
        <CorpFooter />
        <WhatsAppFloat />
        <ElevenLabsWidget />
      </div>
    </>
  );
}
