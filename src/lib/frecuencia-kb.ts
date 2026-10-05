/**
 * Lectura de frecuencia_knowledge_blocks con el cliente de sesión del
 * usuario (RLS real, nunca service role — regla 2 de la Fase 3). El
 * contenido del método vive siempre acá: cero strings del método en
 * componentes (regla 1).
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type {
  AreaVida,
  AreasReglas,
  EnergiaEscasez,
  MapaEnergiaDefault,
  PreguntasOnboarding,
} from '@/types/frecuencia';

async function leerBloque<T>(clave: string): Promise<T | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await (supabase as any)
    .from('frecuencia_knowledge_blocks')
    .select('valor')
    .eq('clave', clave)
    .maybeSingle();
  if (error || !data) {
    console.error(`[frecuencia-kb] error leyendo "${clave}":`, error?.message);
    return null;
  }
  return data.valor as T;
}

export const getAreasVida = () => leerBloque<AreaVida[]>('areas_vida');
export const getAreasReglas = () => leerBloque<AreasReglas>('areas_reglas');
export const getEnergiasEscasez = () => leerBloque<EnergiaEscasez[]>('energias_escasez');
export const getAccionesSubida = () => leerBloque<string[]>('acciones_subida');
export const getMapaEnergiaDefault = () => leerBloque<MapaEnergiaDefault>('mapa_energia_default');
export const getPreguntasOnboarding = () => leerBloque<PreguntasOnboarding>('preguntas_onboarding');
