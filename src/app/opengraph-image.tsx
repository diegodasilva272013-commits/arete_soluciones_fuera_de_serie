import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Areté Soluciones — Fuera de Serie';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  // Fetch logo como base64 para que ImageResponse pueda mostrarlo
  const base = 'https://camino-al-closing.vercel.app';
  let logoSrc: string = '';
  try {
    const res = await fetch(`${base}/Aretea_fuera%20_de_serie_logo.png`);
    const buf = await res.arrayBuffer();
    logoSrc = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
  } catch {
    // Si falla el fetch usamos el icon circular
    try {
      const res = await fetch(`${base}/icon-512.png`);
      const buf = await res.arrayBuffer();
      logoSrc = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
    } catch { /* sin logo */ }
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
        {/* Glow azul de fondo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(26,111,255,0.22) 0%, rgba(5,5,5,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Contenido centrado */}
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
          {/* Logo */}
          {logoSrc && (
            <img
              src={logoSrc}
              width={260}
              height={260}
              style={{ objectFit: 'contain', marginBottom: 32 }}
            />
          )}

          {/* Nombre */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textAlign: 'center',
              marginBottom: 12,
              display: 'flex',
            }}
          >
            Areté Soluciones
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#1a6fff',
              marginBottom: 32,
              display: 'flex',
            }}
          >
            Fuera de Serie
          </div>

          {/* Separador */}
          <div
            style={{
              width: 48,
              height: 2,
              background: 'rgba(26,111,255,0.5)',
              marginBottom: 28,
              display: 'flex',
            }}
          />

          {/* Descripción */}
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              letterSpacing: '0.01em',
              display: 'flex',
            }}
          >
            Comunidad privada de alto rendimiento
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
