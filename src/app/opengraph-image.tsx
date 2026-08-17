import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Areté Soluciones — Fuera de Serie';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#050505',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Fondo: gradiente azul radial */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(26,111,255,0.18) 0%, rgba(5,5,5,0) 70%)',
          }}
        />

        {/* Línea azul izquierda */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 72,
            bottom: 72,
            width: 2,
            background: 'linear-gradient(180deg, #1a6fff 0%, rgba(26,111,255,0) 100%)',
          }}
        />

        {/* Marca arriba */}
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 104,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            Areté Soluciones
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#1a6fff',
            }}
          >
            Fuera de Serie
          </span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            marginBottom: 20,
            paddingLeft: 24,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(26,111,255,0.9)',
            display: 'flex',
          }}
        >
          Comunidad privada de alto rendimiento
        </div>

        {/* Headline */}
        <div
          style={{
            paddingLeft: 24,
            fontSize: 72,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 40,
          }}
        >
          <span>Domina el arte de</span>
          <span>
            solucionar{' '}
            <span style={{ color: '#1a6fff' }}>problemas</span>
          </span>
        </div>

        {/* CTA strip */}
        <div
          style={{
            paddingLeft: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
        >
          <span
            style={{
              background: '#1a6fff',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '14px 32px',
              display: 'flex',
            }}
          >
            Entrar a la comunidad
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                background: '#1a6fff',
                display: 'flex',
                borderRadius: 1,
              }}
            />
            camino-al-closing.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
