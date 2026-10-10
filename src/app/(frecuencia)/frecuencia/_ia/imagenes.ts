'use server';

/**
 * Imágenes (5.6): la imagen mental del objetivo ("la mesa se crea dos
 * veces") y un ancla visual por tarea. Una imagen por pedido, sin variantes,
 * con límite diario desde frecuencia_knowledge_blocks. El estado vive en
 * frecuencia_imagenes (pendiente → generando → lista | error) y la pantalla
 * muestra ESE estado, no un temporizador. Cliente de sesión de la persona;
 * el archivo va a frecuencia-imagenes/<user_id>/<uuid>.<ext> (nunca se pisa).
 */

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal, horaEnTimezoneAUtc } from '@/lib/frecuencia-fecha';
import { getModelosIA, leerBloqueGenerico } from '@/lib/frecuencia-kb';
import { ErrorIA, generarImagen } from '@/lib/frecuencia/ia/nvidia';

export type ResultadoCrearImagen = { ok: true; id: string } | { ok: false; codigo: 'sin_sesion' | 'sin_destino' | 'limite_diario' | 'sin_configuracion' | 'invalido' | 'guardar' };
export type EstadoImagen = 'pendiente' | 'generando' | 'lista' | 'error';

async function sesion() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function crearImagen(input: { objetivoId?: string; tareaId?: string; descripcion?: string }): Promise<ResultadoCrearImagen> {
  const { supabase, user } = await sesion();
  if (!user) return { ok: false, codigo: 'sin_sesion' };
  // Exactamente un destino: la imagen mental de un objetivo O el ancla de una tarea.
  if (!!input.objetivoId === !!input.tareaId) return { ok: false, codigo: 'sin_destino' };
  const descripcion = (input.descripcion ?? '').trim().slice(0, 400);

  let base = '';
  if (input.objetivoId) {
    const { data: o } = await (supabase as any).from('frecuencia_objetivos').select('titulo, imagen_mental').eq('id', input.objetivoId).eq('user_id', user.id).maybeSingle();
    if (!o) return { ok: false, codigo: 'sin_destino' };
    base = descripcion || o.imagen_mental || o.titulo;
  } else {
    const { data: t } = await (supabase as any).from('frecuencia_tareas').select('titulo, protocolo').eq('id', input.tareaId).eq('user_id', user.id).maybeSingle();
    if (!t) return { ok: false, codigo: 'sin_destino' };
    base = descripcion || `${t.titulo}${Array.isArray(t.protocolo) && t.protocolo[0] ? `: ${t.protocolo[0]}` : ''}`;
  }
  if (!base.trim()) return { ok: false, codigo: 'invalido' };

  const modelos = await getModelosIA();
  const modelo = modelos.imagenes.find((m) => m.por_defecto && m.endpoint) ?? modelos.imagenes.find((m) => m.endpoint);
  const limite = (await leerBloqueGenerico<{ por_dia?: number }>('limite_imagenes_diario'))?.por_dia;
  if (!modelo || typeof limite !== 'number' || limite < 1) return { ok: false, codigo: 'sin_configuracion' };

  // Límite diario (día de la persona): cuentan las que no fallaron.
  const { data: pref } = await (supabase as any).from('frecuencia_preferencias').select('timezone').eq('user_id', user.id).maybeSingle();
  const tz = (pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';
  const inicioDia = horaEnTimezoneAUtc(fechaLocal(tz), '00:00', tz).toISOString();
  const { count } = await (supabase as any).from('frecuencia_imagenes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).neq('estado', 'error').gte('created_at', inicioDia);
  if ((count ?? 0) >= limite) return { ok: false, codigo: 'limite_diario' };

  const sufijo = (await leerBloqueGenerico<{ texto?: string }>('prompt_imagen'))?.texto ?? '';
  const prompt = [base.trim(), sufijo].filter(Boolean).join('. ').slice(0, 900);

  const { data, error } = await (supabase as any)
    .from('frecuencia_imagenes')
    .insert({ user_id: user.id, objetivo_id: input.objetivoId ?? null, tarea_id: input.tareaId ?? null, prompt, modelo: modelo.id, estado: 'pendiente' })
    .select('id')
    .single();
  if (error || !data) return { ok: false, codigo: 'guardar' };
  return { ok: true, id: data.id };
}

/** Genera la imagen de un pedido ya creado. Idempotente: solo actúa si sigue 'pendiente'. */
export async function procesarImagen(id: string): Promise<{ estado: EstadoImagen; url?: string }> {
  const { supabase, user } = await sesion();
  if (!user) return { estado: 'error' };

  const { data: tomada } = await (supabase as any)
    .from('frecuencia_imagenes')
    .update({ estado: 'generando' })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('estado', 'pendiente')
    .select('id, prompt, modelo, objetivo_id, tarea_id')
    .maybeSingle();
  if (!tomada) return estadoImagen(id); // otro pedido ya la está procesando (o ya terminó)

  const fallar = async (): Promise<{ estado: EstadoImagen }> => {
    await (supabase as any).from('frecuencia_imagenes').update({ estado: 'error' }).eq('id', id).eq('user_id', user.id);
    return { estado: 'error' };
  };

  const modelos = await getModelosIA();
  const modelo = modelos.imagenes.find((m) => m.id === tomada.modelo && m.endpoint);
  if (!modelo?.endpoint) return fallar();

  try {
    const img = await generarImagen({ endpoint: modelo.endpoint, prompt: tomada.prompt, modeloId: modelo.id });
    const ruta = `${user.id}/${crypto.randomUUID()}.${img.ext}`;
    const { error: eSubida } = await supabase.storage.from('frecuencia-imagenes').upload(ruta, img.bytes, { contentType: img.mime, upsert: false });
    if (eSubida) return fallar();
    const { error: eFila } = await (supabase as any).from('frecuencia_imagenes').update({ storage_path: ruta, estado: 'lista' }).eq('id', id).eq('user_id', user.id);
    if (eFila) {
      await supabase.storage.from('frecuencia-imagenes').remove([ruta]);
      return fallar();
    }
  } catch (e) {
    if (!(e instanceof ErrorIA)) console.error('[frecuencia-imagenes] error inesperado');
    return fallar();
  }

  revalidatePath('/frecuencia/objetivos');
  return estadoImagen(id);
}

/** Estado real del pedido (y la URL firmada si ya está lista). */
export async function estadoImagen(id: string): Promise<{ estado: EstadoImagen; url?: string }> {
  const { supabase, user } = await sesion();
  if (!user) return { estado: 'error' };
  const { data } = await (supabase as any).from('frecuencia_imagenes').select('estado, storage_path').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (!data) return { estado: 'error' };
  if (data.estado === 'lista' && data.storage_path) {
    const { data: firmada } = await supabase.storage.from('frecuencia-imagenes').createSignedUrl(data.storage_path, 3600);
    return { estado: 'lista', url: firmada?.signedUrl };
  }
  return { estado: data.estado as EstadoImagen };
}
