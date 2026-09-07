import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Areté Soluciones';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG image propia de /empresa — la raíz del sitio (src/app/opengraph-image.tsx,
 * fuera del alcance autorizado de este rediseño) usa el logo y el tagline de
 * "Fuera de Serie", la plataforma interna. Un archivo con este nombre en esta
 * carpeta hace que Next.js lo use para /empresa y todas sus subrutas en vez
 * del de la raíz — es el mecanismo correcto para no heredar esa metadata.
 */
export default async function OgImage() {
  const base = 'https://arete-soluciones-plataforma.vercel.app';
  let logoSrc = '';
  try {
    const res = await fetch(`${base}/LOGO_ARETE.png`);
    const buf = await res.arrayBuffer();
    logoSrc = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
  } catch {
    /* sin logo */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(47,123,246,0.22) 0%, rgba(5,5,5,0) 70%)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          {logoSrc && (
            <img src={logoSrc} width={220} height={220} style={{ objectFit: 'contain', marginBottom: 32 }} />
          )}
          <div style={{ fontSize: 56, fontWeight: 800, color: '#F2EFE9', letterSpacing: '-0.03em', display: 'flex' }}>
            Areté Soluciones
          </div>
          <div
            style={{
              width: 48,
              height: 2,
              background: 'rgba(47,123,246,0.5)',
              margin: '28px 0',
              display: 'flex',
            }}
          />
          <div style={{ fontSize: 22, color: 'rgba(242,239,233,0.5)', textAlign: 'center', display: 'flex' }}>
            Sistemas empresariales que se adaptan a cómo trabaja tu empresa
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
