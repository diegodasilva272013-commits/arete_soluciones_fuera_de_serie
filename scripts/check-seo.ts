/**
 * check-seo.ts — Validación prebuild de SEO.
 * Correr con: npx tsx scripts/check-seo.ts
 *
 * Verifica que todas las rutas públicas en _seo.ts tengan:
 * - title ≤ 60 chars
 * - description 120–160 chars
 * - canonical absoluto (comienza con NEXT_PUBLIC_SITE_URL)
 * - h1 definido
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
if (!SITE_URL) {
  console.error('❌ NEXT_PUBLIC_SITE_URL no está configurada.');
  process.exit(1);
}

// Importamos en runtime para que SITE_URL ya esté definida
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SEO, SEO_FDS } = require('../src/app/empresa/_seo') as typeof import('../src/app/empresa/_seo');

type SeoEntry = { title: string; description: string; canonical: string; h1: string };

const entries: [string, SeoEntry][] = [
  ...Object.entries(SEO),
  ...Object.entries(SEO_FDS),
] as [string, SeoEntry][];

let errors = 0;

for (const [key, entry] of entries) {
  const { title, description, canonical, h1 } = entry;

  if (!title) {
    console.error(`❌ ${key}: falta title`);
    errors++;
  } else if (title.length > 70) {
    console.warn(`⚠️  ${key}: title muy largo (${title.length} chars): "${title}"`);
  }

  if (!description) {
    console.error(`❌ ${key}: falta description`);
    errors++;
  } else if (description.length < 100 || description.length > 165) {
    console.warn(`⚠️  ${key}: description fuera de rango (${description.length} chars)`);
  }

  if (!canonical) {
    console.error(`❌ ${key}: falta canonical`);
    errors++;
  } else if (!canonical.startsWith(SITE_URL)) {
    console.error(`❌ ${key}: canonical no es absoluta: "${canonical}"`);
    errors++;
  }

  if (!h1) {
    console.error(`❌ ${key}: falta h1`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ check-seo falló con ${errors} error(es). Corregir antes de deployar.`);
  process.exit(1);
} else {
  console.log(`✅ check-seo OK — ${entries.length} páginas validadas.`);
}
