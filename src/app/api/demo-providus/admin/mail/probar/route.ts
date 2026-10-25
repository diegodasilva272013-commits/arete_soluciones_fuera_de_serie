/**
 * DEMO PROVIDUS — manda UN mail de bienvenida de prueba (con foto de ejemplo) al correo indicado. Solo administración.
 */
import { NextResponse } from 'next/server';
import { esAdmin, permitirIntento, sesionActual } from '@/lib/demo-providus/sesion';
import { db, falla, ipDe } from '@/lib/demo-providus/datos';
import { enviarMailCliente } from '@/lib/demo-providus/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  if (!permitirIntento(ipDe(req), 6)) return falla('limite', 429, 'Demasiados envíos de prueba seguidos. Esperá un minuto.');
  let b: { correo?: unknown; foto_url?: unknown };
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  const correo = typeof b.correo === 'string' ? b.correo.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return falla('correo', 422, 'El correo no parece válido.');
  let fotoUrl = typeof b.foto_url === 'string' && /^https:\/\//.test(b.foto_url) ? b.foto_url : null;
  if (!fotoUrl) {
    // Sin foto indicada: usa la última foto real cargada en un registro.
    const { data } = await db().from('demo_providus_registros').select('foto_url').not('foto_url', 'is', null).order('creado_en', { ascending: false }).limit(1).maybeSingle();
    fotoUrl = (data?.foto_url as string | undefined) ?? null;
  }
  const r = await enviarMailCliente(correo, { nombre: 'Diego', apellido: 'Da Silva', vendedor: 'Paola', promotora: 'Laura Pérez', evento: 'Expo Rosario', fotoUrl });
  return NextResponse.json({ ok: r.estado === 'enviado', estado: r.estado, detalle: r.estado === 'fallido' ? r.error : null, enviado_a: correo });
}
