import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aretesoluciones.space';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/empresa/', '/fuera-de-serie/'],
        disallow: [
          '/acceso',
          '/crear-cuenta',
          '/propuestas/',
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
