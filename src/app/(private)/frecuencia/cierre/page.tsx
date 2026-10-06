import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal, fechaMasDias, horaEnTimezoneAUtc, momentoDelDia } from '@/lib/frecuencia-fecha';
import { resolverTitulosDeBloques } from '@/lib/frecuencia-semana';
import { getEnergiasEscasez, getAccionesSubida, getPasosAnteFalla } from '@/lib/frecuencia-kb';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { CierreCliente, type BloqueDelDia, type EvidenciaDelDia } from './_cierre-cliente';

export default async function CierrePage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();

  const { data: preferencias } = await (supabase as any).from('frecuencia_preferencias').select('timezone, hora_despertar').eq('user_id', ctx.userId).maybeSingle();
  const timezone = (preferencias?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';

  const hoyISO = fechaLocal(timezone);
  const mananaISO = fechaMasDias(hoyISO, 1);
  const pasadoMananaISO = fechaMasDias(hoyISO, 2);
  const inicioHoyUtc = horaEnTimezoneAUtc(hoyISO, '00:00', timezone).toISOString();
  const inicioMananaUtc = horaEnTimezoneAUtc(mananaISO, '00:00', timezone).toISOString();
  const inicioPasadoMananaUtc = horaEnTimezoneAUtc(pasadoMananaISO, '00:00', timezone).toISOString();

  // ── Bloques de hoy (para saber si algo quedó NO_SALIO) ──
  const { data: bloquesHoyData } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id, estado')
    .eq('user_id', ctx.userId)
    .gte('inicio', inicioHoyUtc)
    .lt('inicio', inicioMananaUtc);
  const huboFalla = (bloquesHoyData ?? []).some((b: any) => b.estado === 'NO_SALIO');

  // ── Evidencia de hoy (automática + manual) ──
  const { data: evidenciaData } = await (supabase as any)
    .from('frecuencia_evidencia')
    .select('id, texto, tipo, created_at')
    .eq('user_id', ctx.userId)
    .eq('fecha', hoyISO)
    .order('created_at', { ascending: true });
  const evidencia: EvidenciaDelDia[] = (evidenciaData ?? []).map((e: any) => ({ id: e.id, texto: e.texto, tipo: e.tipo }));

  // ── Bloques de mañana (para "diseñar mañana") ──
  const { data: bloquesMananaData } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id, tarea_id, tipo, inicio, fin, estado')
    .eq('user_id', ctx.userId)
    .gte('inicio', inicioMananaUtc)
    .lt('inicio', inicioPasadoMananaUtc)
    .order('inicio', { ascending: true });
  const titulosManana = await resolverTitulosDeBloques(ctx.userId, bloquesMananaData ?? [], timezone);
  const bloquesManana: BloqueDelDia[] = (bloquesMananaData ?? []).map((b: any) => ({
    id: b.id,
    tipo: b.tipo,
    inicio: b.inicio,
    fin: b.fin,
    titulo: titulosManana.get(b.id) ?? '—',
  }));

  // ── Dial de la noche: valor ya guardado esta noche, si lo hay ──
  const momento = momentoDelDia(timezone);
  const { data: dialNoche } = await (supabase as any)
    .from('frecuencia_dial')
    .select('frecuencia, energias_escasez')
    .eq('user_id', ctx.userId)
    .eq('fecha', hoyISO)
    .eq('momento', momento)
    .maybeSingle();

  const energiasDisponibles = (await getEnergiasEscasez()) ?? [];
  const accionesSubida = (await getAccionesSubida()) ?? [];
  const pasosAnteFalla = (await getPasosAnteFalla()) ?? [];

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.cierre.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.cierre.titulo}</h1>

      <CierreCliente
        evidencia={evidencia}
        bloquesManana={bloquesManana}
        huboFalla={huboFalla}
        pasosAnteFalla={pasosAnteFalla}
        dialValorInicial={dialNoche?.frecuencia ?? 0}
        energiasGuardadasIniciales={dialNoche?.energias_escasez ?? {}}
        energiasDisponibles={energiasDisponibles}
        accionesSubida={accionesSubida}
        timezone={timezone}
      />
    </div>
  );
}
