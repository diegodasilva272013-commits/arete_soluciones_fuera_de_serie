import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';
import { CorpHeader } from '@/app/empresa/_header';
import { CorpFooter } from '@/app/empresa/_footer';
import { WhatsAppFloat } from '@/app/empresa/_whatsapp';
import { ElevenLabsWidget } from '@/components/ui/elevenlabs-widget';
import { SEO_FDS, SITE_URL } from '@/app/empresa/_seo';

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
    default: SEO_FDS.hub.title,
    template: '%s — Areté Fuera de Serie',
  },
  description: SEO_FDS.hub.description,
  openGraph: {
    type: 'website',
    siteName: 'Areté Fuera de Serie',
    locale: 'es_AR',
    url: `${SITE_URL}/fuera-de-serie`,
  },
};

export default function FueraDeSerie({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
