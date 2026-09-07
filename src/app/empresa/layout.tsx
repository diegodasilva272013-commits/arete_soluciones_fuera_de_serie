import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';
import { CorpHeader } from './_header';
import { CorpFooter } from './_footer';
import { WhatsAppFloat } from './_whatsapp';
import { MotionProvider } from '@/components/empresa/MotionProvider';
import { FilmLayer } from '@/components/empresa/FilmLayer';

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

const EMPRESA_DESCRIPTION =
  'Diseñamos e implementamos sistemas empresariales que se adaptan a la forma real de trabajar de cada empresa.';

export const metadata: Metadata = {
  metadataBase: new URL('https://arete-soluciones-plataforma.vercel.app'),
  title: {
    default: 'Areté Soluciones',
    template: '%s — Areté Soluciones',
  },
  description: EMPRESA_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Areté Soluciones',
    locale: 'es_AR',
  },
  // Excepción de alcance autorizada: sin esto, /empresa hereda el bloque
  // twitter del layout raíz (título y descripción de la plataforma interna
  // "Fuera de Serie" — nada que ver con la web pública de Soluciones).
  twitter: {
    card: 'summary_large_image',
    title: 'Areté Soluciones',
    description: EMPRESA_DESCRIPTION,
  },
};

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
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
      <MotionProvider>
        <FilmLayer />
        <CorpHeader />
        <main style={{ paddingTop: '68px' }}>
          {children}
        </main>
        <CorpFooter />
        <WhatsAppFloat />
      </MotionProvider>
    </div>
  );
}
