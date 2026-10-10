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
  OnboardingCopy,
  ReglasPlanKB,
  ReglasDecisionKB,
  ReglasDosisKB,
  ReglasFocoKB,
  PasoAnteFalla,
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
/** Palabras y frases de escasez por energía (7.6). Si la clave no existe todavía, la detección queda apagada. */
export const getPalabrasEscasez = () => leerBloque<Record<string, string[]>>('palabras_escasez');
export const getAccionesSubida = () => leerBloque<string[]>('acciones_subida');
export const getMapaEnergiaDefault = () => leerBloque<MapaEnergiaDefault>('mapa_energia_default');
/**
 * onboarding_copy con la forma mínima que necesitan las pantallas. Si la
 * fila viene incompleta (falta un paso, o un paso de varias preguntas no
 * trae su lista), devuelve null: la página falla con un mensaje claro en
 * vez de romper a mitad de un paso o dejar a alguien en un loop.
 */
export async function getOnboardingCopy(): Promise<OnboardingCopy | null> {
  const v = await leerBloque<OnboardingCopy>('onboarding_copy');
  const p = v?.pasos;
  const conGancho = (x: unknown) => !!x && typeof (x as { gancho?: unknown }).gancho === 'string';
  const conPreguntas = (x: unknown) => conGancho(x) && Array.isArray((x as { preguntas?: unknown }).preguntas) && (x as { preguntas: unknown[] }).preguntas.length > 0;
  const valido =
    !!v &&
    Array.isArray(v.intro) &&
    !!p &&
    conGancho(p.dial) &&
    Array.isArray(p.identidad) && p.identidad.length > 0 && p.identidad.every(conGancho) &&
    conGancho(p.no_negociables) &&
    conGancho(p.estandar_minimo) &&
    conGancho(p.ecualizador) &&
    conPreguntas(p.energia) &&
    conPreguntas(p.espejo) &&
    conPreguntas(p.objetivo) &&
    conGancho(p.sin_proposito) &&
    conGancho(p.cierre) &&
    // Lo que el progreso exige para dar el paso por completo tiene que
    // poder preguntarse: si no, la persona quedaría en un loop.
    ['quien_creia_ser', 'quien_soy', 'como_me_ven', 'quien_quiero_ser'].every((k) => p.identidad.some((x) => (x as { key?: string }).key === k)) &&
    p.energia.preguntas.some((x) => x.key === 'hora_despertar') &&
    p.objetivo.preguntas.some((x) => x.key === 'imagen_mental');
  if (!valido) {
    console.error('[frecuencia-kb] onboarding_copy incompleto o con otra forma');
    return null;
  }
  return v;
}
export const getReglasPlan = () => leerBloque<ReglasPlanKB>('reglas_plan');
export const getReglasDecision = () => leerBloque<ReglasDecisionKB>('reglas_decision');
export const getReglasDosis = () => leerBloque<ReglasDosisKB>('reglas_dosis');
export const getReglasFoco = () => leerBloque<ReglasFocoKB>('reglas_foco');
export const getPasosAnteFalla = () => leerBloque<PasoAnteFalla[]>('pasos_ante_falla');
