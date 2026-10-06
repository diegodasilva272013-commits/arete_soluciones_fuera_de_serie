/**
 * TEMPORAL — evidencia de Frecuencia Fase 4 (Semana + Hoy). Crea UNA
 * cuenta de prueba vía Supabase Auth (admin client, nunca insertando a
 * mano en profiles) con datos mínimos para ejercitar armarSemana() a
 * través de la pantalla real, y la borra al final con verificación de
 * residuo cero (mismo patrón que el test C8 de la Fase 3, incluida la
 * limpieza de `personas` por el trigger trg_setter_to_personas). Solo
 * GET, solo corre si x-c8-secret matchea FRECUENCIA_C8_SECRET.
 * Borrar este archivo una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const DOMINIO_TEST = 'frecuencia-f4-evidencia.aretesoluciones.space';
const EMAIL = `setter@${DOMINIO_TEST}`;
const PASSWORD = 'Frecuencia-F4-Evidencia-2026!';

type Resultado = { paso: string; ok: boolean; detalle?: unknown };

function admin() {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
}

async function limpiarTodo(a: any, userId: string | null) {
  if (userId) {
    await a.from('frecuencia_ideas').delete().eq('user_id', userId);
    await a.from('frecuencia_evidencia').delete().eq('user_id', userId);
    await a.from('frecuencia_bloques').delete().eq('user_id', userId);
    await a.from('frecuencia_tareas').delete().eq('user_id', userId);
    await a.from('frecuencia_objetivos').delete().eq('user_id', userId);
    await a.from('frecuencia_areas').delete().eq('user_id', userId);
    await a.from('frecuencia_identidad').delete().eq('user_id', userId);
    await a.from('frecuencia_preferencias').delete().eq('user_id', userId);
    await a.from('frecuencia_dial').delete().eq('user_id', userId);
  }
  // Mismo efecto colateral documentado en el test C8: trg_setter_to_personas.
  await a.from('personas').delete().like('email', `%@${DOMINIO_TEST}`);
}

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const a = admin();
  const accion = req.nextUrl.searchParams.get('accion');
  const resultados: Resultado[] = [];
  const push = (paso: string, ok: boolean, detalle?: unknown) => resultados.push({ paso, ok, detalle });

  if (accion === 'borrar') {
    const { data: existentes } = await a.auth.admin.listUsers();
    const user = existentes?.users?.find((u: any) => u.email === EMAIL);
    await limpiarTodo(a, user?.id ?? null);
    if (user) {
      const { error } = await a.auth.admin.deleteUser(user.id);
      push('borrar cuenta de Auth', !error, error?.message);
    }

    // Verificación de residuo cero.
    const { data: residuoPersonas } = await a.from('personas').select('id, email').like('email', `%@${DOMINIO_TEST}`);
    push('sin residuo en personas', (residuoPersonas?.length ?? 0) === 0, residuoPersonas);
    const { data: residuoProfiles } = await a.from('profiles').select('id, email').like('email', `%@${DOMINIO_TEST}`);
    push('sin residuo en profiles', (residuoProfiles?.length ?? 0) === 0, residuoProfiles);
    if (user) {
      const { data: residuoTareas } = await a.from('frecuencia_tareas').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_tareas', (residuoTareas?.length ?? 0) === 0, residuoTareas);
      const { data: residuoBloques } = await a.from('frecuencia_bloques').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_bloques', (residuoBloques?.length ?? 0) === 0, residuoBloques);
      const { data: residuoEvidencia } = await a.from('frecuencia_evidencia').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_evidencia', (residuoEvidencia?.length ?? 0) === 0, residuoEvidencia);
    }

    return NextResponse.json({ resultados });
  }

  // ── accion=crear (default) ──
  await limpiarTodo(a, null);

  const { data: existentes } = await a.auth.admin.listUsers();
  let user = existentes?.users?.find((u: any) => u.email === EMAIL);
  if (!user) {
    const { data, error } = await a.auth.admin.createUser({ email: EMAIL, password: PASSWORD, email_confirm: true, user_metadata: { frecuencia_test: true } });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    user = data.user;
  }
  const userId = user.id;
  await limpiarTodo(a, userId); // idempotente: si ya existía con datos viejos, arranca limpio

  // Saltar el gate de "presentación obligatoria" de la plataforma
  // (middleware.ts: user_metadata.onboarding_done) — no es parte de
  // Frecuencia, pero bloquea TODA ruta privada si falta.
  const { error: metaErr } = await a.auth.admin.updateUserById(userId, { user_metadata: { onboarding_done: true } });
  push('onboarding_done (saltar presentación obligatoria)', !metaErr, metaErr?.message);

  const { error: roleErr } = await a.from('profiles').update({ role: 'setter' }).eq('id', userId);
  push('rol setter', !roleErr, roleErr?.message);

  const { error: prefErr } = await a.from('frecuencia_preferencias').insert({ user_id: userId, timezone: 'America/Argentina/Buenos_Aires', hora_despertar: '06:00' });
  push('preferencias (hora_despertar 06:00)', !prefErr, prefErr?.message);

  const { error: idErr } = await a.from('frecuencia_identidad').insert({
    user_id: userId,
    no_negociables: ['Familia (sin agendar todavía)', { texto: 'Entrenar', dia: 'lunes', horaInicio: '06:00', horaFin: '06:30' }],
  });
  push('identidad (no_negociables: 1 legacy + 1 agendado)', !idErr, idErr?.message);

  const { error: areasErr } = await a.from('frecuencia_areas').insert([
    { user_id: userId, area_key: 'salud', nivel_actual: 3, es_palanca: false, es_manzana_podrida: true },
    { user_id: userId, area_key: 'libertad_financiera', nivel_actual: 7, es_palanca: true, es_manzana_podrida: false },
  ]);
  push('areas (salud = manzana podrida)', !areasErr, areasErr?.message);

  const { data: objetivos, error: objErr } = await a
    .from('frecuencia_objetivos')
    .insert([
      { user_id: userId, titulo: 'Volver a estar fuerte', area_key: 'salud' },
      { user_id: userId, titulo: 'Cerrar el mes sin sobresaltos', area_key: 'libertad_financiera' },
    ])
    .select('id, titulo');
  push('objetivos (2, de 2 areas distintas)', !objErr, objErr?.message ?? objetivos);
  if (!objetivos || objetivos.length < 2) return NextResponse.json({ error: 'Faltó crear objetivos', resultados }, { status: 500 });

  const objSalud = objetivos.find((o: any) => o.titulo === 'Volver a estar fuerte')!.id;
  const objPlata = objetivos.find((o: any) => o.titulo === 'Cerrar el mes sin sobresaltos')!.id;

  const { data: tPresupuesto, error: t1Err } = await a
    .from('frecuencia_tareas')
    .insert({ user_id: userId, objetivo_id: objPlata, titulo: 'Armar el presupuesto del mes', tipo_energia: 'decision', duracion_min: 30, dosis_objetivo: 1 })
    .select('id')
    .single();
  push('tarea decision (presupuesto)', !t1Err, t1Err?.message);

  const { error: t2Err } = await a.from('frecuencia_tareas').insert({
    user_id: userId,
    objetivo_id: objPlata,
    titulo: 'Llamar 3 prospectos',
    tipo_energia: 'profundo',
    duracion_min: 60,
    dosis_objetivo: 2,
    desbloquea: tPresupuesto?.id ? [tPresupuesto.id] : [],
  });
  push('tarea profundo con desbloquea (prospectos -> prioridad 0)', !t2Err, t2Err?.message);

  const { data: tEntrenar, error: t3Err } = await a
    .from('frecuencia_tareas')
    .insert({ user_id: userId, objetivo_id: objSalud, titulo: 'Entrenar fuerza', tipo_energia: 'profundo', duracion_min: 45, dosis_objetivo: 3 })
    .select('id')
    .single();
  push('tarea profundo (area debil salud)', !t3Err, t3Err?.message);

  // Bloque "actual" para poder probar EN EL AIRE: ventana que incluye AHORA.
  const ahora = new Date();
  const inicioBloqueActual = new Date(ahora.getTime() - 5 * 60000).toISOString();
  const finBloqueActual = new Date(ahora.getTime() + 55 * 60000).toISOString();
  const { error: bErr } = await a.from('frecuencia_bloques').insert({
    user_id: userId,
    tarea_id: tEntrenar?.id ?? null,
    tipo: 'EJECUTAR',
    inicio: inicioBloqueActual,
    fin: finBloqueActual,
    estado: 'PROGRAMADO',
  });
  push('bloque actual (ventana incluye ahora, para probar EN EL AIRE)', !bErr, bErr?.message);

  // Confirmar que la KB tiene los valores numéricos que arrancarSemana necesita.
  const { data: reglasPlan } = await a.from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'reglas_plan').maybeSingle();
  const { data: reglasDecision } = await a.from('frecuencia_knowledge_blocks').select('valor').eq('clave', 'reglas_decision').maybeSingle();
  push('reglas_plan.imprevistos_porcentaje_dia presente', typeof reglasPlan?.valor?.imprevistos_porcentaje_dia === 'number', reglasPlan?.valor);
  push('reglas_decision.umbral_fatiga.horas_desde_despertar presente', typeof reglasDecision?.valor?.umbral_fatiga?.horas_desde_despertar === 'number', reglasDecision?.valor);

  return NextResponse.json({ email: EMAIL, password: PASSWORD, userId, resultados });
}
