import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { equiposVisibles } from '../../equipo/_datos';
import { guiaDelCriterio } from '../_datos';
import { CriterioFormulario } from '../_criterio-form';

export default async function CriterioNuevoPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');
  const equipos = (await equiposVisibles()).filter((e) => e.miembros.some((m) => m.userId === ctx.userId));
  return <CriterioFormulario equipos={equipos.map((e) => ({ id: e.id, nombre: e.nombre }))} guia={await guiaDelCriterio()} />;
}
