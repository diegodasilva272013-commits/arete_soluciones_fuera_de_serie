import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { lunesDeLaSemana, fechaMasDias, horaEnTimezoneAUtc } from '@/lib/frecuencia-fecha';
import { normalizarNoNegociables, resolverTitulosDeBloques } from '@/lib/frecuencia-semana';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { obtenerAjustesDosis } from '@/lib/frecuencia-dosis';
import { AjustesDosis } from './_ajustes-dosis';
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

  const titulos = await resolverTitulosDeBloques(ctx.userId, bloquesData ?? [], timezone);
  const bloques: BloqueDeSemana[] = (bloquesData ?? []).map((b: any) => ({
    id: b.id,
    tareaId: b.tarea_id,
    tipo: b.tipo,
    inicio: b.inicio,
    fin: b.fin,
    estado: b.estado,
    titulo: titulos.get(b.id) ?? '—',
  }));

  const { data: identidad } = await (supabase as any)
    .from('frecuencia_identidad')
    .select('no_negociables')
    .eq('user_id', ctx.userId)
    .maybeSingle();
  const noNegociables = normalizarNoNegociables(identidad?.no_negociables);

  // Una falla de esta función nunca tiene que tumbar la pantalla de la semana.
  const ajustesDosis = await obtenerAjustesDosis(ctx.userId, timezone).catch(() => []);

  return (
    <div className={base.pantallaAncha}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.semana.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.semana.titulo}</h1>
      <p className={base.subtitulo}>{copy.semana.subtitulo}</p>

      <AjustesDosis propuestas={ajustesDosis} semanaClave={lunes} />

      <SemanaCliente bloquesIniciales={bloques} noNegociablesIniciales={noNegociables} lunesSemana={lunes} timezone={timezone} />
    </div>
  );
}
