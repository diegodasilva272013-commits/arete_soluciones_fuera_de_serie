import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { primerPasoIncompleto } from '@/lib/frecuencia-progreso';
import { getAreasVida } from '@/lib/frecuencia-kb';

/**
 * Puerta de entrada: si el onboarding no está completo, manda al
 * primer paso pendiente. Si ya está, al Dial. El layout ya garantizó
 * el acceso por rol — acá solo se decide a dónde ir.
 */
export default async function FrecuenciaPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const areas = (await getAreasVida()) ?? [];
  const paso = await primerPasoIncompleto(ctx.userId, areas.length);

  if (paso === 'completo') redirect('/frecuencia/dial');
  redirect(`/frecuencia/onboarding/${paso}`);
}
