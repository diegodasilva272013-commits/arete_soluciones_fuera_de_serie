import { fechaLocal } from '@/lib/frecuencia-fecha';

/** Primer día del mes actual en la zona horaria de la persona (YYYY-MM-01). Va fuera de _actions.ts ('use server') a propósito. */
export async function mesActual(supabase: any, userId: string): Promise<string> {
  const { data: pref } = await supabase.from('frecuencia_preferencias').select('timezone').eq('user_id', userId).maybeSingle();
  return `${fechaLocal((pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires').slice(0, 7)}-01`;
}
