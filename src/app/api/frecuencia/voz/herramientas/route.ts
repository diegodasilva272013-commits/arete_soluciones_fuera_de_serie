/**
 * Client tools del agente de VOZ (5.5). El agente de ElevenLabs llama a la herramienta desde el
 * navegador de la persona; el navegador llama a ESTE endpoint, que ejecuta la MISMA capa de
 * herramientas que usa el chat de texto (nunca hay lógica duplicada entre texto y voz).
 * Sesión de la persona, cliente de sesión, sin service role.
 *
 * Armar semana por voz: el servidor no oye a la persona, así que el navegador (que sí recibe la
 * transcripción) manda el hash de la propuesta que mostró y si la persona respondió con un sí; el
 * servidor sigue exigiendo que lo que se guarda sea EXACTAMENTE esa propuesta.
 */

import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { ejecutarHerramienta } from '@/app/(frecuencia)/frecuencia/_ia/ejecutar';
import { NOMBRES_HERRAMIENTAS } from '@/lib/frecuencia/ia/herramientas-def';

export const dynamic = 'force-dynamic';

const enCurso = new Set<string>();

export async function POST(req: Request) {
  const ctx = await getCurrentUserContext();
  if (!ctx || !(await tieneAccesoFrecuencia(ctx.role))) return NextResponse.json({ ok: false, error: 'sin_acceso' }, { status: 403 });
  if (enCurso.has(ctx.userId)) return NextResponse.json({ ok: false, error: 'Estoy terminando lo anterior.' }, { status: 409 });

  let cuerpo: { nombre?: string; argumentos?: unknown; hashMostrado?: string | null; confirmadoPorPersona?: boolean };
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'pedido_invalido' }, { status: 400 });
  }
  if (typeof cuerpo.nombre !== 'string' || !(NOMBRES_HERRAMIENTAS as readonly string[]).includes(cuerpo.nombre)) return NextResponse.json({ ok: false, error: 'Herramienta desconocida.' }, { status: 400 });
  const argumentos = typeof cuerpo.argumentos === 'string' ? cuerpo.argumentos : JSON.stringify(cuerpo.argumentos ?? {});
  if (argumentos.length > 8000) return NextResponse.json({ ok: false, error: 'Argumentos demasiado largos.' }, { status: 400 });

  enCurso.add(ctx.userId);
  try {
    const resultado = await ejecutarHerramienta(cuerpo.nombre, argumentos, {
      hashSemanaMostrada: typeof cuerpo.hashMostrado === 'string' ? cuerpo.hashMostrado : null,
      hayRespuestaPosterior: cuerpo.confirmadoPorPersona === true,
    });
    return NextResponse.json(resultado);
  } catch {
    return NextResponse.json({ ok: false, error: 'No se pudo hacer eso. Probá de nuevo.' });
  } finally {
    enCurso.delete(ctx.userId);
  }
}
