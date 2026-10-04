import { createSupabaseAdminClient } from './supabase-server';

/**
 * Roles habilitados para Frecuencia — vive en knowledge_blocks
 * (clave 'frecuencia_roles_habilitados'), nunca hardcodeado. Habilitar
 * a 'student' más adelante es agregarlo a esa lista desde el admin,
 * sin tocar código.
 */
const DEFAULT_ROLES_HABILITADOS = ['admin', 'setter', 'closer'];

export async function getFrecuenciaRolesHabilitados(): Promise<string[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await (admin as any)
      .from('knowledge_blocks')
      .select('valor')
      .eq('clave', 'frecuencia_roles_habilitados')
      .maybeSingle();
    if (Array.isArray(data?.valor)) return data.valor as string[];
  } catch {
    /* si knowledge_blocks no está disponible, cae al default */
  }
  return DEFAULT_ROLES_HABILITADOS;
}

export async function tieneAccesoFrecuencia(role: string | null | undefined): Promise<boolean> {
  if (!role) return false;
  const habilitados = await getFrecuenciaRolesHabilitados();
  return habilitados.includes(role);
}
