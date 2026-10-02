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

// Página para compartir en grupos de WhatsApp — no es parte de la web
// corporativa de Areté Soluciones (/empresa) ni de la plataforma interna
// (/interno): es su propia identidad, Academia Areté Fuera de Serie.
export const metadata: Metadata = {
  title: 'Academia Areté Fuera de Serie — Manual 01',
  description: 'Manual 01: Fundamentos de la Conversación Comercial. Descargá el PDF gratis.',
};

export default function AcademiaFueraDeSerieLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${montserrat.variable} ${spectral.variable} ${mono.variable}`}
      style={{ background: '#050505', minHeight: '100vh', color: '#F2EFE9', WebkitFontSmoothing: 'antialiased' }}
    >
      {children}
    </div>
  );
}
