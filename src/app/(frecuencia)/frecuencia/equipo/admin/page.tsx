import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import { equiposVisibles } from '../_datos';
import { AdminEquipos } from './_admin-cliente';

export default async function AdminEquiposPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');
  if (!ctx.isAdmin) redirect('/frecuencia/equipo');

  const equipos = await equiposVisibles();

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.equipo.admin.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.equipo.admin.titulo}</h1>
      <p className={base.subtitulo}>{copy.equipo.admin.subtitulo}</p>
      <AdminEquipos equipos={equipos} />
    </div>
  );
}
