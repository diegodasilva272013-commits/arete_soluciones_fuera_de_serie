/** DEMO PROVIDUS — lee y guarda la configuración de la plantilla de WhatsApp (tabla demo_providus_config). Solo servidor. */
import { db, tablaFaltante } from './datos';
import { CONFIG_POR_DEFECTO, type ConfigWhatsapp } from './whatsapp';

export const FALTA_SQL_WA = 'Falta correr 0091_demo_providus_whatsapp.sql en Supabase.';

export async function leerConfig(): Promise<{ config: ConfigWhatsapp; guardable: boolean; error: string | null }> {
  const { data, error } = await db().from('demo_providus_config').select('valor').eq('clave', 'whatsapp_plantilla').maybeSingle();
  const guardable = !(error && tablaFaltante(error));
  return { config: { ...CONFIG_POR_DEFECTO, ...((data?.valor as Partial<ConfigWhatsapp> | undefined) ?? {}) }, guardable, error: error && guardable ? error.message : null };
}

export async function guardarConfig(valor: ConfigWhatsapp): Promise<{ ok: true } | { ok: false; tabla: boolean; mensaje: string }> {
  const { error } = await db().from('demo_providus_config').upsert({ clave: 'whatsapp_plantilla', valor, actualizado_en: new Date().toISOString() }, { onConflict: 'clave' });
  if (!error) return { ok: true };
  return { ok: false, tabla: tablaFaltante(error), mensaje: error.message };
}
