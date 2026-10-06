import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { primerPasoIncompleto } from '@/lib/frecuencia-progreso';
import { getAreasVida } from '@/lib/frecuencia-kb';

export default async function OnboardingIndexPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const areas = (await getAreasVida()) ?? [];
  const paso = await primerPasoIncompleto(ctx.userId, areas.length);

  redirect(paso === 'completo' ? '/frecuencia/onboarding/completo' : `/frecuencia/onboarding/${paso}`);
}
