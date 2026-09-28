import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';

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

// Ruta no adivinable + noindex: es una propuesta comercial con precios,
// no tiene que aparecer en buscadores ni en el sitemap.
export const metadata: Metadata = {
  title: 'Propuesta — Organización Payma',
  robots: { index: false, follow: false, nocache: true },
};

export default function PaymaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${montserrat.variable} ${spectral.variable} ${mono.variable}`} style={{ background: '#050505' }}>
      {children}
    </div>
  );
}
