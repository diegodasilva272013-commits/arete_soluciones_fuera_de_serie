import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/app/empresa/_seo';

export const runtime = 'edge';
export const alt = 'Areté Soluciones — Propuesta para Providus S.A.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Misma lógica que la de /propuesta-payma: sin esta card, el link hereda
// el OG del layout raíz (marca "Fuera de Serie", la academia interna),
// que no corresponde en una propuesta comercial que emite Areté Soluciones.
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
            background:
              'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(47,123,246,0.22) 0%, rgba(5,5,5,0) 70%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            zIndex: 1,
          }}
        >
          {logoSrc && (
            <img
              src={logoSrc}
              width={72}
              height={72}
              style={{ objectFit: 'contain', marginBottom: 28 }}
            />
          )}

          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#2F7BF6',
              marginBottom: 24,
              display: 'flex',
            }}
          >
            Propuesta comercial · Areté Soluciones
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              marginBottom: 20,
              display: 'flex',
            }}
          >
            Providus S.A.
          </div>

          <div
            style={{
              width: 48,
              height: 2,
              background: 'rgba(47,123,246,0.5)',
              marginBottom: 24,
              display: 'flex',
            }}
          />

          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              letterSpacing: '0.01em',
              display: 'flex',
            }}
          >
            Plataforma de captación, gestión y venta
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
