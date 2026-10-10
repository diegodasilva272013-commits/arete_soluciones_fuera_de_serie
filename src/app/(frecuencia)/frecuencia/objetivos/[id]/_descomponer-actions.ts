'use server';

/**
 * Descomposición del objetivo con IA (5.3). Dos pasos separados a propósito:
 *  1) proponerDescomposicion: pide la propuesta a la IA y la devuelve SIN guardar.
 *  2) guardarDescomposicion: solo después de que la persona la revisó y aceptó.
 * El prompt y el método salen de frecuencia_knowledge_blocks (nunca del código).
 * Cliente de sesión de la persona (RLS real); la IA nunca escribe en la base.
 */

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getAreasReglas, getModelosIA, getPromptDescomposicion, getReglasDosis, getReglasPlan } from '@/lib/frecuencia-kb';
import { chatCompletion, ErrorIA } from '@/lib/frecuencia/ia/nvidia';
import { desbloqueaPorIndice, normalizarPropuesta, type PropuestaDescomposicion } from '@/lib/frecuencia/ia/descomposicion';

export type ResultadoPropuesta =
  | { ok: true; propuesta: PropuestaDescomposicion }
  | { ok: false; codigo: 'sin_sesion' | 'sin_objetivo' | 'sin_configuracion' | 'sin_clave' | 'limite' | 'proveedor' | 'invalida' };

const MAX_TAREAS_POR_OBJETIVO = 30;

export async function proponerDescomposicion(objetivoId: string): Promise<ResultadoPropuesta> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, codigo: 'sin_sesion' };

  const { data: objetivo } = await (supabase as any)
    .from('frecuencia_objetivos')
    .select('titulo, imagen_mental, area_key, fecha_limite, identidad_que_expresa')
    .eq('id', objetivoId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!objetivo) return { ok: false, codigo: 'sin_objetivo' };

  const prompt = await getPromptDescomposicion();
  const modelos = await getModelosIA();
  const modelo = modelos.chat.find((m) => m.por_defecto) ?? modelos.chat[0];
  if (!prompt || !modelo) return { ok: false, codigo: 'sin_configuracion' };

  // Las reglas del método (de la base) acompañan al prompt.
  const metodo = { reglas_dosis: await getReglasDosis(), reglas_plan: await getReglasPlan(), areas_reglas: await getAreasReglas() };

  try {
    const r = await chatCompletion({
      modelo: modelo.id,
      json: true,
      temperatura: 0.3,
      maxTokens: 2000,
      mensajes: [
        { role: 'system', content: `${prompt}\n\nReglas del método (respetalas):\n${JSON.stringify(metodo)}` },
        { role: 'user', content: JSON.stringify({ objetivo }) },
      ],
    });
    const n = normalizarPropuesta(r.content ?? '');
    return n.ok ? { ok: true, propuesta: n.propuesta } : { ok: false, codigo: 'invalida' };
  } catch (e) {
    if (e instanceof ErrorIA) return { ok: false, codigo: e.codigo === 'sin_clave' ? 'sin_clave' : e.codigo === 'limite' ? 'limite' : e.codigo === 'respuesta_invalida' ? 'invalida' : 'proveedor' };
    return { ok: false, codigo: 'proveedor' };
  }
}

export async function guardarDescomposicion(objetivoId: string, propuestaCruda: unknown): Promise<{ ok: boolean; guardadas?: number; error?: string }> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'sesion' };

  // Nunca se confía en lo que manda el cliente: se vuelve a validar y acotar.
  const n = normalizarPropuesta(propuestaCruda);
  if (!n.ok) return { ok: false, error: 'invalida' };
  const { metas, tareas } = n.propuesta;

  const { data: objetivo } = await (supabase as any).from('frecuencia_objetivos').select('id').eq('id', objetivoId).eq('user_id', user.id).maybeSingle();
  if (!objetivo) return { ok: false, error: 'sin_objetivo' };
  const { count } = await (supabase as any).from('frecuencia_tareas').select('id', { count: 'exact', head: true }).eq('objetivo_id', objetivoId).eq('user_id', user.id);
  if ((count ?? 0) + tareas.length > MAX_TAREAS_POR_OBJETIVO) return { ok: false, error: 'demasiadas' };

  // Arrancan chicas (dosis actual 1, "hábitos en oferta") y crecen hasta la dosis objetivo con el escalado.
  const { data: creadas, error } = await (supabase as any)
    .from('frecuencia_tareas')
    .insert(
      tareas.map((t) => ({
        user_id: user.id,
        objetivo_id: objetivoId,
        titulo: t.titulo,
        protocolo: t.protocolo,
        tipo_energia: t.tipoEnergia,
        duracion_min: t.duracionMin,
        dosis_actual: 1,
        dosis_objetivo: t.dosisObjetivo,
      }))
    )
    .select('id');
  if (error || !creadas || creadas.length !== tareas.length) return { ok: false, error: 'guardar' };
  const ids = (creadas as { id: string }[]).map((c) => c.id);

  const desbloquea = desbloqueaPorIndice(tareas);
  for (let i = 0; i < tareas.length; i++) {
    if (!tareas[i].dependeDe.length && !desbloquea[i].length) continue;
    const { error: e2 } = await (supabase as any)
      .from('frecuencia_tareas')
      .update({ depende_de: tareas[i].dependeDe.map((d) => ids[d]), desbloquea: desbloquea[i].map((d) => ids[d]) })
      .eq('id', ids[i])
      .eq('user_id', user.id);
    if (e2) {
      // Que no quede a medias: se borran las recién creadas.
      await (supabase as any).from('frecuencia_tareas').delete().in('id', ids).eq('user_id', user.id);
      return { ok: false, error: 'guardar' };
    }
  }

  if (metas.length) await (supabase as any).from('frecuencia_objetivos').update({ metas_por_periodo: metas }).eq('id', objetivoId).eq('user_id', user.id);

  revalidatePath(`/frecuencia/objetivos/${objetivoId}`);
  revalidatePath('/frecuencia/objetivos');
  return { ok: true, guardadas: tareas.length };
}
