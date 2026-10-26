import type { Metadata } from 'next';
import { SEO } from '../_seo';
import hero from './_content/hero.json';
import { InmobiliariasClient } from './_client';

export const metadata: Metadata = {
  title: SEO.inmobiliarias.title,
  description: SEO.inmobiliarias.description,
  alternates: { canonical: SEO.inmobiliarias.canonical },
  openGraph: {
    title: SEO.inmobiliarias.title,
    description: SEO.inmobiliarias.description,
    url: SEO.inmobiliarias.canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.inmobiliarias.title,
    description: SEO.inmobiliarias.description,
  },
};

export default function InmobiliariasPage() {
  return <InmobiliariasClient hero={hero} />;
}
