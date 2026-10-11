import { createSupabaseServerClient } from '@/lib/supabase-server';
import { leerBloqueGenerico } from '@/lib/frecuencia-kb';

export interface CriterioFila {
  id: string;
  user_id: string;
  equipo_id: string | null;
  ambito: 'personal' | 'equipo';
  titulo: string;
  que_se_decide: string;
  que_entra: string | null;
  que_no_entra: string | null;
  costo_si_sale_mal: string | null;
  reversible: boolean;
  tiempo_reversibilidad: string | null;
  quien_asume_responsabilidad: string | null;
}

export interface GuiaCriterio {
  regla: string | null;
  test: string | null;
  noDelegable: string[];
  responsabilidad: string | null;
}

export const COLUMNAS_CRITERIO = 'id, user_id, equipo_id, ambito, titulo, que_se_decide, que_entra, que_no_entra, costo_si_sale_mal, reversible, tiempo_reversibilidad, quien_asume_responsabilidad';

/** Lo que dice el método (frecuencia_knowledge_blocks.criterio). Si falta, la pantalla igual funciona. */
export async function guiaDelCriterio(): Promise<GuiaCriterio> {
  const v = await leerBloqueGenerico<{ regla?: string; test?: string; no_delegable?: string[]; responsabilidad?: string }>('criterio');
  return {
    regla: typeof v?.regla === 'string' ? v.regla : null,
    test: typeof v?.test === 'string' ? v.test : null,
    noDelegable: Array.isArray(v?.no_delegable) ? v!.no_delegable!.filter((x) => typeof x === 'string') : [],
    responsabilidad: typeof v?.responsabilidad === 'string' ? v.responsabilidad : null,
  };
}

/** Los criterios que la RLS deja ver: los propios y los que me delegaron (solo lectura). */
export async function criteriosVisibles(userId: string): Promise<{ propios: CriterioFila[]; recibidos: CriterioFila[] }> {
  const supabase = createSupabaseServerClient() as any;
  const { data } = await supabase.from('frecuencia_criterios').select(COLUMNAS_CRITERIO).order('created_at', { ascending: false });
  const todos = (data ?? []) as CriterioFila[];
  return { propios: todos.filter((c) => c.user_id === userId), recibidos: todos.filter((c) => c.user_id !== userId) };
}
