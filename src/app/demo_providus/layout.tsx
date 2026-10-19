import type { Metadata, Viewport } from 'next';
import { Archivo, Manrope } from 'next/font/google';
import './demo.css';

// Display: Archivo en ancho expandido (eje wdth), el carácter de las letras del logo.
const display = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--pv-display', display: 'swap' });
// Texto: Manrope, geométrica y cálida, buena a tamaños chicos.
const sans = Manrope({ subsets: ['latin'], variable: '--pv-sans', display: 'swap' });

// Demo en vivo para una reunión: no tiene que aparecer en buscadores.
export const metadata: Metadata = {
  title: { absolute: 'Providus · Demo en vivo' },
  description: 'Demo de captura en el stand.',
  robots: { index: false, follow: false, nocache: true },
};

// La barra del navegador toma el color del fondo.
export const viewport: Viewport = { themeColor: '#1a140d' };

export default function DemoProvidusLayout({ children }: { children: React.ReactNode }) {
  return <div className={`providus-demo ${display.variable} ${sans.variable}`}>{children}</div>;
}
