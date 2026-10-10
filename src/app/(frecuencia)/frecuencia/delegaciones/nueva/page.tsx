import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { equiposVisibles } from '../../equipo/_datos';
import { NuevaDelegacion } from './_nueva-cliente';

export default async function NuevaDelegacionPage({ searchParams }: { searchParams: { tarea?: string } }) {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');
  const supabase = createSupabaseServerClient() as any;

  const { data: tareas } = await supabase.from('frecuencia_tareas').select('id, titulo').eq('user_id', ctx.userId).order('created_at', { ascending: false });
  const { data: criterios } = await supabase.from('frecuencia_criterios').select('id, titulo').eq('user_id', ctx.userId).eq('activo', true).order('created_at', { ascending: false });
  const equipos = (await equiposVisibles()).filter((e) => e.miembros.some((m) => m.userId === ctx.userId));
  const companeros = new Map<string, string>();
  for (const e of equipos) for (const m of e.miembros) if (m.userId !== ctx.userId) companeros.set(m.userId, m.nombre);

  return (
    <NuevaDelegacion
      tareas={(tareas ?? []) as { id: string; titulo: string }[]}
      criterios={(criterios ?? []) as { id: string; titulo: string }[]}
      personas={Array.from(companeros, ([id, nombre]) => ({ id, nombre }))}
      tareaInicial={searchParams.tarea ?? ''}
    />
  );
}
