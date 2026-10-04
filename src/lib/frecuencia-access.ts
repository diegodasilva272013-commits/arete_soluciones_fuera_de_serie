import { createSupabaseAdminClient } from './supabase-server';

/**
 * Roles habilitados para Frecuencia — vive en frecuencia_knowledge_blocks
 * (clave 'frecuencia_roles_habilitados'), nunca hardcodeado. Habilitar
 * a 'student' más adelante es agregarlo a esa lista desde el admin,
 * sin tocar código.
 *
 * Si la tabla todavía no existe (migración no corrida) o la fila no
 * está seedeada, cae al default — nunca a lista vacía: una falla acá
 * no puede ser lo que determina quién entra, solo un piso de seguridad.
 */
const DEFAULT_ROLES_HABILITADOS = ['admin', 'setter', 'closer'];

export async function getFrecuenciaRolesHabilitados(): Promise<string[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await (admin as any)
      .from('frecuencia_knowledge_blocks')
      .select('valor')
      .eq('clave', 'frecuencia_roles_habilitados')
      .maybeSingle();
    if (Array.isArray(data?.valor)) return data.valor as string[];
  } catch {
    /* si frecuencia_knowledge_blocks no está disponible, cae al default */
  }
  return DEFAULT_ROLES_HABILITADOS;
}

export async function tieneAccesoFrecuencia(role: string | null | undefined): Promise<boolean> {
  if (!role) return false;
  const habilitados = await getFrecuenciaRolesHabilitados();
  return habilitados.includes(role);
}
