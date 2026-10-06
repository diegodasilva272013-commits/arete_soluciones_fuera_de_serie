/**
 * Tipos de las tablas frecuencia_* — no están en src/types/database.ts
 * (migración manual 0078, nunca pasó por generación automática). Las
 * consultas a estas tablas van con `(supabase as any)`, mismo patrón
 * que el resto del repo para tablas sin tipo generado.
 */

export interface FrecuenciaIdentidad {
  user_id: string;
  quien_creia_ser: string | null;
  quien_soy: string | null;
  como_me_ven: string | null;
  quien_quiero_ser: string | null;
  no_negociables: string[];
  estandar_minimo: string[];
  updated_at: string;
}

export interface FrecuenciaPreferencias {
  user_id: string;
  timezone: string;
  hora_despertar: string | null; // "HH:MM:SS"
  created_at: string;
  updated_at: string;
}

export interface FrecuenciaFranja {
  tipo: 'profundo' | 'decision' | 'creativo';
  respuesta: string;
}

export interface FrecuenciaMapaEnergia {
  id: string;
  user_id: string;
  franjas: FrecuenciaFranja[];
  fecha_diagnostico: string;
  proximo_rediagnostico: string | null;
  created_at: string;
}

export interface FrecuenciaDial {
  id: string;
  user_id: string;
  fecha: string; // date
  momento: 'manana' | 'noche';
  frecuencia: number; // -100..100
  energias_escasez: Record<string, number>;
  acciones_subida: string[];
  created_at: string;
}

export interface FrecuenciaEspejo {
  id: string;
  user_id: string;
  fecha: string;
  momento: 'manana' | 'noche';
  como_me_veo: string | null;
  como_me_percibo: string | null;
  como_me_siento: string | null;
  foto_storage_path: string | null;
  vestimenta_manana: string | null;
  created_at: string;
}

export interface FrecuenciaArea {
  id: string;
  user_id: string;
  area_key: string;
  nivel_actual: number; // 0..10
  es_palanca: boolean;
  es_manzana_podrida: boolean;
  updated_at: string;
}

export interface FrecuenciaObjetivo {
  id: string;
  user_id: string;
  titulo: string;
  imagen_mental: string | null;
  area_key: string | null;
  fecha_limite: string | null;
  identidad_que_expresa: string | null;
  metas_por_periodo: unknown[];
  created_at: string;
  updated_at: string;
}

export interface FrecuenciaTarea {
  id: string;
  user_id: string;
  objetivo_id: string | null;
  titulo: string;
  protocolo: string[];
  depende_de: string[];
  desbloquea: string[];
  tipo_energia: 'profundo' | 'decision' | 'creativo' | null;
  duracion_min: number | null;
  dosis_actual: number;
  dosis_objetivo: number | null;
  veces_postergada: number;
  created_at: string;
  updated_at: string;
}

export interface FrecuenciaBloque {
  id: string;
  user_id: string;
  tarea_id: string | null;
  tipo: 'NO_NEGOCIABLE' | 'EJECUTAR' | 'ORQUESTAR' | 'IMPREVISTOS';
  inicio: string;
  fin: string;
  estado: 'PROGRAMADO' | 'EN_EL_AIRE' | 'CUMPLIDO' | 'NO_SALIO';
  inicio_real: string | null;
  fin_real: string | null;
  interrupciones: number;
  minutos_reales_foco: number;
  created_at: string;
  updated_at: string;
}

export interface FrecuenciaEvidencia {
  id: string;
  user_id: string;
  bloque_id: string | null;
  fecha: string;
  texto: string;
  tipo: string;
  created_at: string;
}

// ── Formas de frecuencia_knowledge_blocks relevantes a esta fase ──────

export interface AreaVida {
  key: string;
  nombre: string;
}

export interface AreasReglas {
  palanca: string;
  manzana_podrida: string;
  contagio_rapido: string[];
}

export interface EnergiaEscasez {
  key: string;
  nombre: string;
}

export interface MapaEnergiaDefault {
  regla: string;
  relativo_a: string;
  rediagnosticar: string;
}

// Jsonb crudo de frecuencia_knowledge_blocks.reglas_plan — no confundir
// con ReglasPlan de src/lib/frecuencia/plan.ts (los números ya
// derivados que recibe armarSemana).
export interface ReglasPlanKB {
  pre_diseno: string;
  no_negociables_primero: string;
  area_debil: string;
  ejecutar_vs_orquestar: string;
  imprevistos: string;
  prioridad: string;
  imprevistos_porcentaje_dia: number;
}

export interface ReglasDecisionKB {
  decisiones_importantes: string;
  decisiones_dificiles: string;
  umbral_fatiga: { horas_desde_despertar: number };
}

export interface ReglasDosisKB {
  dosis_completa: string;
  habitos_en_oferta: string;
  no_necesito_ser_primero: string;
  dos_minutos_de_dolor: string;
  postergaciones_para_dos_minutos: number;
  umbral_subir_dosis: { semanas: number; cumplimiento_min: number };
  umbral_bajar_dosis: { semanas: number; cumplimiento_max: number };
}

export type ReglasFocoKB = string[];

export interface PasoAnteFalla {
  paso: number;
  nombre: string;
  descripcion: string;
}

// Entrada de frecuencia_identidad.no_negociables: legacy (string plano,
// sin horario — viene del onboarding) o ya agendado desde la pantalla
// Semana. Se normaliza siempre con normalizarNoNegociables().
export interface NoNegociableGuardado {
  texto: string;
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo' | null;
  horaInicio: string | null;
  horaFin: string | null;
}

/**
 * Texto del onboarding (frecuencia_knowledge_blocks['onboarding_copy']).
 * Todos los campos son opcionales menos `gancho`: si un campo no viene,
 * ese bloque simplemente no se muestra.
 */
export interface PantallaCopy {
  kicker?: string;
  gancho: string;
  razon?: string;
  pregunta?: string;
  ejemplo?: string;
  placeholder?: string;
  ayuda?: string;
  cta?: string;
}

export interface PreguntaCopy {
  key: string;
  pregunta: string;
  ejemplo?: string;
  ayuda?: string;
  placeholder?: string;
}

export interface OnboardingCopy {
  intro: PantallaCopy[];
  pasos: {
    dial: PantallaCopy;
    identidad: (PantallaCopy & { key: string })[];
    no_negociables: PantallaCopy;
    estandar_minimo: PantallaCopy;
    ecualizador: PantallaCopy & { palanca?: string; manzana_podrida?: string };
    energia: PantallaCopy & { sin_saber?: string; preguntas: PreguntaCopy[] };
    espejo: PantallaCopy & { preguntas: PreguntaCopy[] };
    objetivo: PantallaCopy & { preguntas: PreguntaCopy[] };
    sin_proposito: PantallaCopy;
    cierre: PantallaCopy;
  };
}

export type PasoOnboarding =
  | 'dial'
  | 'identidad'
  | 'no_negociables'
  | 'ecualizador'
  | 'energia'
  | 'espejo'
  | 'objetivo'
  | 'completo';

export const ORDEN_PASOS: PasoOnboarding[] = [
  'dial',
  'identidad',
  'no_negociables',
  'ecualizador',
  'energia',
  'espejo',
  'objetivo',
  'completo',
];
