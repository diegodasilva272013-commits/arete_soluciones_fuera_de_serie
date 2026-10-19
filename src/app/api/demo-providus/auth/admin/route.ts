/** Ingreso de administración (central y panel): una sola clave, de variable de entorno. */
import { NextResponse } from 'next/server';
import { claveAdminCorrecta, iniciarSesion, permitirIntento } from '@/lib/demo-providus/sesion';
import { falla, ipDe } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!permitirIntento(ipDe(req))) return falla('limite', 429, 'Demasiados intentos. Esperá un minuto.');
  let cuerpo: { clave?: unknown };
  try {
    cuerpo = await req.json();
  } catch {
    return falla('pedido_invalido', 400, 'El envío llegó incompleto.');
  }
  const clave = typeof cuerpo.clave === 'string' ? cuerpo.clave : '';
  if (!process.env.DEMO_PROVIDUS_ADMIN_CLAVE) return falla('servidor', 503, 'Falta configurar la clave de administración en el servidor.');
  if (!claveAdminCorrecta(clave)) return falla('credenciales', 401, 'Clave incorrecta.');
  try {
    iniciarSesion('a');
  } catch {
    return falla('servidor', 503, 'Falta configurar la clave de firma de sesiones en el servidor.');
  }
  return NextResponse.json({ ok: true });
}
