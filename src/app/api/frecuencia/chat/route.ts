/**
 * Chat de texto de Frecuencia (5.4). POST: un mensaje de la persona → la
 * respuesta del agente (con las herramientas que haya usado). Memoria en
 * frecuencia_conversaciones / frecuencia_mensajes (RLS: solo el dueño). La
 * clave de NVIDIA vive solo acá, en el servidor. Cliente de sesión siempre.
 */

import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getModelosIA } from '@/lib/frecuencia-kb';
import { chatCompletion, ErrorIA, type LlamadaHerramienta, type MensajeChat } from '@/lib/frecuencia/ia/nvidia';
import { DEFINICIONES } from '@/lib/frecuencia/ia/herramientas-def';
import { armarHistorial, codificarAsistenteConHerramientas, codificarResultado, estadoPropuestaSemana, mensajesVisibles, type FilaMensaje } from '@/lib/frecuencia/ia/historial';
import { construirContextoAgente } from '@/app/(frecuencia)/frecuencia/_ia/contexto';
import { ejecutarHerramienta } from '@/app/(frecuencia)/frecuencia/_ia/ejecutar';

export const dynamic = 'force-dynamic';

const MAX_MENSAJE = 2000;
const MAX_POR_HORA = 60;
const MAX_VUELTAS = 4;
const MAX_CONVERSACIONES_POR_HORA = 10;

// Un solo pedido a la vez por persona en esta instancia: frena dos envíos simultáneos (doble toque, dos pestañas)
// que podrían duplicar lo que guardan las herramientas. (En varias instancias de servidor es mejor esfuerzo.)
const enCurso = new Set<string>();

function error(codigo: string, status: number) {
  return NextResponse.json({ error: codigo }, { status });
}

export async function POST(req: Request) {
  const ctx = await getCurrentUserContext();
  if (!ctx || !(await tieneAccesoFrecuencia(ctx.role))) return error('sin_acceso', 403);
  if (enCurso.has(ctx.userId)) return error('ocupado', 409);
  enCurso.add(ctx.userId);
  try {
    return await procesar(req, ctx.userId, ctx.role);
  } catch {
    return error('proveedor', 502);
  } finally {
    enCurso.delete(ctx.userId);
  }
}

async function procesar(req: Request, userId: string, role: string): Promise<Response> {
  const ctx = { userId, role };

  let cuerpo: { conversacionId?: string; mensaje?: string; modeloId?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return error('pedido_invalido', 400);
  }
  const mensaje = typeof cuerpo.mensaje === 'string' ? cuerpo.mensaje.trim() : '';
  if (!mensaje || mensaje.length > MAX_MENSAJE) return error('mensaje_invalido', 400);

  const supabase = createSupabaseServerClient();

  // Tope por persona (en la base, vale entre instancias): MAX_POR_HORA mensajes por hora.
  const { count: recientes } = await (supabase as any)
    .from('frecuencia_mensajes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)
    .eq('rol', 'user')
    .gte('created_at', new Date(Date.now() - 3600_000).toISOString());
  if ((recientes ?? 0) >= MAX_POR_HORA) return error('limite_por_hora', 429);
  if (typeof cuerpo.conversacionId !== 'string') {
    const { count: nuevas } = await (supabase as any).from('frecuencia_conversaciones').select('id', { count: 'exact', head: true }).eq('user_id', ctx.userId).gte('created_at', new Date(Date.now() - 3600_000).toISOString());
    if ((nuevas ?? 0) >= MAX_CONVERSACIONES_POR_HORA) return error('limite_por_hora', 429);
  }

  // Modelo: solo los que están en la base; si piden otro, se usa el de por defecto.
  const modelos = await getModelosIA();
  const modelo = modelos.chat.find((m) => m.id === cuerpo.modeloId) ?? modelos.chat.find((m) => m.por_defecto) ?? modelos.chat[0];
  const contexto = await construirContextoAgente(ctx.userId);
  if (!modelo || 'error' in contexto) return error('sin_configuracion', 503);

  // Conversación (la persona solo puede usar la suya: RLS + filtro explícito).
  let conversacionId = typeof cuerpo.conversacionId === 'string' ? cuerpo.conversacionId : null;
  if (conversacionId) {
    const { data: existe } = await (supabase as any).from('frecuencia_conversaciones').select('id').eq('id', conversacionId).eq('user_id', ctx.userId).eq('canal', 'texto').maybeSingle();
    if (!existe) return error('conversacion_inexistente', 404);
  } else {
    const { data: nueva, error: e } = await (supabase as any).from('frecuencia_conversaciones').insert({ user_id: ctx.userId, canal: 'texto' }).select('id').single();
    if (e || !nueva) return error('no_se_pudo_guardar', 500);
    conversacionId = nueva.id as string;
  }

  const guardar = async (rol: FilaMensaje['rol'], contenido: string, modeloId?: string) => {
    const { error: e } = await (supabase as any).from('frecuencia_mensajes').insert({ conversacion_id: conversacionId, user_id: ctx.userId, rol, contenido, modelo: modeloId ?? null });
    if (e) throw new Error('no_se_pudo_guardar');
  };

  // Historial ANTES del mensaje nuevo (para la compuerta de confirmación: "su sí" tiene que ser posterior a la propuesta).
  const { data: previas } = await (supabase as any)
    .from('frecuencia_mensajes')
    .select('rol, contenido, created_at')
    .eq('conversacion_id', conversacionId)
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: true });
  const filas = ((previas ?? []) as FilaMensaje[]).slice();

  await guardar('user', mensaje);
  filas.push({ rol: 'user', contenido: mensaje });

  const acciones: { herramienta: string; ok: boolean; resumen: string; propuesta?: unknown }[] = [];
  let respuesta = '';

  try {
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const mensajes: MensajeChat[] = [{ role: 'system', content: contexto.sistema }, ...armarHistorial(filas)];
      // En la última vuelta se pide la respuesta SIN herramientas, así siempre se explica lo que se hizo.
      const ultima = vuelta === MAX_VUELTAS - 1;
      const r = await chatCompletion({ modelo: modelo.id, mensajes, herramientas: ultima ? undefined : DEFINICIONES });
      if (!r.tool_calls?.length) {
        respuesta = r.content?.trim() || 'Listo.';
        await guardar('assistant', respuesta, modelo.id);
        filas.push({ rol: 'assistant', contenido: respuesta });
        break;
      }

      const llamadas = r.tool_calls as LlamadaHerramienta[];
      const contenidoAsistente = codificarAsistenteConHerramientas(r.content, llamadas);
      await guardar('assistant', contenidoAsistente, modelo.id);
      filas.push({ rol: 'assistant', contenido: contenidoAsistente });

      for (const llamada of llamadas) {
        // Una propuesta de ESTE mismo turno no cuenta como confirmada: hace falta un mensaje de la persona después.
        const estado = estadoPropuestaSemana(filas);
        // Siempre queda un resultado guardado, aunque la herramienta falle: un turno a medias rompería el historial.
        let resultado: Awaited<ReturnType<typeof ejecutarHerramienta>>;
        try {
          resultado = await ejecutarHerramienta(llamada.function.name, llamada.function.arguments, { hashSemanaMostrada: estado.hashMostrado, hayRespuestaPosterior: estado.hayRespuestaPosterior });
        } catch {
          resultado = { ok: false, error: 'No se pudo hacer eso. Probá de nuevo.' };
        }
        const contenido = codificarResultado(llamada.id, llamada.function.name, resultado);
        await guardar('tool', contenido);
        filas.push({ rol: 'tool', contenido });
        acciones.push({
          herramienta: llamada.function.name,
          ok: resultado.ok,
          resumen: resultado.ok ? String(resultado.titulo ?? resultado.estado ?? 'ok') : String(resultado.error),
          propuesta: resultado.ok && resultado.estado === 'propuesta' ? { hash: resultado.propuesta_hash, bloques: resultado.bloques } : undefined,
        });
      }
    }
    if (!respuesta) {
      respuesta = 'Listo.';
      await guardar('assistant', respuesta, modelo.id);
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'no_se_pudo_guardar') return NextResponse.json({ error: 'proveedor', conversacionId }, { status: 500 });
    const codigo = e instanceof ErrorIA ? e.codigo : 'proveedor';
    return NextResponse.json({ error: codigo, conversacionId }, { status: codigo === 'limite' ? 429 : 502 });
  }

  return NextResponse.json({ conversacionId, respuesta, acciones });
}

/** GET: la última conversación de texto de la persona (o la indicada) con sus mensajes visibles. */
export async function GET(req: Request) {
  const ctx = await getCurrentUserContext();
  if (!ctx || !(await tieneAccesoFrecuencia(ctx.role))) return error('sin_acceso', 403);
  const supabase = createSupabaseServerClient();
  const id = new URL(req.url).searchParams.get('conversacionId');
  const { data: conv } = id
    ? await (supabase as any).from('frecuencia_conversaciones').select('id').eq('id', id).eq('user_id', ctx.userId).eq('canal', 'texto').maybeSingle()
    : await (supabase as any).from('frecuencia_conversaciones').select('id').eq('user_id', ctx.userId).eq('canal', 'texto').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!conv) return NextResponse.json({ conversacionId: null, mensajes: [] });
  const { data: filas } = await (supabase as any).from('frecuencia_mensajes').select('rol, contenido, created_at').eq('conversacion_id', conv.id).eq('user_id', ctx.userId).order('created_at', { ascending: true });
  return NextResponse.json({ conversacionId: conv.id, mensajes: mensajesVisibles((filas ?? []) as FilaMensaje[]) });
}
