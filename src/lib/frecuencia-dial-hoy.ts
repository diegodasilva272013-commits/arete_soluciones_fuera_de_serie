import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal } from '@/lib/frecuencia-fecha';

/**
 * Frecuencia del Dial de HOY del usuario (-100…100), o null si todavía no
 * hizo check-in. "Hoy" es la fecha en SU timezone (frecuencia_preferencias),
 * nunca la del servidor. Si ya cargó el de la noche, manda ese; si no, el
 * de la mañana. Cliente de sesión (RLS: el dial es solo del dueño).
 * Nunca rompe el layout: ante cualquier error devuelve null.
 */
export async function dialDeHoy(userId: string): Promise<number | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: pref } = await (supabase as any)
      .from('frecuencia_preferencias')
      .select('timezone')
      .eq('user_id', userId)
      .maybeSingle();
    const fecha = fechaLocal(pref?.timezone ?? 'America/Argentina/Buenos_Aires');

    const { data, error } = await (supabase as any)
      .from('frecuencia_dial')
      .select('frecuencia, momento')
      .eq('user_id', userId)
      .eq('fecha', fecha);
    if (error || !data?.length) return null;

    const fila = data.find((d: { momento: string }) => d.momento === 'noche') ?? data[0];
    return typeof fila.frecuencia === 'number' ? fila.frecuencia : null;
  } catch {
    return null;
  }
}
