import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Montserrat, Spectral, JetBrains_Mono } from 'next/font/google';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal } from '@/lib/frecuencia-fecha';
import { FrecuenciaShell } from './_shell';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '700', '800', '900'], variable: '--f-display', display: 'swap' });
const spectral = Spectral({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--f-texto', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--f-mono', display: 'swap' });

// Lo mismo que declaraba (private)/layout.tsx: área privada, fuera de buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Último dial de hoy (mañana o noche, el más reciente) — solo para
 * sintonizar el fondo. Si falla, el fondo queda en el punto medio: nunca
 * rompe la pantalla por esto.
 */
async function frecuenciaDeHoy(userId: string): Promise<number | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: pref } = await (supabase as any)
      .from('frecuencia_preferencias')
      .select('timezone')
      .eq('user_id', userId)
      .maybeSingle();
    const timezone = (pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';
    const { data: dial } = await (supabase as any)
      .from('frecuencia_dial')
      .select('frecuencia')
      .eq('user_id', userId)
      .eq('fecha', fechaLocal(timezone))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return typeof dial?.frecuencia === 'number' ? dial.frecuencia : null;
  } catch {
    return null;
  }
}

/**
 * Layout del grupo (frecuencia). /frecuencia NO hereda (private)/layout.tsx
 * → no hay AppShell (sidebar + topbar de la plataforma): es pantalla
 * completa con su propio shell. Lo que el layout de (private) aportaba y
 * Frecuencia sí necesita está replicado acá:
 *  - robots noindex (metadata, arriba),
 *  - sesión + rol (getCurrentUserContext) y chequeo de acceso server-side
 *    (defensa en profundidad además del middleware, que protege por
 *    pathname y no cambió),
 *  - el aviso de notificaciones push (PushAutoPrompt, dentro del shell).
 * Lo global (globals.css, Inter, SplashLoader, PWARegister) viene del
 * layout raíz, que sigue envolviendo a este grupo.
 */
export default async function FrecuenciaLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentUserContext();
  const permitido = await tieneAccesoFrecuencia(ctx?.role);
  if (!ctx || !permitido) redirect('/dashboard');

  const frecuencia = await frecuenciaDeHoy(ctx.userId);

  return (
    <div
      className={`${montserrat.variable} ${spectral.variable} ${mono.variable} relative min-h-screen bg-[#050505] text-[#F2EFE9]`}
    >
      <FrecuenciaShell frecuenciaInicial={frecuencia}>{children}</FrecuenciaShell>
    </div>
  );
}
