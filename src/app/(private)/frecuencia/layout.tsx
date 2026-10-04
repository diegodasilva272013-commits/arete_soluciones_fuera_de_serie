import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Grupo de rutas propio de Frecuencia — chequeo de acceso server-side
 * (defensa en profundidad además del middleware) y su propio fondo,
 * para no depender del layout plano de la plataforma. Todavía nada de
 * efectos acá: eso es la Fase 3 (Dial + Onboarding + Ecualizador).
 */
export default async function FrecuenciaLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCurrentUserContext();
  const permitido = await tieneAccesoFrecuencia(ctx?.role);
  if (!ctx || !permitido) redirect('/dashboard');

  return (
    <div className="-m-4 -mt-6 min-h-screen bg-[#050505] text-[#F2EFE9] lg:-m-10 lg:-mt-8">
      {children}
    </div>
  );
}
