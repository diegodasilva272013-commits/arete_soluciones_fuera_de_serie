/**
 * Voz del agente: recibe el texto de la respuesta y devuelve el audio (mp3).
 * Sesión obligatoria y mismo control de acceso que el chat.
 */

import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { ErrorVoz, reservarVoz, sintetizar } from '@/lib/frecuencia/voz/openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function error(codigo: string, status: number) {
  return NextResponse.json({ error: codigo }, { status });
}

export async function POST(req: Request) {
  const ctx = await getCurrentUserContext();
  if (!ctx || !(await tieneAccesoFrecuencia(ctx.role))) return error('sin_acceso', 403);
  if (!reservarVoz(ctx.userId, 'hablar', 40)) return error('limite', 429);

  let texto = '';
  try {
    const c = (await req.json()) as { texto?: unknown };
    texto = typeof c.texto === 'string' ? c.texto.trim() : '';
  } catch {
    return error('pedido_invalido', 400);
  }
  if (!texto || texto.length > 4000) return error('pedido_invalido', 400);

  try {
    const audio = await sintetizar(texto);
    return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
  } catch (e) {
    if (e instanceof ErrorVoz) return error(e.codigo === 'sin_clave' ? 'sin_clave' : 'proveedor', e.codigo === 'sin_clave' ? 503 : 502);
    return error('proveedor', 502);
  }
}
