/**
 * Mensajes de voz del chat de Frecuencia: recibe el audio grabado por la persona
 * y devuelve el texto. Sesión obligatoria y mismo control de acceso que el chat.
 * La clave de OpenAI vive solo acá, en el servidor.
 */

import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { ErrorVoz, reservarVoz, transcribir } from '@/lib/frecuencia/voz/openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const MIN_BYTES = 1200; // por debajo de esto no hay voz, es un toque sin querer

function error(codigo: string, status: number) {
  return NextResponse.json({ error: codigo }, { status });
}

export async function POST(req: Request) {
  const ctx = await getCurrentUserContext();
  if (!ctx || !(await tieneAccesoFrecuencia(ctx.role))) return error('sin_acceso', 403);
  if (!reservarVoz(ctx.userId, 'transcribir', 40)) return error('limite', 429);

  let archivo: File | null = null;
  try {
    const f = (await req.formData()).get('audio');
    archivo = f instanceof File ? f : null;
  } catch {
    return error('pedido_invalido', 400);
  }
  if (!archivo) return error('pedido_invalido', 400);
  if (archivo.size > MAX_BYTES) return error('audio_largo', 413);
  if (archivo.size < MIN_BYTES) return error('sin_voz', 422);
  const tipo = archivo.type || 'audio/webm';
  if (!/^(audio|video)\//.test(tipo)) return error('pedido_invalido', 400);

  try {
    const texto = await transcribir(await archivo.arrayBuffer(), tipo);
    if (!texto) return error('sin_voz', 422);
    return NextResponse.json({ texto: texto.slice(0, 2000) });
  } catch (e) {
    if (e instanceof ErrorVoz) return error(e.codigo === 'sin_clave' ? 'sin_clave' : 'proveedor', e.codigo === 'sin_clave' ? 503 : 502);
    return error('proveedor', 502);
  }
}
