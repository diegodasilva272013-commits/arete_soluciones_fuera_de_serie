import { ORDEN_PASOS, type PasoOnboarding } from '@/types/frecuencia';

export const PASOS_WIZARD = ORDEN_PASOS.filter((p) => p !== 'completo') as Exclude<PasoOnboarding, 'completo'>[];

export function esPasoValido(paso: string): paso is Exclude<PasoOnboarding, 'completo'> {
  return (PASOS_WIZARD as string[]).includes(paso);
}

export function siguienteRuta(paso: Exclude<PasoOnboarding, 'completo'>): string {
  const i = PASOS_WIZARD.indexOf(paso);
  const siguiente = PASOS_WIZARD[i + 1];
  return siguiente ? `/frecuencia/onboarding/${siguiente}` : '/frecuencia/onboarding/completo';
}

export function anteriorRuta(paso: Exclude<PasoOnboarding, 'completo'>): string | null {
  const i = PASOS_WIZARD.indexOf(paso);
  const anterior = PASOS_WIZARD[i - 1];
  return anterior ? `/frecuencia/onboarding/${anterior}` : null;
}

export function indiceDe(paso: Exclude<PasoOnboarding, 'completo'>): number {
  return PASOS_WIZARD.indexOf(paso);
}
