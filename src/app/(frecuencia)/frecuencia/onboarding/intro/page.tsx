import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { getOnboardingCopy } from '@/lib/frecuencia-kb';
import { Intro } from './_intro';

/**
 * Tres pantallas antes del paso 1 (onboarding_copy.intro): qué son las
 * dos radios, por qué importa cuál escuchás y cómo funciona la app.
 */
export default async function IntroOnboardingPage({ searchParams }: { searchParams: { desde?: string } }) {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const textos = await getOnboardingCopy();
  if (!textos?.intro?.length) {
    // Sin intro cargada no se bloquea a nadie: directo al primer paso.
    redirect('/frecuencia/onboarding/dial');
  }

  // Volviendo desde el paso 1 ("Atrás") se cae en la última pantalla de
  // la intro, no hay que pasar las tres de nuevo.
  return <Intro pantallas={textos.intro} empezarAlFinal={searchParams.desde === 'fin'} />;
}
