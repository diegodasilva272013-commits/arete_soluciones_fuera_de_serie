import { notFound, redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getReglasPlan } from '@/lib/frecuencia-kb';
import type { FrecuenciaObjetivo } from '@/types/frecuencia';
import { Descomposicion } from './_descomposicion';
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

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.tareas.kicker}</span>
      </div>
      <h1 className={base.titulo}>{(objetivo as FrecuenciaObjetivo).titulo}</h1>
      {reglasPlan?.prioridad && <p className={base.subtitulo}>{reglasPlan.prioridad}</p>}

      <Descomposicion objetivoId={objetivo.id} />

      <TareasCliente key={(tareasData ?? []).length} objetivoId={objetivo.id} tareasIniciales={(tareasData ?? []) as TareaDeObjetivo[]} />
    </div>
  );
}
