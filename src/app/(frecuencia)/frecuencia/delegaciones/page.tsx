import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { nombresDePersonas } from '../equipo/_datos';
import { COLUMNAS_CRITERIO, type CriterioFila } from '../criterios/_datos';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_delegaciones.module.css';
import { FilaDelegue } from './_fila-delegue';

const t = copy.delegaciones;

interface Fila { id: string; tarea_id: string; de_user_id: string; a_user_id: string; criterio_id: string; volvio: boolean; fecha: string }

export default async function DelegacionesPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');
  const supabase = createSupabaseServerClient() as any;

  // La RLS también deja ver al líder las de su equipo: acá solo las propias (las del equipo van en la vista del líder).
  const { data, error: errorLectura } = await supabase.from('frecuencia_delegaciones').select('id, tarea_id, de_user_id, a_user_id, criterio_id, volvio, fecha').or(`de_user_id.eq.${ctx.userId},a_user_id.eq.${ctx.userId}`).order('created_at', { ascending: false });
  const filas = (data ?? []) as Fila[];
  if (errorLectura) {
    return (
      <div className={base.pantalla}>
        <h1 className={base.titulo}>{t.titulo}</h1>
        <p className={s.error} role="alert">{t.errorLectura}</p>
      </div>
    );
  }
  const hechas = filas.filter((f) => f.de_user_id === ctx.userId);
  const recibidas = filas.filter((f) => f.a_user_id === ctx.userId);

  const { data: tareasData } = filas.length ? await supabase.from('frecuencia_tareas').select('id, titulo, protocolo, duracion_min').in('id', filas.map((f) => f.tarea_id)) : { data: [] };
  const tareas = new Map(((tareasData ?? []) as { id: string; titulo: string; protocolo: string[] | null; duracion_min: number | null }[]).map((x) => [x.id, x]));
  const { data: critData } = filas.length ? await supabase.from('frecuencia_criterios').select(COLUMNAS_CRITERIO).in('id', filas.map((f) => f.criterio_id)) : { data: [] };
  const criterios = new Map(((critData ?? []) as CriterioFila[]).map((c) => [c.id, c]));
  const nombres = await nombresDePersonas(filas.flatMap((f) => [f.de_user_id, f.a_user_id]));

  const volvieron = hechas.filter((f) => f.volvio).length;

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{t.kicker}</span>
      </div>
      <h1 className={base.titulo}>{t.titulo}</h1>
      <p className={base.subtitulo}>{t.subtitulo}</p>
      <div className={base.filaBotones}>
        <Link href="/frecuencia/delegaciones/nueva" className={base.btn}>{t.nueva}</Link>
      </div>

      <section className={s.seccion} aria-label={t.delegueTitulo}>
        <h2 className={base.campoLabel}>{t.delegueTitulo}</h2>
        {hechas.length > 0 && (
          <div className={s.resultado}>
            <strong>{t.resultado(volvieron, hechas.length)}</strong>
            <span>{t.testLider}</span>
          </div>
        )}
        {hechas.length === 0 ? (
          <p className={base.ayuda}>{t.vacioDelegue}</p>
        ) : (
          <div className={s.lista}>
            {hechas.map((f) => (
              <FilaDelegue
                key={f.id}
                id={f.id}
                tarea={tareas.get(f.tarea_id)?.titulo ?? '—'}
                persona={nombres.get(f.a_user_id) ?? '—'}
                criterio={criterios.get(f.criterio_id)?.titulo ?? '—'}
                fecha={f.fecha}
                volvio={f.volvio}
              />
            ))}
          </div>
        )}
      </section>

      <section className={s.seccion} aria-label={t.recibidasTitulo}>
        <h2 className={base.campoLabel}>{t.recibidasTitulo}</h2>
        {recibidas.length === 0 ? (
          <p className={base.ayuda}>{t.vacioRecibidas}</p>
        ) : (
          <div className={s.lista}>
            {recibidas.map((f) => {
              const tarea = tareas.get(f.tarea_id);
              const c = criterios.get(f.criterio_id);
              return (
                <article key={f.id} className={s.tarjeta}>
                  <p className={s.meta}>{t.de} {nombres.get(f.de_user_id) ?? '—'} · {f.fecha}</p>
                  <p className={s.titulo}>{tarea?.titulo ?? '—'}{tarea?.duracion_min ? ` · ${tarea.duracion_min} min` : ''}</p>
                  {tarea?.protocolo && tarea.protocolo.length > 0 && (
                    <>
                      <p className={s.meta} style={{ marginTop: 10 }}>{t.leer.pasos}</p>
                      <ol className={s.pasos}>{tarea.protocolo.map((p, i) => <li key={i}>{p}</li>)}</ol>
                    </>
                  )}
                  {c && (
                    <dl className={s.criterio}>
                      <dt>{t.criterio}</dt><dd>{c.titulo}</dd>
                      <dt>{t.leer.queSeDecide}</dt><dd>{c.que_se_decide}</dd>
                      {c.que_entra && <><dt>{t.leer.queEntra}</dt><dd>{c.que_entra}</dd></>}
                      {c.que_no_entra && <><dt>{t.leer.queNoEntra}</dt><dd>{c.que_no_entra}</dd></>}
                      {c.costo_si_sale_mal && <><dt>{t.leer.costo}</dt><dd>{c.costo_si_sale_mal}</dd></>}
                      <dt>{t.leer.reversible}</dt><dd>{c.reversible ? `${t.leer.si}${c.tiempo_reversibilidad ? ` · ${c.tiempo_reversibilidad}` : ''}` : t.leer.no}</dd>
                    </dl>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
