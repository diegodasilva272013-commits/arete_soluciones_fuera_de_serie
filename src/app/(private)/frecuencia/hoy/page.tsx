import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal, horaEnTimezoneAUtc, fechaMasDias } from '@/lib/frecuencia-fecha';
import { resolverTitulosDeBloques, obtenerDatosEnElAire } from '@/lib/frecuencia-semana';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { HoyCliente, type ItemLinea } from './_hoy-cliente';

export default async function HoyPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();

  const { data: preferencias } = await (supabase as any).from('frecuencia_preferencias').select('timezone').eq('user_id', ctx.userId).maybeSingle();
  const timezone = (preferencias?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';

  const hoyISO = fechaLocal(timezone);
  const mananaISO = fechaMasDias(hoyISO, 1);
  const inicioHoyUtc = horaEnTimezoneAUtc(hoyISO, '00:00', timezone).toISOString();
  const finHoyUtc = horaEnTimezoneAUtc(mananaISO, '00:00', timezone).toISOString();
  const ahoraUtc = new Date().toISOString();

  const { data: dialHoy } = await (supabase as any)
    .from('frecuencia_dial')
    .select('frecuencia')
    .eq('user_id', ctx.userId)
    .eq('fecha', hoyISO)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: bloquesData } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id, tarea_id, tipo, inicio, fin, estado')
    .eq('user_id', ctx.userId)
    .gte('inicio', inicioHoyUtc)
    .lt('inicio', finHoyUtc)
    .order('inicio', { ascending: true });

  const titulos = await resolverTitulosDeBloques(ctx.userId, bloquesData ?? [], timezone);
  const items: ItemLinea[] = (bloquesData ?? []).map((b: any) => ({
    id: b.id,
    tipo: b.tipo,
    inicio: b.inicio,
    fin: b.fin,
    estado: b.estado,
    titulo: titulos.get(b.id) ?? '—',
    esActual: ahoraUtc >= b.inicio && ahoraUtc < b.fin,
  }));

  // ¿Hay un bloque EN_EL_AIRE? El índice único garantiza que es, a lo
  // sumo, uno solo — puede haber arrancado desde este dispositivo o
  // desde otro, por eso se busca acá y no se asume que esté en `items`.
  const { data: bloqueEnCurso } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id')
    .eq('user_id', ctx.userId)
    .eq('estado', 'EN_EL_AIRE')
    .maybeSingle();
  const enElAireInicial = bloqueEnCurso ? await obtenerDatosEnElAire(ctx.userId, bloqueEnCurso.id) : null;

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.hoy.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.hoy.titulo}</h1>

      <HoyCliente valorDialHoy={dialHoy?.frecuencia ?? null} items={items} timezone={timezone} enElAireInicial={enElAireInicial} />
    </div>
  );
}
