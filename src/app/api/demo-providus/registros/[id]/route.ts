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
