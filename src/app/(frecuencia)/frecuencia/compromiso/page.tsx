import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { equiposVisibles, nombresDePersonas } from '../equipo/_datos';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { mesActual } from './_actions';
import { MiCompromiso, CompromisoAjeno } from './_compromiso-cliente';

interface Fila { id: string; user_id: string; co_conductor_id: string | null; texto_mensual: string; avance: number; mes: string }

export default async function CompromisoPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');
  const supabase = createSupabaseServerClient() as any;
  const mes = await mesActual(supabase, ctx.userId);

  const { data: propio } = await supabase.from('frecuencia_compromisos').select('id, user_id, co_conductor_id, texto_mensual, avance, mes').eq('user_id', ctx.userId).eq('mes', mes).order('created_at', { ascending: false }).limit(1).maybeSingle();
  // Los que me eligieron como co-conductor este mes.
  const { data: ajenos } = await supabase.from('frecuencia_compromisos').select('id, user_id, co_conductor_id, texto_mensual, avance, mes').eq('co_conductor_id', ctx.userId).eq('mes', mes).order('created_at', { ascending: false });

  const equipos = (await equiposVisibles()).filter((e) => e.miembros.some((m) => m.userId === ctx.userId));
  const companeros = new Map<string, string>();
  for (const e of equipos) for (const m of e.miembros) if (m.userId !== ctx.userId) companeros.set(m.userId, m.nombre);
  const nombres = await nombresDePersonas([...(ajenos ?? []).map((a: Fila) => a.user_id), ...(propio?.co_conductor_id ? [propio.co_conductor_id] : [])]);

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.compromiso.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.compromiso.titulo}</h1>
      <p className={base.subtitulo}>{copy.compromiso.subtitulo}</p>

      <MiCompromiso
        mes={mes}
        inicial={(propio as Fila | null) ? { id: propio.id, texto: propio.texto_mensual, avance: propio.avance, coConductorId: propio.co_conductor_id, coNombre: propio.co_conductor_id ? nombres.get(propio.co_conductor_id) ?? null : null } : null}
        companeros={Array.from(companeros, ([id, nombre]) => ({ id, nombre }))}
      />

      <section style={{ marginTop: 36 }} aria-label={copy.compromiso.soyCoTitulo}>
        <p className={base.campoLabel}>{copy.compromiso.soyCoTitulo}</p>
        {(ajenos ?? []).length === 0 ? (
          <p className={base.ayuda}>{copy.compromiso.soyCoVacio}</p>
        ) : (
          (ajenos as Fila[]).map((a) => <CompromisoAjeno key={a.id} id={a.id} de={nombres.get(a.user_id) ?? '—'} texto={a.texto_mensual} avance={a.avance} />)
        )}
      </section>
    </div>
  );
}
