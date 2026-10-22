/** Login de vendedores (usuario + clave). Devuelve el vendedor con su zona. */
import { NextResponse } from 'next/server';
import { claveCorrecta, iniciarSesion, permitirIntento } from '@/lib/demo-providus/sesion';
import { COLS_VENDEDOR, db, FALTA_SQL_VENDEDORES, falla, ipDe, tablaFaltante, vendedorPublico } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!permitirIntento(ipDe(req))) return falla('limite', 429, 'Demasiados intentos. Esperá un minuto.');
  let cuerpo: { usuario?: unknown; clave?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return falla('pedido_invalido', 400, 'El envío llegó incompleto.');
  }
  const usuario = typeof cuerpo.usuario === 'string' ? cuerpo.usuario.trim().toLowerCase() : '';
  const clave = typeof cuerpo.clave === 'string' ? cuerpo.clave : '';
  if (!usuario || !clave) return falla('datos', 422, 'Escribí tu usuario y tu clave.');

  try {
    const { data, error } = await db().from('demo_providus_vendedores').select(`${COLS_VENDEDOR}, clave_hash`).eq('usuario', usuario).maybeSingle();
    if (error) {
      if (tablaFaltante(error)) return falla('tabla', 503, FALTA_SQL_VENDEDORES);
      console.error('[demo-providus] login vendedor', error.message);
      return falla('base', 502, `No se pudo consultar: ${error.message}`);
    }
    // Mismo mensaje exista o no el usuario: no se revela cuáles existen.
    if (!data || !data.activo || !(await claveCorrecta(clave, data.clave_hash))) return falla('credenciales', 401, 'Usuario o clave incorrectos.');
    iniciarSesion('v', data.id);
    await db().from('demo_providus_vendedores').update({ ultimo_ingreso: new Date().toISOString() }).eq('id', data.id);
    return NextResponse.json({ ok: true, vendedor: vendedorPublico(data) });
  } catch (e) {
    console.error('[demo-providus] login vendedor falló', e instanceof Error ? e.message : e);
    return falla('servidor', 503, e instanceof Error && /DEMO_PROVIDUS_SECRETO/.test(e.message) ? 'Falta configurar la clave de firma de sesiones en el servidor.' : 'El servidor no pudo iniciar la sesión.');
  }
}
