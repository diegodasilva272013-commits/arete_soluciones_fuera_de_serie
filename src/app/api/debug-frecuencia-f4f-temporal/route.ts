/**
 * TEMPORAL — evidencia de Frecuencia Fase 4 parte F (cierre del día).
 * Mismo patrón que las partes anteriores: cuenta vía Auth, datos
 * mínimos, se borra al final con verificación de residuo cero.
 * Borrar este archivo una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const DOMINIO_TEST = 'frecuencia-f4f-evidencia.aretesoluciones.space';
const EMAIL = `setter@${DOMINIO_TEST}`;
const PASSWORD = 'Frecuencia-F4F-Evidencia-2026!';

type Resultado = { paso: string; ok: boolean; detalle?: unknown };

function admin() {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
}

async function limpiarTodo(a: any, userId: string | null) {
  if (userId) {
    await a.from('frecuencia_ideas').delete().eq('user_id', userId);
    await a.from('frecuencia_evidencia').delete().eq('user_id', userId);
    await a.from('frecuencia_bloques').delete().eq('user_id', userId);
    await a.from('frecuencia_dial').delete().eq('user_id', userId);
    await a.from('frecuencia_espejo').delete().eq('user_id', userId);
    await a.from('frecuencia_tareas').delete().eq('user_id', userId);
    await a.from('frecuencia_objetivos').delete().eq('user_id', userId);
    await a.from('frecuencia_areas').delete().eq('user_id', userId);
    await a.from('frecuencia_identidad').delete().eq('user_id', userId);
    await a.from('frecuencia_preferencias').delete().eq('user_id', userId);
  }
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
    const { data: residuoPersonas } = await a.from('personas').select('id, email').like('email', `%@${DOMINIO_TEST}`);
    push('sin residuo en personas', (residuoPersonas?.length ?? 0) === 0, residuoPersonas);
    const { data: residuoProfiles } = await a.from('profiles').select('id, email').like('email', `%@${DOMINIO_TEST}`);
    push('sin residuo en profiles', (residuoProfiles?.length ?? 0) === 0, residuoProfiles);
    if (user) {
      const { data: residuoBloques } = await a.from('frecuencia_bloques').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_bloques', (residuoBloques?.length ?? 0) === 0, residuoBloques);
      const { data: residuoEvidencia } = await a.from('frecuencia_evidencia').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_evidencia', (residuoEvidencia?.length ?? 0) === 0, residuoEvidencia);
      const { data: residuoEspejo } = await a.from('frecuencia_espejo').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_espejo', (residuoEspejo?.length ?? 0) === 0, residuoEspejo);
      const { data: residuoDial } = await a.from('frecuencia_dial').select('id').eq('user_id', user.id);
      push('sin residuo en frecuencia_dial', (residuoDial?.length ?? 0) === 0, residuoDial);
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
  await limpiarTodo(a, userId);

  const { error: metaErr } = await a.auth.admin.updateUserById(userId, { user_metadata: { onboarding_done: true } });
  push('onboarding_done (saltar presentación obligatoria)', !metaErr, metaErr?.message);

  const { error: roleErr } = await a.from('profiles').update({ role: 'setter' }).eq('id', userId);
  push('rol setter', !roleErr, roleErr?.message);

  const { error: prefErr } = await a.from('frecuencia_preferencias').insert({ user_id: userId, timezone: 'America/Argentina/Buenos_Aires', hora_despertar: '06:00' });
  push('preferencias', !prefErr, prefErr?.message);

  const { data: objetivo, error: objErr } = await a
    .from('frecuencia_objetivos')
    .insert({ user_id: userId, titulo: 'Cerrar el mes sin sobresaltos', area_key: 'libertad_financiera' })
    .select('id')
    .single();
  push('objetivo', !objErr, objErr?.message);

  const { data: tareaCumplida, error: t1Err } = await a
    .from('frecuencia_tareas')
    .insert({ user_id: userId, objetivo_id: objetivo?.id, titulo: 'Llamar 3 prospectos', tipo_energia: 'profundo', duracion_min: 60 })
    .select('id')
    .single();
  push('tarea 1 (va a quedar CUMPLIDA)', !t1Err, t1Err?.message);

  const { data: tareaFallida, error: t2Err } = await a
    .from('frecuencia_tareas')
    .insert({ user_id: userId, objetivo_id: objetivo?.id, titulo: 'Armar el presupuesto del mes', tipo_energia: 'decision', duracion_min: 30 })
    .select('id')
    .single();
  push('tarea 2 (va a quedar NO_SALIO)', !t2Err, t2Err?.message);

  // Bloque de HOY ya CUMPLIDO, con evidencia automática (simula que ya se usó EN EL AIRE).
  const ahora = new Date();
  const hace2h = new Date(ahora.getTime() - 2 * 3600000);
  const hace1h = new Date(ahora.getTime() - 1 * 3600000);
  const { data: bloqueCumplido, error: bc1Err } = await a
    .from('frecuencia_bloques')
    .insert({
      user_id: userId,
      tarea_id: tareaCumplida?.id,
      tipo: 'EJECUTAR',
      inicio: hace2h.toISOString(),
      fin: hace1h.toISOString(),
      estado: 'CUMPLIDO',
      inicio_real: hace2h.toISOString(),
      fin_real: hace1h.toISOString(),
      minutos_reales_foco: 58,
    })
    .select('id')
    .single();
  push('bloque hoy CUMPLIDO', !bc1Err, bc1Err?.message);

  if (bloqueCumplido?.id) {
    const { error: evErr } = await a.from('frecuencia_evidencia').insert({
      user_id: userId,
      bloque_id: bloqueCumplido.id,
      fecha: ahora.toISOString().slice(0, 10),
      texto: 'Llamar 3 prospectos — 58 min de foco real.',
      tipo: 'ENTRENAMIENTO_CUMPLIDO',
    });
    push('evidencia automática del bloque cumplido', !evErr, evErr?.message);
  }

  // Bloque de HOY ya NO_SALIO (para disparar los pasos ante falla).
  const { error: bc2Err } = await a.from('frecuencia_bloques').insert({
    user_id: userId,
    tarea_id: tareaFallida?.id,
    tipo: 'ORQUESTAR',
    inicio: hace1h.toISOString(),
    fin: ahora.toISOString(),
    estado: 'NO_SALIO',
    inicio_real: hace1h.toISOString(),
    fin_real: ahora.toISOString(),
    minutos_reales_foco: 3,
  });
  push('bloque hoy NO_SALIO (dispara pasos ante falla)', !bc2Err, bc2Err?.message);

  // Bloques de MAÑANA (para "diseñar mañana").
  const manana6 = new Date(ahora.getTime() + 24 * 3600000);
  manana6.setUTCHours(9, 0, 0, 0); // 06:00 America/Argentina (UTC-3) aprox
  const manana7 = new Date(manana6.getTime() + 3600000);
  const { error: bmErr } = await a.from('frecuencia_bloques').insert({
    user_id: userId,
    tarea_id: tareaCumplida?.id,
    tipo: 'EJECUTAR',
    inicio: manana6.toISOString(),
    fin: manana7.toISOString(),
    estado: 'PROGRAMADO',
  });
  push('bloque de mañana (para disenar manana)', !bmErr, bmErr?.message);

  return NextResponse.json({ email: EMAIL, password: PASSWORD, userId, resultados });
}
