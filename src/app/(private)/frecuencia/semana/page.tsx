import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { lunesDeLaSemana, fechaMasDias, horaEnTimezoneAUtc } from '@/lib/frecuencia-fecha';
import { normalizarNoNegociables } from '@/lib/frecuencia-semana';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { SemanaCliente, type BloqueDeSemana } from './_semana-cliente';

export default async function SemanaPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();

  const { data: preferencias } = await (supabase as any)
    .from('frecuencia_preferencias')
    .select('timezone')
    .eq('user_id', ctx.userId)
    .maybeSingle();
  const timezone = (preferencias?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';

  const lunes = lunesDeLaSemana(timezone);
  const siguienteLunes = fechaMasDias(lunes, 7);
  const inicioSemanaUtc = horaEnTimezoneAUtc(lunes, '00:00', timezone).toISOString();
  const finSemanaUtc = horaEnTimezoneAUtc(siguienteLunes, '00:00', timezone).toISOString();

  const { data: bloquesData } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id, tarea_id, tipo, inicio, fin, estado')
    .eq('user_id', ctx.userId)
    .gte('inicio', inicioSemanaUtc)
    .lt('inicio', finSemanaUtc)
    .order('inicio', { ascending: true });

  const idsTareas = [...new Set((bloquesData ?? []).map((b: any) => b.tarea_id).filter(Boolean))];
  let titulosPorTarea = new Map<string, string>();
  if (idsTareas.length > 0) {
    const { data: tareasData } = await (supabase as any).from('frecuencia_tareas').select('id, titulo').in('id', idsTareas);
    titulosPorTarea = new Map((tareasData ?? []).map((t: any) => [t.id, t.titulo]));
  }

  const bloques: BloqueDeSemana[] = (bloquesData ?? []).map((b: any) => ({
    id: b.id,
    tareaId: b.tarea_id,
    tipo: b.tipo,
    inicio: b.inicio,
    fin: b.fin,
    estado: b.estado,
    titulo: b.tarea_id ? titulosPorTarea.get(b.tarea_id) ?? '—' : b.tipo === 'IMPREVISTOS' ? copy.tareas.vacio : '',
  }));

  const { data: identidad } = await (supabase as any)
    .from('frecuencia_identidad')
    .select('no_negociables')
    .eq('user_id', ctx.userId)
    .maybeSingle();
  const noNegociables = normalizarNoNegociables(identidad?.no_negociables);

  return (
    <div className={base.pantallaAncha}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.semana.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.semana.titulo}</h1>
      <p className={base.subtitulo}>{copy.semana.subtitulo}</p>

      <SemanaCliente bloquesIniciales={bloques} noNegociablesIniciales={noNegociables} lunesSemana={lunes} timezone={timezone} />
    </div>
  );
}
