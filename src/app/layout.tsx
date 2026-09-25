import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { brand } from '@/constants/branding';
import { PWARegister } from '@/components/pwa-register';
import { SplashLoader } from '@/components/splash-loader';
import { SITE_URL } from '@/app/empresa/_seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: brand.full,
    template: `%s | ${brand.name}`,
  },
  description: 'Comunidad privada de alto rendimiento para vendedores que solucionan problemas.',
  applicationName: brand.name,
  manifest: '/manifest.json',
  // Favicon/apple-icon: NO se hardcodea acá — Next.js los genera automáticamente
  // a partir de app/icon.png, app/apple-icon.png y app/favicon.ico.
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: brand.name,
    title: brand.full,
    description: brand.description,
    locale: 'es_AR',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
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
    images: [`${SITE_URL}/opengraph-image`],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-brand-black text-brand-text antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
        <SplashLoader />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
