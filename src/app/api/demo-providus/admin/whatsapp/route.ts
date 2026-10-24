/**
 * DEMO PROVIDUS — plantilla de WhatsApp al cliente. Solo administración.
 *  GET  la plantilla guardada, los WhatsApp conectados (Evolution) y las variables disponibles.
 *  PUT  guarda la plantilla: texto con variables, si se envía sola y desde qué WhatsApp.
 * Nunca devuelve el token de Evolution.
 */
import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { db, falla, tablaFaltante } from '@/lib/demo-providus/datos';
import { CONFIG_POR_DEFECTO, DESCRIPCION_VARIABLES, VARIABLES_WHATSAPP, elegirInstancia, validarPlantilla, type ConfigWhatsapp, type InstanciaEvolution } from '@/lib/demo-providus/whatsapp';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALTA_SQL_WA = 'Falta correr 0091_demo_providus_whatsapp.sql en Supabase.';

/* eslint-disable @typescript-eslint/no-explicit-any */
async function leerTodo() {
  const admin = db();
  const [cfg, ins] = await Promise.all([
    admin.from('demo_providus_config').select('valor').eq('clave', 'whatsapp_plantilla').maybeSingle(),
    admin.from('evolution_instances').select('id, name, instance_key, api_url, api_token, status, phone_number'),
  ]);
  const guardable = !(cfg.error && tablaFaltante(cfg.error));
  const config: ConfigWhatsapp = { ...CONFIG_POR_DEFECTO, ...((cfg.data?.valor as Partial<ConfigWhatsapp> | undefined) ?? {}) };
  const instancias = ((ins.data ?? []) as InstanciaEvolution[]);
  return { guardable, config, instancias, errorInstancias: ins.error ? ins.error.message : null, errorConfig: cfg.error && guardable ? cfg.error.message : null };
}

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  try {
    const t = await leerTodo();
    const efectiva = elegirInstancia(t.instancias, t.config.instancia_id);
    return NextResponse.json({
      ok: true,
      guardable: t.guardable,
      config: t.config,
      instancias: t.instancias.map((i) => ({ id: i.id, name: i.name, status: i.status, phone_number: i.phone_number })),
      instancia_efectiva: efectiva ? { id: efectiva.id, name: efectiva.name, phone_number: efectiva.phone_number } : null,
      variables: VARIABLES_WHATSAPP.map((v) => ({ nombre: v, descripcion: DESCRIPCION_VARIABLES[v] })),
      detalle: t.guardable ? t.errorConfig ?? t.errorInstancias : FALTA_SQL_WA,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[demo-providus] whatsapp GET', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'No se pudo leer la configuración de WhatsApp.');
  }
}

export async function PUT(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  let b: { texto?: unknown; activa?: unknown; instancia_id?: unknown };
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  const errorTexto = validarPlantilla(b.texto);
  if (errorTexto) return falla('texto', 422, errorTexto);
  const instanciaId = typeof b.instancia_id === 'string' && b.instancia_id ? b.instancia_id : null;
  if (instanciaId && !UUID.test(instanciaId)) return falla('instancia', 422, 'El WhatsApp elegido no es válido.');
  try {
    const t = await leerTodo();
    if (!t.guardable) return falla('tabla', 503, FALTA_SQL_WA);
    if (instanciaId && !t.instancias.some((i) => i.id === instanciaId)) return falla('instancia', 422, 'Ese WhatsApp ya no existe.');
    const activa = b.activa === true;
    if (activa && !elegirInstancia(t.instancias, instanciaId)) return falla('instancia', 422, 'Para activar el envío automático tiene que haber un WhatsApp conectado (o elegir uno).');
    const valor: ConfigWhatsapp = { texto: (b.texto as string).trim(), activa, instancia_id: instanciaId };
    const { error } = await db().from('demo_providus_config').upsert({ clave: 'whatsapp_plantilla', valor, actualizado_en: new Date().toISOString() }, { onConflict: 'clave' });
    if (error) return tablaFaltante(error) ? falla('tabla', 503, FALTA_SQL_WA) : falla('base', 502, `No se pudo guardar: ${error.message}`);
    return NextResponse.json({ ok: true, config: valor });
  } catch (e) {
    console.error('[demo-providus] whatsapp PUT', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'No se pudo guardar la plantilla.');
  }
}
