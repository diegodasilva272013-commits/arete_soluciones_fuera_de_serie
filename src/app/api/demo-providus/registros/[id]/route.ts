/**
 * DEMO PROVIDUS — baja lógica de un registro (la B del ABM). No borra la fila:
 * marca eliminado = true. Una promotora solo puede dar de baja lo que cargó ella;
 * administración puede dar de baja cualquiera.
 */

import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { db, falla } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const sesion = sesionActual();
  if (!sesion) return falla('sesion', 401, 'Tu sesión venció. Volvé a ingresar.');
  if (sesion.t === 'v') return falla('sin_permiso', 403, 'Un vendedor no puede dar de baja registros.');
  if (!UUID.test(params.id)) return falla('id_invalido', 400, 'El identificador no es válido.');
  try {
    let q = db().from('demo_providus_registros').update({ eliminado: true }).eq('id', params.id);
    if (!esAdmin(sesion) && sesion.t === 'p') q = q.eq('promotora_id', sesion.id); // solo lo suyo
    const { data, error } = await q.select('id');
    if (error) {
      console.error('[demo-providus] no se pudo dar de baja', error.message);
      return falla('base', 502, `No se pudo dar de baja: ${error.message}`);
    }
    if (!data?.length) return falla('no_existe', 404, 'Ese registro no existe o no es tuyo.');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[demo-providus] baja falló', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'El servidor no pudo completar la baja.');
  }
}

/**
 * Reasigna el lead a otro vendedor (o lo deja sin asignar con `vendedor_id: null`). Solo administración.
 * No vuelve a pedir la llamada del asistente: esa se pide una sola vez, al entrar el lead.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  if (!UUID.test(params.id)) return falla('id_invalido', 400, 'El identificador no es válido.');
  let b: { vendedor_id?: unknown };
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  try {
    const admin = db();
    if (b.vendedor_id === null) {
      const { data, error } = await admin.from('demo_providus_registros').update({ vendedor_id: null, vendedor_nombre: null, asignado_en: null, contacto_estado: 'nuevo', contacto_en: null }).eq('id', params.id).select('id').maybeSingle();
      if (error) return falla('base', 502, `No se pudo reasignar: ${error.message}`);
      return data ? NextResponse.json({ ok: true, vendedor_id: null, vendedor_nombre: null }) : falla('no_existe', 404, 'Ese registro no existe.');
    }
    if (typeof b.vendedor_id !== 'string' || !UUID.test(b.vendedor_id)) return falla('vendedor', 422, 'Elegí un vendedor.');
    const { data: v, error: ev } = await admin.from('demo_providus_vendedores').select('id, nombre, apellido, activo').eq('id', b.vendedor_id).maybeSingle();
    if (ev) return falla('base', 502, `No se pudo leer el vendedor: ${ev.message}`);
    if (!v || !v.activo) return falla('vendedor', 422, 'Ese vendedor no existe o está desactivado.');
    const nombre = `${v.nombre} ${v.apellido}`.trim();
    const { data, error } = await admin.from('demo_providus_registros').update({ vendedor_id: v.id, vendedor_nombre: nombre, asignado_en: new Date().toISOString(), contacto_estado: 'nuevo', contacto_en: null }).eq('id', params.id).select('id').maybeSingle();
    if (error) return falla('base', 502, `No se pudo reasignar: ${error.message}`);
    return data ? NextResponse.json({ ok: true, vendedor_id: v.id, vendedor_nombre: nombre }) : falla('no_existe', 404, 'Ese registro no existe.');
  } catch (e) {
    console.error('[demo-providus] reasignar falló', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'El servidor no pudo reasignar.');
  }
}
