import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_criterios.module.css';
import { criteriosVisibles, guiaDelCriterio, type CriterioFila } from './_datos';

function Tarjeta({ c, editable }: { c: CriterioFila; editable: boolean }) {
  const cuerpo = (
    <>
      <p className={s.itemTitulo}>{c.titulo}</p>
      <p className={s.itemDecide}>{c.que_se_decide}</p>
      <div className={s.chips}>
        <span className={s.chip}>{c.ambito === 'equipo' ? copy.criterios.ambitoEquipo : copy.criterios.ambitoPersonal}</span>
        <span className={s.chip}>{c.reversible ? `${copy.criterios.reversibleSi}${c.tiempo_reversibilidad ? ` · ${c.tiempo_reversibilidad}` : ''}` : copy.criterios.reversibleNo}</span>
      </div>
    </>
  );
  return editable ? (
    <Link href={`/frecuencia/criterios/${c.id}`} className={s.item}>{cuerpo}</Link>
  ) : (
    <div className={s.item}>{cuerpo}</div>
  );
}

export default async function CriteriosPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const [{ propios, recibidos }, guia] = await Promise.all([criteriosVisibles(ctx.userId), guiaDelCriterio()]);

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.criterios.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.criterios.titulo}</h1>
      <p className={base.subtitulo}>{copy.criterios.subtitulo}</p>

      <div className={s.guia}>
        <p className={s.regla}>{guia.regla ?? copy.criterios.regla}</p>
        <p className={s.test}>{guia.test ?? copy.criterios.test}</p>
      </div>

      <div className={base.filaBotones}>
        <Link href="/frecuencia/criterios/nuevo" className={base.btn}>{copy.criterios.nuevo}</Link>
      </div>

      <section className={s.seccion} aria-label={copy.criterios.propiosTitulo}>
        <p className={base.campoLabel}>{copy.criterios.propiosTitulo}</p>
        {propios.length === 0 ? (
          <p className={base.ayuda}>{copy.criterios.vacio}</p>
        ) : (
          <div className={s.lista}>{propios.map((c) => <Tarjeta key={c.id} c={c} editable />)}</div>
        )}
      </section>

      {recibidos.length > 0 && (
        <section className={s.seccion} aria-label={copy.criterios.recibidosTitulo}>
          <p className={base.campoLabel}>{copy.criterios.recibidosTitulo}</p>
          <div className={s.lista}>{recibidos.map((c) => <Tarjeta key={c.id} c={c} editable={false} />)}</div>
        </section>
      )}
    </div>
  );
}
