import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, SITE_URL } from './empresa/_seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split('T')[0];
  return PUBLIC_ROUTES.map(({ path, priority, changefreq }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: changefreq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }));
}
