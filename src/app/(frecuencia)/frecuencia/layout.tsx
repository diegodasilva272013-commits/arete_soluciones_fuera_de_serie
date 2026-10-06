import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { dialDeHoy } from '@/lib/frecuencia-dial-hoy';
import { ShellFrecuencia } from './_shell';
import { FondoVivo } from './_fondo-vivo';
import { HeaderFrecuencia } from './_header';
import { ContenidoConDock } from './_contenido-con-dock';
import { Dock } from './_dock';
import s from './_shell.module.css';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '700', '800', '900'], variable: '--f-display', display: 'swap' });
const spectral = Spectral({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--f-texto', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono', display: 'swap' });

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Shell inmersivo de Frecuencia. Vive en su propio grupo de rutas,
 * (frecuencia), fuera de (private): no carga el AppShell de la
 * plataforma (sidebar + barra superior), así que la app ocupa toda la
 * pantalla con su header mínimo, su fondo vivo y su dock. La URL sigue
 * siendo /frecuencia.
 *
 * Lo que (private) aportaba y Frecuencia sí necesita está acá: no
 * indexar y el chequeo de sesión + rol (defensa en profundidad además
 * del middleware, que protege /frecuencia por URL, no por carpeta).
 */
export default async function FrecuenciaLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentUserContext();
  const permitido = await tieneAccesoFrecuencia(ctx?.role);
  if (!ctx || !permitido) redirect('/dashboard');

  const dialHoy = await dialDeHoy(ctx.userId);

  return (
    <div className={`${montserrat.variable} ${spectral.variable} ${mono.variable} ${s.raiz}`}>
      <ShellFrecuencia dialHoy={dialHoy}>
        <FondoVivo />
        <HeaderFrecuencia />
        <ContenidoConDock>{children}</ContenidoConDock>
        <Dock />
      </ShellFrecuencia>
    </div>
  );
}
