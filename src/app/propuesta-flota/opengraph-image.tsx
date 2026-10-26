import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/app/empresa/_seo';

export const runtime = 'edge';
export const alt = 'Plataforma integral Panamericano — Propuesta de Areté Soluciones';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Imagen que se ve al compartir el link de la propuesta por WhatsApp/email.
// Marca pública "Areté Soluciones", mismos colores que la card de Payma.
async function aDataUrl(path: string): Promise<string> {
  try {
    const res = await fetch(`${SITE_URL}${path}`);
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
  } catch {
    return '';
  }
}

export default async function OgImage() {
  const [logoArete, logoPana] = await Promise.all([aDataUrl('/LOGO_ARETE.png'), aDataUrl('/propuesta-flota/panamericano-logo.png')]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginBottom: 36 }}>
            {logoPana && <img src={logoPana} height={84} style={{ objectFit: 'contain' }} />}
            <div style={{ fontSize: 28, color: 'rgba(242,239,233,0.5)', display: 'flex' }}>×</div>
            {logoArete && <img src={logoArete} width={84} height={84} style={{ objectFit: 'contain' }} />}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#2F7BF6', marginBottom: 24, display: 'flex' }}>
            Propuesta · Panamericano de Jujuy S.A.
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, color: '#F2EFE9', letterSpacing: '-0.03em', textAlign: 'center', lineHeight: 1.1, marginBottom: 20, display: 'flex' }}>
            Plataforma integral Panamericano
          </div>
          <div style={{ width: 48, height: 2, background: 'rgba(47,123,246,0.5)', marginBottom: 24, display: 'flex' }} />
          <div style={{ fontSize: 24, color: 'rgba(242,239,233,0.6)', textAlign: 'center', display: 'flex' }}>
            Web, atención con IA y control de flota, con equipos GPS propios
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
