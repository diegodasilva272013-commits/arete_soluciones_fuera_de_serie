import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaMasDias, horaEnTimezoneAUtc, lunesDeLaSemana } from '@/lib/frecuencia-fecha';
import { getAreasVida, getAreasReglas, getMapaEnergiaDefault, getOnboardingCopy } from '@/lib/frecuencia-kb';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { RevisionCliente, type MetricasSemana, type PreguntaEnergia } from './_revision-cliente';

export default async function RevisionPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();
  const { data: pref } = await (supabase as any).from('frecuencia_preferencias').select('timezone, hora_despertar').eq('user_id', ctx.userId).maybeSingle();
  const timezone = (pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';

  const lunes = lunesDeLaSemana(timezone);
  const desde = horaEnTimezoneAUtc(lunes, '00:00', timezone).toISOString();
  const hasta = horaEnTimezoneAUtc(fechaMasDias(lunes, 7), '00:00', timezone).toISOString();
  const hastaSiguiente = horaEnTimezoneAUtc(fechaMasDias(lunes, 14), '00:00', timezone).toISOString();

  // ── "Decite la verdad": entrenamiento cumplido (principal) y avance del objetivo (secundaria) ──
  const { data: bloques } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('tarea_id, estado')
    .eq('user_id', ctx.userId)
    .not('tarea_id', 'is', null)
    .in('tipo', ['EJECUTAR', 'ORQUESTAR'])
    .gte('inicio', desde)
    .lt('inicio', hasta);
  const { data: tareas } = await (supabase as any).from('frecuencia_tareas').select('id, titulo').eq('user_id', ctx.userId);

  const porTarea = new Map<string, { titulo: string; planificados: number; cumplidos: number }>();
  for (const t of (tareas ?? []) as any[]) porTarea.set(t.id, { titulo: t.titulo, planificados: 0, cumplidos: 0 });
  for (const b of (bloques ?? []) as any[]) {
    const acum = porTarea.get(b.tarea_id);
    if (!acum) continue;
    acum.planificados += 1;
    if (b.estado === 'CUMPLIDO') acum.cumplidos += 1;
  }
  const lista = Array.from(porTarea.values());
  const metricas: MetricasSemana = {
    planificados: lista.reduce((n, t) => n + t.planificados, 0),
    cumplidos: lista.reduce((n, t) => n + t.cumplidos, 0),
    tareasConAvance: lista.filter((t) => t.cumplidos > 0).length,
    tareasTotal: lista.filter((t) => t.planificados > 0).length,
    porTarea: lista.filter((t) => t.planificados > 0).map((t) => ({ titulo: t.titulo, planificados: t.planificados, cumplidos: t.cumplidos })),
  };

  // ── Revisión ya guardada esta semana (para precargar) ──
  const { data: revision } = await (supabase as any).from('frecuencia_revisiones').select('que_funciono, que_no').eq('user_id', ctx.userId).eq('semana', lunes).maybeSingle();

  // ── Áreas ──
  const areas = (await getAreasVida()) ?? [];
  const reglas = await getAreasReglas();
  const { data: filasAreas } = await (supabase as any).from('frecuencia_areas').select('area_key, nivel_actual, es_palanca, es_manzana_podrida').eq('user_id', ctx.userId);
  const niveles: Record<string, number> = {};
  let palanca: string | null = null;
  let manzana: string | null = null;
  for (const f of (filasAreas ?? []) as any[]) {
    niveles[f.area_key] = f.nivel_actual;
    if (f.es_palanca) palanca = f.area_key;
    if (f.es_manzana_podrida) manzana = f.area_key;
  }

  // ── Energía: ¿toca rediagnosticar? (cada `frecuencia_rediagnostico_semanas`, desde la base) ──
  const mapaDefault = await getMapaEnergiaDefault();
  const semanasRedx = (mapaDefault as any)?.frecuencia_rediagnostico_semanas as number | undefined;
  const { data: mapa } = await (supabase as any).from('frecuencia_mapa_energia').select('franjas, fecha_diagnostico').eq('user_id', ctx.userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  let tocaEnergia = false;
  if (typeof semanasRedx === 'number' && mapa?.fecha_diagnostico) {
    tocaEnergia = Date.now() - new Date(mapa.fecha_diagnostico).getTime() >= semanasRedx * 7 * 24 * 3600 * 1000;
  }
  const franjasIniciales: Record<string, string> = {};
  for (const f of (mapa?.franjas ?? []) as any[]) franjasIniciales[f.tipo] = f.respuesta;
  const textos = await getOnboardingCopy();
  const preguntasEnergia: PreguntaEnergia[] = (textos?.pasos.energia.preguntas ?? []).filter((p) => p.key !== 'hora_despertar').map((p) => ({ key: p.key, pregunta: p.pregunta, ayuda: p.ayuda ?? null }));

  // ── ¿La semana que viene ya está armada? ──
  const { count: yaArmada } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)
    .not('tarea_id', 'is', null)
    .gte('inicio', hasta)
    .lt('inicio', hastaSiguiente);

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.revision.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.revision.titulo}</h1>

      <RevisionCliente
        metricas={metricas}
        queFuncionoInicial={(revision?.que_funciono as string[] | undefined) ?? []}
        queNoInicial={(revision?.que_no as string[] | undefined) ?? []}
        areas={areas}
        reglas={reglas}
        nivelesIniciales={niveles}
        palancaInicial={palanca}
        manzanaInicial={manzana}
        tocaEnergia={tocaEnergia}
        preguntasEnergia={preguntasEnergia}
        horaDespertarInicial={pref?.hora_despertar?.slice(0, 5) ?? ''}
        franjasIniciales={franjasIniciales}
        semanaSiguienteYaArmada={(yaArmada ?? 0) > 0}
      />
    </div>
  );
}
