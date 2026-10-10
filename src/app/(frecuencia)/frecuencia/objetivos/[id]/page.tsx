import { notFound, redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getReglasPlan } from '@/lib/frecuencia-kb';
import type { FrecuenciaObjetivo } from '@/types/frecuencia';
import { Descomposicion } from './_descomposicion';
import { GeneradorImagen, type ImagenGuardada } from './_generador-imagen';
import { TareasCliente, type TareaDeObjetivo } from './_tareas-cliente';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';

export default async function ObjetivoDetallePage({ params }: { params: { id: string } }) {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();

  const { data: objetivo } = await (supabase as any)
    .from('frecuencia_objetivos')
    .select('id, titulo, area_key, fecha_limite')
    .eq('id', params.id)
    .eq('user_id', ctx.userId)
    .maybeSingle();

  if (!objetivo) notFound();

  const { data: tareasData } = await (supabase as any)
    .from('frecuencia_tareas')
    .select('id, titulo, protocolo, tipo_energia, duracion_min, dosis_actual, dosis_objetivo, desbloquea, veces_postergada')
    .eq('objetivo_id', objetivo.id)
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: true });

  const reglasPlan = await getReglasPlan();

  // Imágenes del objetivo (imagen mental) y de sus tareas (anclas), con URL firmada de 1 h.
  const { data: imgsData } = await (supabase as any)
    .from('frecuencia_imagenes')
    .select('id, estado, storage_path, objetivo_id, tarea_id, created_at')
    .eq('user_id', ctx.userId)
    .or(`objetivo_id.eq.${objetivo.id},tarea_id.in.(${((tareasData ?? []) as { id: string }[]).map((t) => t.id).join(',') || '00000000-0000-0000-0000-000000000000'})`)
    .order('created_at', { ascending: false })
    .limit(30);
  const rutas = ((imgsData ?? []) as { estado: string; storage_path: string | null }[]).filter((i) => i.estado === 'lista' && i.storage_path).map((i) => i.storage_path as string);
  const firmadas = new Map<string, string>();
  if (rutas.length) {
    const { data } = await supabase.storage.from('frecuencia-imagenes').createSignedUrls(rutas, 3600);
    for (const f of data ?? []) if (f.path && f.signedUrl) firmadas.set(f.path, f.signedUrl);
  }
  const imagenesObjetivo: ImagenGuardada[] = [];
  const imagenesPorTarea: Record<string, ImagenGuardada[]> = {};
  for (const i of (imgsData ?? []) as { id: string; estado: ImagenGuardada['estado']; storage_path: string | null; objetivo_id: string | null; tarea_id: string | null }[]) {
    const g: ImagenGuardada = { id: i.id, estado: i.estado, url: i.storage_path ? firmadas.get(i.storage_path) ?? null : null };
    if (i.tarea_id) (imagenesPorTarea[i.tarea_id] ??= []).push(g);
    else if (i.objetivo_id === objetivo.id) imagenesObjetivo.push(g);
  }

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.tareas.kicker}</span>
      </div>
      <h1 className={base.titulo}>{(objetivo as FrecuenciaObjetivo).titulo}</h1>
      {reglasPlan?.prioridad && <p className={base.subtitulo}>{reglasPlan.prioridad}</p>}

      <Descomposicion objetivoId={objetivo.id} />

      <GeneradorImagen objetivoId={objetivo.id} imagenes={imagenesObjetivo} titulo={copy.imagenes.imagenMentalTitulo} ayuda={copy.imagenes.imagenMentalAyuda} botonGenerar={copy.imagenes.generar} />

      <TareasCliente imagenesPorTarea={imagenesPorTarea} key={(tareasData ?? []).length} objetivoId={objetivo.id} tareasIniciales={(tareasData ?? []) as TareaDeObjetivo[]} />
    </div>
  );
}
