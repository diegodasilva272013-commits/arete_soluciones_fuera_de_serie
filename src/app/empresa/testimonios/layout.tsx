import type { Metadata } from 'next';
import { SEO } from '../_seo';

export const metadata: Metadata = {
  title: SEO.testimonios.title,
  description: SEO.testimonios.description,
  alternates: { canonical: SEO.testimonios.canonical },
  openGraph: {
    title: SEO.testimonios.title,
    description: SEO.testimonios.description,
    url: SEO.testimonios.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.testimonios.title,
    description: SEO.testimonios.description,
  },
};

export default function TestimoniosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
