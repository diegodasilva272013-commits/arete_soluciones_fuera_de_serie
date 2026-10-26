import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/app/empresa/_seo';

export const runtime = 'edge';
export const alt = 'Areté Soluciones — Software a medida e inteligencia artificial para inmobiliarias';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Imagen que se ve al compartir el link por WhatsApp/email. Marca pública
// "Areté Soluciones", con los mismos colores y estilo que la card de Payma.
export default async function OgImage() {
  let logoSrc: string = '';
  try {
    const res = await fetch(`${SITE_URL}/LOGO_ARETE.png`);
    const buf = await res.arrayBuffer();
    logoSrc = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
  } catch { /* sin logo */ }

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
            background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(47,123,246,0.22) 0%, rgba(5,5,5,0) 70%)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, padding: '0 80px' }}>
          {logoSrc && <img src={logoSrc} width={72} height={72} style={{ objectFit: 'contain', marginBottom: 28 }} />}
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#2F7BF6', marginBottom: 24, display: 'flex' }}>
            Areté Soluciones · Para inmobiliarias
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, color: '#F2EFE9', letterSpacing: '-0.03em', textAlign: 'center', lineHeight: 1.1, marginBottom: 20, display: 'flex' }}>
            No adaptamos tu inmobiliaria a un sistema.
          </div>
          <div style={{ width: 48, height: 2, background: 'rgba(47,123,246,0.5)', marginBottom: 24, display: 'flex' }} />
          <div style={{ fontSize: 24, color: 'rgba(242,239,233,0.6)', textAlign: 'center', display: 'flex' }}>
            Software a medida y agentes de IA, hechos sobre cómo trabaja tu inmobiliaria
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
