'use server';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { hasValidCJNoaSession } from '@/lib/cjnoa-access';

export type CJNoaMensaje = { from: 'cliente' | 'agente'; texto: string; at: string };

export type CJNoaConsulta = {
  id: string;
  conversation_id: string | null;
  mensaje: string | null;
  mensajes: CJNoaMensaje[];
  nombre_consultante: string | null;
  dni_o_cuil: string | null;
  telefono: string | null;
  rama_consulta: string | null;
  tipo_tramite_previsional: string | null;
  requiere_turno: boolean | null;
  resumen: string | null;
  transcripcion: string | null;
  datos_adicionales: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchCJNoaConsultas(): Promise<CJNoaConsulta[]> {
  const hasAccess = await hasValidCJNoaSession();
  if (!hasAccess) return [];

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const { data } = await supabase
    .from('cjnoa_consultas')
    .select('*')
    .order('updated_at', { ascending: false });

  return (data as CJNoaConsulta[]) ?? [];
}
