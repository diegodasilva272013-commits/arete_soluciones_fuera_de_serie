import Image from 'next/image';
import { Montserrat, JetBrains_Mono } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '700', '800', '900'],
  variable: '--f-display',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--f-mono',
  display: 'swap',
});

export default function ReclutamientoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${montserrat.variable} ${mono.variable}`}
      style={{
        background: '#050505',
        minHeight: '100vh',
        color: '#F2EFE9',
        fontFamily: 'Georgia, "Times New Roman", serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── Header con logo Areté Fuera de Serie ── */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: '64px',
        background: 'rgba(5,5,5,.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,175,55,.12)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
      }}>
        {/* Logo */}
        <Image
          src="/Aretea_fuera _de_serie_logo.png"
          alt="Areté Fuera de Serie"
          width={160}
          height={48}
          style={{ width: 'auto', height: '36px', objectFit: 'contain' }}
          priority
        />

        {/* Separador */}
        <span style={{
          marginLeft: '20px',
          paddingLeft: '20px',
          borderLeft: '1px solid rgba(212,175,55,.2)',
          fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
          fontSize: '9px',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(212,175,55,.55)',
        }}>
          Reclutamiento
        </span>
      </header>

      {/* Contenido — padding-top compensa el header fijo */}
      <div style={{ paddingTop: '64px' }}>
        {children}
      </div>
    </div>
  );
}
