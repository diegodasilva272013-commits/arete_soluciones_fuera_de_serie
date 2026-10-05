import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { Dock } from './_dock';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '700', '800', '900'], variable: '--f-display', display: 'swap' });
const spectral = Spectral({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--f-texto', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono', display: 'swap' });

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Grupo de rutas propio de Frecuencia — chequeo de acceso server-side
 * (defensa en profundidad además del middleware), su propio fondo (no
 * el layout plano de la plataforma) y sus propias fuentes: (private)
 * solo trae Inter, acá hace falta Montserrat/Spectral/JetBrains Mono.
 */
export default async function FrecuenciaLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentUserContext();
  const permitido = await tieneAccesoFrecuencia(ctx?.role);
  if (!ctx || !permitido) redirect('/dashboard');

  return (
    <div
      className={`${montserrat.variable} ${spectral.variable} ${mono.variable} -m-4 -mt-6 min-h-screen bg-[#050505] text-[#F2EFE9] lg:-m-10 lg:-mt-8`}
    >
      {children}
      <Dock />
    </div>
  );
}
