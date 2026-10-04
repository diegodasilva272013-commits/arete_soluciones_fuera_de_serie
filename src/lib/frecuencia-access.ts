import { createSupabaseAdminClient } from './supabase-server';

/**
 * Roles habilitados para Frecuencia — vive en frecuencia_knowledge_blocks
 * (clave 'frecuencia_roles_habilitados'), nunca hardcodeado. Habilitar
 * a 'student' más adelante es agregarlo a esa lista desde el admin,
 * sin tocar código.
 *
 * FALLA CERRADA: si no se puede leer la config (tabla inexistente, fila
 * sin seedear, cualquier error), NO hay una lista por default escrita acá
 * — solo admin pasa, y se loguea el error para que quede visible en los
 * logs de Vercel. Una falla de config nunca puede ampliar el acceso.
 */
export async function getFrecuenciaRolesHabilitados(): Promise<string[] | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await (admin as any)
      .from('frecuencia_knowledge_blocks')
      .select('valor')
      .eq('clave', 'frecuencia_roles_habilitados')
      .maybeSingle();

    if (error) {
      console.error('[frecuencia-access] error leyendo frecuencia_knowledge_blocks — falla cerrada (solo admin):', error.message);
      return null;
    }
    if (Array.isArray(data?.valor)) return data.valor as string[];

    console.error('[frecuencia-access] frecuencia_knowledge_blocks sin fila "frecuencia_roles_habilitados" — falla cerrada (solo admin)');
    return null;
  } catch (err) {
    console.error('[frecuencia-access] excepción leyendo config — falla cerrada (solo admin):', err);
    return null;
  }
}

export async function tieneAccesoFrecuencia(role: string | null | undefined): Promise<boolean> {
  if (!role) return false;
  const habilitados = await getFrecuenciaRolesHabilitados();
  if (habilitados === null) return role === 'admin'; // falla cerrada
  return habilitados.includes(role);
}
