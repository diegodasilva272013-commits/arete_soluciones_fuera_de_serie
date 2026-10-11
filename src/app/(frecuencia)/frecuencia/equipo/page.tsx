import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_equipo.module.css';
import { equiposVisibles } from './_datos';

export default async function EquipoPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const equipos = await equiposVisibles();
  const esLider = equipos.some((e) => e.liderId === ctx.userId);
  // El admin ve todos los equipos pero esta pantalla es "los míos": solo los que integra.
  const mios = equipos.filter((e) => e.miembros.some((m) => m.userId === ctx.userId));

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.equipo.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.equipo.titulo}</h1>
      <p className={base.subtitulo}>{copy.equipo.subtitulo}</p>

      {mios.length === 0 ? (
        <p className={s.vacio}>{copy.equipo.sinEquipo}</p>
      ) : (
        <>
          <div className={s.lista}>
            {mios.map((e) => (
              <section key={e.id} className={s.tarjeta}>
                <p className={s.etiqueta}>{e.liderId === ctx.userId ? copy.equipo.tuRol.lider : copy.equipo.tuRol.miembro}</p>
                <h2 className={s.tarjetaTitulo}>{e.nombre}</h2>
                <div style={{ marginTop: 12 }}>
                  {e.miembros.map((m) => (
                    <div key={m.userId} className={s.fila}>
                      <span className={s.filaNombre}>{m.nombre}</span>
                      {m.esLider && <span className={s.filaMeta}>{copy.equipo.admin.esLider}</span>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <nav className={s.accesos} aria-label={copy.equipo.titulo}>
            <Link className={s.acceso} href="/frecuencia/criterios">{copy.equipo.accesos.criterios}</Link>
            <Link className={s.acceso} href="/frecuencia/delegaciones">{copy.equipo.accesos.delegaciones}</Link>
            <Link className={s.acceso} href="/frecuencia/compromiso">{copy.equipo.accesos.compromiso}</Link>
            {esLider && <Link className={s.acceso} href="/frecuencia/equipo/lider">{copy.equipo.accesos.lider}</Link>}
          </nav>
        </>
      )}

      {ctx.isAdmin && (
        <nav className={s.accesos} aria-label={copy.equipo.admin.kicker}>
          <Link className={s.acceso} href="/frecuencia/equipo/admin">{copy.equipo.accesos.admin}</Link>
        </nav>
      )}
    </div>
  );
}
