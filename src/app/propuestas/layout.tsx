import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '700', '800', '900'],
  variable: '--f-display',
  display: 'swap',
});
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--f-texto',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--f-mono',
  display: 'swap',
});

export default function PropuestasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${montserrat.variable} ${spectral.variable} ${mono.variable}`}
      style={{
        background: '#050505',
        minHeight: '100vh',
        color: '#F2EFE9',
        fontFamily: 'var(--f-texto), Spectral, Georgia, serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
    </div>
  );
}
