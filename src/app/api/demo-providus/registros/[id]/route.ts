/**
 * DEMO PROVIDUS — baja lógica de un registro (la B del ABM). No borra la fila:
 * marca eliminado = true. Sirve si una promotora carga mal a alguien delante del cliente.
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!UUID.test(params.id)) return NextResponse.json({ ok: false, error: 'id_invalido', detalle: 'El identificador no es válido.' }, { status: 400 });
  try {
    const { data, error } = await (createSupabaseAdminClient() as any)
      .from('demo_providus_registros')
      .update({ eliminado: true })
      .eq('id', params.id)
      .select('id');
    if (error) {
      console.error('[demo-providus] no se pudo dar de baja', error.message);
      return NextResponse.json({ ok: false, error: 'base', detalle: `No se pudo dar de baja: ${error.message}` }, { status: 502 });
    }
    if (!data?.length) return NextResponse.json({ ok: false, error: 'no_existe', detalle: 'Ese registro no existe.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[demo-providus] baja falló', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: 'servidor', detalle: 'El servidor no pudo completar la baja.' }, { status: 503 });
  }
}
