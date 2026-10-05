import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getEnergiasEscasez, getAccionesSubida } from '@/lib/frecuencia-kb';
import { fechaLocal, momentoDelDia } from '@/lib/frecuencia-fecha';
import { DialClienteGuardar } from './_cliente-guardar';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';

export default async function DialPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();

  const { data: pref } = await (supabase as any)
    .from('frecuencia_preferencias')
    .select('timezone')
    .eq('user_id', ctx.userId)
    .maybeSingle();
  const timezone = pref?.timezone ?? 'America/Argentina/Buenos_Aires';
  const fecha = fechaLocal(timezone);
  const momento = momentoDelDia(timezone);

  const { data: dialHoy } = await (supabase as any)
    .from('frecuencia_dial')
    .select('frecuencia, energias_escasez')
    .eq('user_id', ctx.userId)
    .eq('fecha', fecha)
    .eq('momento', momento)
    .maybeSingle();

  const energiasDisponibles = (await getEnergiasEscasez()) ?? [];
  const accionesSubida = (await getAccionesSubida()) ?? [];

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.dial.kicker}</span>
      </div>
      <h1 className={base.titulo}>
        {copy.dial.escasezFm} <span className={base.tituloAcento}>/ {copy.dial.abundanciaFm}</span>
      </h1>

      <DialClienteGuardar
        valorInicial={dialHoy?.frecuencia ?? 0}
        energiasGuardadasIniciales={dialHoy?.energias_escasez ?? {}}
        energiasDisponibles={energiasDisponibles}
        accionesSubida={accionesSubida}
      />
    </div>
  );
}
