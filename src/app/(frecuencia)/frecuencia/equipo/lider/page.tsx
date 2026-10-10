import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaMasDias, lunesDeLaSemana, diaYHoraLocal } from '@/lib/frecuencia-fecha';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import { equiposVisibles, nombresDePersonas } from '../_datos';
import { mesActual } from '../../compromiso/_mes';
import s from './_lider.module.css';

const t = copy.lider;

interface Bloque { user_id: string; tipo: string; inicio: string; estado: string; minutos_reales_foco: number }
interface Evid { user_id: string; fecha: string; texto: string; tipo: string }
interface Comp { user_id: string; co_conductor_id: string | null; texto_mensual: string; avance: number }
interface Deleg { de_user_id: string; a_user_id: string; volvio: boolean; fecha: string }

/**
 * Vista del líder (6.5). SOLO lee: bloques, evidencia, compromisos y delegaciones de las personas de su equipo (lo que la
 * RLS le permite). No consulta dial, espejo, identidad, mapa de energía ni preferencias, y no hay forma de verlos desde acá.
 * De la evidencia no se muestran los aprendizajes del cierre del día: son reflexión personal.
 */
export default async function VistaLiderPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient() as any;
  const equipos = (await equiposVisibles()).filter((e) => e.liderId === ctx.userId);
  if (equipos.length === 0) redirect('/frecuencia/equipo');

  const ids = Array.from(new Set(equipos.flatMap((e) => e.miembros.map((m) => m.userId).filter((u) => u !== ctx.userId))));
  const { data: pref } = await supabase.from('frecuencia_preferencias').select('timezone').eq('user_id', ctx.userId).maybeSingle();
  const tz = (pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';
  const lunes = lunesDeLaSemana(tz);
  const mes = await mesActual(supabase, ctx.userId);

  let bloques: Bloque[] = [], evidencia: Evid[] = [], compromisos: Comp[] = [], delegaciones: Deleg[] = [];
  if (ids.length) {
    const [b, e, c, d] = await Promise.all([
      supabase.from('frecuencia_bloques').select('user_id, tipo, inicio, estado, minutos_reales_foco').in('user_id', ids).gte('inicio', `${lunes}T00:00:00Z`).lt('inicio', `${fechaMasDias(lunes, 7)}T00:00:00Z`).order('inicio', { ascending: true }),
      supabase.from('frecuencia_evidencia').select('user_id, fecha, texto, tipo').in('user_id', ids).neq('tipo', 'APRENDIZAJE').order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(60),
      supabase.from('frecuencia_compromisos').select('user_id, co_conductor_id, texto_mensual, avance').in('user_id', ids).eq('mes', mes),
      supabase.from('frecuencia_delegaciones').select('de_user_id, a_user_id, volvio, fecha').in('de_user_id', ids).order('created_at', { ascending: false }),
    ]);
    if (b.error || e.error || c.error || d.error) {
      return (
        <div className={base.pantalla}>
          <h1 className={base.titulo}>{t.titulo}</h1>
          <p className={s.error} role="alert">{t.errorLectura}</p>
        </div>
      );
    }
    bloques = b.data ?? [];
    evidencia = e.data ?? [];
    compromisos = c.data ?? [];
    delegaciones = d.data ?? [];
  }
  const nombres = await nombresDePersonas([...ids, ...compromisos.map((c) => c.co_conductor_id).filter((x): x is string => !!x), ...delegaciones.map((d) => d.a_user_id)]);

  return (
    <div className={`${base.pantalla} ${base.pantallaAncha}`}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{t.kicker}</span>
      </div>
      <h1 className={base.titulo}>{t.titulo}</h1>
      <p className={base.subtitulo}>{t.subtitulo}</p>
      <p className={s.nota}>{t.privacidad}</p>

      {equipos.map((e) => {
        const miembros = e.miembros.filter((m) => m.userId !== ctx.userId);
        return (
          <section key={e.id} className={s.equipo} aria-label={e.nombre}>
            <h2 className={s.equipoNombre}>{e.nombre}</h2>
            {miembros.length === 0 && <p className={s.suave}>{t.sinMiembros}</p>}
            {miembros.map((m) => {
              const bs = bloques.filter((x) => x.user_id === m.userId);
              const cumplidos = bs.filter((x) => x.estado === 'CUMPLIDO').length;
              const foco = bs.reduce((a, x) => a + (x.minutos_reales_foco || 0), 0);
              const ev = evidencia.filter((x) => x.user_id === m.userId).slice(0, 5);
              const comp = compromisos.find((x) => x.user_id === m.userId);
              const ds = delegaciones.filter((x) => x.de_user_id === m.userId);
              const vol = ds.filter((x) => x.volvio).length;
              return (
                <article key={m.userId} className={s.persona} aria-label={m.nombre}>
                  <h3 className={s.personaNombre}>{m.nombre}</h3>
                  <div className={s.grilla}>
                    <div className={s.bloque}>
                      <h4>{t.semana}</h4>
                      {bs.length === 0 ? (
                        <p className={s.suave}>{t.sinBloques}</p>
                      ) : (
                        <>
                          <p className={s.dato}>{t.bloques(cumplidos, bs.length)}</p>
                          <p className={s.dato}>{t.foco(foco)}</p>
                          <div className={s.barra} aria-hidden><div className={s.relleno} style={{ width: `${Math.round((cumplidos / bs.length) * 100)}%` }} /></div>
                          <ul className={s.lista} style={{ marginTop: 10 }}>
                            {bs.slice(0, 6).map((x, i) => {
                              const { dia, hora } = diaYHoraLocal(x.inicio, tz);
                              return <li key={i}><span className={s.cuando}>{copy.semana.diasLabel[dia as keyof typeof copy.semana.diasLabel] ?? dia} {hora}</span>{x.tipo.toLowerCase()} · {t.estados[x.estado] ?? x.estado}</li>;
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                    <div className={s.bloque}>
                      <h4>{t.evidencia}</h4>
                      {ev.length === 0 ? <p className={s.suave}>{t.sinEvidencia}</p> : <ul className={s.lista}>{ev.map((x, i) => <li key={i}><span className={s.cuando}>{x.fecha}</span>{x.texto}</li>)}</ul>}
                    </div>
                    <div className={s.bloque}>
                      <h4>{t.compromiso}</h4>
                      {comp ? (
                        <>
                          <p className={s.dato}>{comp.texto_mensual}</p>
                          <p className={s.dato}>{comp.avance}%{comp.co_conductor_id ? ` · ${t.coConductor}: ${nombres.get(comp.co_conductor_id) ?? '—'}` : ''}</p>
                          <div className={s.barra} aria-hidden><div className={s.relleno} style={{ width: `${comp.avance}%` }} /></div>
                        </>
                      ) : (
                        <p className={s.suave}>{t.sinCompromiso}</p>
                      )}
                    </div>
                    <div className={s.bloque}>
                      <h4>{t.delegaciones}</h4>
                      {ds.length === 0 ? (
                        <p className={s.suave}>{t.sinDelegaciones}</p>
                      ) : (
                        <>
                          <p className={s.dato}>{t.volvieron(vol, ds.length)}</p>
                          <ul className={s.lista}>
                            {ds.slice(0, 5).map((x, i) => <li key={i}><span className={s.cuando}>{x.fecha}</span>{t.a} {nombres.get(x.a_user_id) ?? '—'} · {x.volvio ? t.volvio : t.enSusManos}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
