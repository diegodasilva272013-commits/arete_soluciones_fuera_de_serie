import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { brand } from '@/constants/branding';
import { PWARegister } from '@/components/pwa-register';
import { SplashLoader } from '@/components/splash-loader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arete-soluciones-plataforma.vercel.app'),
  title: {
    default: brand.full,
    template: `%s — ${brand.name}`,
  },
  description: 'Comunidad privada de alto rendimiento para vendedores que solucionan problemas.',
  applicationName: brand.name,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/Aretea_fuera _de_serie_logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/Aretea_fuera _de_serie_logo.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://arete-soluciones-plataforma.vercel.app',
    siteName: brand.name,
    title: brand.full,
    description: brand.description,
    locale: 'es_AR',
    images: [
      {
        url: 'https://arete-soluciones-plataforma.vercel.app/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Areté Soluciones — Fuera de Serie',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: brand.full,
    description: brand.description,
    images: ['https://arete-soluciones-plataforma.vercel.app/opengraph-image'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: brand.name,
  },
};

export const viewport: Viewport = {
  themeColor: brand.colors.background,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-brand-black text-brand-text antialiased">
        <SplashLoader />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
