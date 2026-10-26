import { FlotaClient } from './_client';

export const metadata = {
  title: 'Propuesta — Panamericano de Jujuy',
  description: 'Web, atención con IA y control de flota en una sola plataforma propia, por Areté Soluciones.',
  robots: 'noindex,nofollow',
  // Imagen estática (no generada al vuelo): WhatsApp la toma siempre, sin arranque en frío.
  openGraph: {
    type: 'website',
    title: 'Propuesta — Panamericano de Jujuy',
    description: 'Web, atención con IA y control de flota en una sola plataforma propia, por Areté Soluciones.',
    url: '/propuesta-flota',
    images: [{ url: '/propuesta-flota/og.png', width: 1200, height: 630, alt: 'Plataforma integral Panamericano — Propuesta de Areté Soluciones' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propuesta — Panamericano de Jujuy',
    description: 'Web, atención con IA y control de flota en una sola plataforma propia, por Areté Soluciones.',
    images: ['/propuesta-flota/og.png'],
  },
};

export default function PropuestaFlotaPage() {
  return <FlotaClient />;
}
