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
      {children}
    </div>
  );
}
