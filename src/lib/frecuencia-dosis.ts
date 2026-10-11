/**
 * Frecuencia — arma, desde la base (cliente de sesión, RLS real), el
 * cumplimiento semanal por tarea y le pide a la función pura
 * (frecuencia/dosis.ts) las propuestas de ajuste de dosis.
 * Los umbrales salen de frecuencia_knowledge_blocks['reglas_dosis'].
 */
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getReglasDosis } from '@/lib/frecuencia-kb';
import { fechaLocal, fechaMasDias, horaEnTimezoneAUtc, lunesDeLaSemana } from '@/lib/frecuencia-fecha';
import { proponerAjustesDosis, type AjusteDosisPropuesto, type SemanaDeCumplimiento } from '@/lib/frecuencia/dosis';

export async function obtenerAjustesDosis(userId: string, timezone: string): Promise<AjusteDosisPropuesto[]> {
  const reglasKb = await getReglasDosis();
  const subir = reglasKb?.umbral_subir_dosis;
  const bajar = reglasKb?.umbral_bajar_dosis;
  // La base puede traer el placeholder {todo:true}: sin números válidos no se propone nada.
  const semanasOk = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 12;
  const pctOk = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 1;
  if (!subir || !bajar || !semanasOk(subir.semanas) || !semanasOk(bajar.semanas) || !pctOk(subir.cumplimiento_min) || !pctOk(bajar.cumplimiento_max)) return [];

  const supabase = createSupabaseServerClient();
  const { data: tareasData } = await (supabase as any).from('frecuencia_tareas').select('id, titulo, dosis_actual, dosis_objetivo, updated_at').eq('user_id', userId);
  const tareas = ((tareasData ?? []) as any[]).map((t) => ({ id: t.id as string, titulo: t.titulo as string, dosisActual: (t.dosis_actual ?? 1) as number, dosisObjetivo: (t.dosis_objetivo ?? null) as number | null, cambiadaEn: t.updated_at ? fechaLocal(timezone, new Date(t.updated_at)) : null }));
  if (!tareas.length) return [];

  // Solo semanas ya terminadas (la actual todavía se está viviendo).
  const cuantas = Math.max(subir.semanas, bajar.semanas);
  const lunesActual = lunesDeLaSemana(timezone);
  const lunes: string[] = Array.from({ length: cuantas }, (_, i) => fechaMasDias(lunesActual, -7 * (i + 1)));
  const desde = horaEnTimezoneAUtc(lunes[lunes.length - 1], '00:00', timezone).toISOString();
  const hasta = horaEnTimezoneAUtc(lunesActual, '00:00', timezone).toISOString();

  const { data: bloques } = await (supabase as any)
    .from('frecuencia_bloques')
    .select('tarea_id, tipo, inicio, estado')
    .eq('user_id', userId)
    .not('tarea_id', 'is', null)
    .in('tipo', ['EJECUTAR', 'ORQUESTAR'])
    .gte('inicio', desde)
    .lt('inicio', hasta);

  const semanas: SemanaDeCumplimiento[] = lunes.map((l) => ({ lunes: l, porTarea: {} }));
  for (const b of (bloques ?? []) as any[]) {
    const lunesDelBloque = lunesDeLaSemana(timezone, new Date(b.inicio));
    const semana = semanas.find((s) => s.lunes === lunesDelBloque);
    if (!semana) continue;
    const acum = (semana.porTarea[b.tarea_id] ??= { planificados: 0, cumplidos: 0 });
    acum.planificados += 1;
    if (b.estado === 'CUMPLIDO') acum.cumplidos += 1;
  }

  return proponerAjustesDosis(tareas, semanas, {
    subir: { semanas: subir.semanas, cumplimientoMin: subir.cumplimiento_min },
    bajar: { semanas: bajar.semanas, cumplimientoMax: bajar.cumplimiento_max },
  });
}
