/**
 * DEMO PROVIDUS — el vendedor marca cómo fue el contacto con un lead suyo
 * (nuevo / contactado / sin respuesta). Solo puede tocar los que se le asignaron.
 */
import { NextResponse } from 'next/server';
import { sesionActual } from '@/lib/demo-providus/sesion';
import { db, falla } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ESTADOS = ['nuevo', 'contactado', 'sin_respuesta'] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = sesionActual();
  if (!s || s.t !== 'v') return falla('sesion', 401, 'Ingresá con tu usuario de vendedor.');
  if (!UUID.test(params.id)) return falla('id_invalido', 400, 'El identificador no es válido.');
  let b: { estado?: unknown };
  try {
    b = await req.json();
  } catch {
    return falla('pedido_invalido', 400, 'El envío llegó incompleto.');
  }
  const estado = typeof b.estado === 'string' ? b.estado : '';
  if (!(ESTADOS as readonly string[]).includes(estado)) return falla('estado', 422, 'Estado no válido.');
  try {
    const { data, error } = await db()
      .from('demo_providus_registros')
      .update({ contacto_estado: estado, contacto_en: estado === 'nuevo' ? null : new Date().toISOString() })
      .eq('id', params.id)
      .eq('vendedor_id', s.id) // solo lo suyo
      .select('id, contacto_estado, contacto_en')
      .maybeSingle();
    if (error) {
      console.error('[demo-providus] contacto', error.code, error.message);
      return falla('base', 502, `No se pudo guardar: ${error.message}`);
    }
    if (!data) return falla('no_existe', 404, 'Ese lead no existe o no es tuyo.');
    return NextResponse.json({ ok: true, lead: data });
  } catch (e) {
    console.error('[demo-providus] contacto falló', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'El servidor no pudo guardar el cambio.');
  }
}
