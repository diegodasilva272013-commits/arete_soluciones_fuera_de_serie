import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './demo.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '800'], variable: '--pv-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--pv-mono', display: 'swap' });

// Demo en vivo para una reunión: no tiene que aparecer en buscadores.
export const metadata: Metadata = {
  title: { absolute: 'Providus · Demo en vivo' },
  description: 'Demo de captura en el stand.',
  robots: { index: false, follow: false, nocache: true },
};

export default function DemoProvidusLayout({ children }: { children: React.ReactNode }) {
  return <div className={`providus-demo ${inter.variable} ${mono.variable}`}>{children}</div>;
}
