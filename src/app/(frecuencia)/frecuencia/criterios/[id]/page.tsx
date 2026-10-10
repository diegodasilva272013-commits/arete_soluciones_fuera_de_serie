import { notFound, redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { equiposVisibles } from '../../equipo/_datos';
import { COLUMNAS_CRITERIO, guiaDelCriterio, type CriterioFila } from '../_datos';
import { CriterioFormulario } from '../_criterio-form';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CriterioEditarPage({ params }: { params: { id: string } }) {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');
  if (!UUID.test(params.id)) notFound();
  const supabase = createSupabaseServerClient() as any;
  // Solo se edita lo propio: el que recibió una delegación lo lee, no lo edita (la RLS también lo impide).
  const { data } = await supabase.from('frecuencia_criterios').select(COLUMNAS_CRITERIO).eq('id', params.id).eq('user_id', ctx.userId).maybeSingle();
  if (!data) notFound();
  const equipos = (await equiposVisibles()).filter((e) => e.miembros.some((m) => m.userId === ctx.userId));
  return <CriterioFormulario inicial={data as CriterioFila} equipos={equipos.map((e) => ({ id: e.id, nombre: e.nombre }))} guia={await guiaDelCriterio()} />;
}
