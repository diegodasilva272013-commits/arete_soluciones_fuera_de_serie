/**
 * TEMPORAL — test de aislamiento C8 + verificación de acceso por rol.
 * Crea cuentas de prueba vía Supabase Auth (admin client), nunca
 * insertando a mano en profiles. Requiere que la migración 0078 ya
 * esté corrida (las tablas frecuencia_ tienen que existir). Solo GET,
 * solo corre si process.env.FRECUENCIA_C8_SECRET matchea el header —
 * para que no quede como un endpoint abierto que cualquiera dispare.
 * Borrar este archivo (y las cuentas de prueba) una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const DOMINIO_TEST = 'frecuencia-test.aretesoluciones.space'; // dominio inventado, no recibe mail real
const PASSWORD = 'Frecuencia-Test-2026!';

type Resultado = { paso: string; ok: boolean; detalle?: unknown };

async function signIn(email: string) {
  const anon = createClient(env.supabase.url, env.supabase.anonKey);
  const { data, error } = await anon.auth.signInWithPassword({ email, password: PASSWORD });
  if (error || !data.session) throw new Error(`No se pudo loguear ${email}: ${error?.message}`);
  return createClient(env.supabase.url, env.supabase.anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  });
}

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
  const resultados: Resultado[] = [];
  const push = (paso: string, ok: boolean, detalle?: unknown) => resultados.push({ paso, ok, detalle });

  // ── 1. Crear/recuperar usuarios de prueba vía Auth ──────────────────
  const cuentas = [
    { key: 'setter',  email: `frecuencia-test-setter@${DOMINIO_TEST}`,  role: 'setter' },
    { key: 'student', email: `frecuencia-test-student@${DOMINIO_TEST}`, role: 'student' },
    { key: 'admin',   email: `frecuencia-test-admin@${DOMINIO_TEST}`,   role: 'admin' },
    { key: 'a',       email: `frecuencia-test-a@${DOMINIO_TEST}`,       role: 'setter' }, // líder
    { key: 'b',       email: `frecuencia-test-b@${DOMINIO_TEST}`,       role: 'setter' }, // miembro del equipo de A
    { key: 'c',       email: `frecuencia-test-c@${DOMINIO_TEST}`,       role: 'setter' }, // otro equipo
  ] as const;

  const ids: Record<string, string> = {};

  for (const cuenta of cuentas) {
    const { data: existentes } = await admin.auth.admin.listUsers();
    let user = existentes?.users?.find((u: any) => u.email === cuenta.email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email: cuenta.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { frecuencia_test: true },
      });
      if (error) { push(`crear usuario ${cuenta.key}`, false, error.message); continue; }
      user = data.user;
    }
    ids[cuenta.key] = user.id;
    const { error: roleErr } = await admin.from('profiles').update({ role: cuenta.role }).eq('id', user.id);
    push(`usuario ${cuenta.key} (${cuenta.email}) con role=${cuenta.role}`, !roleErr, roleErr?.message);
  }

  if (!ids.a || !ids.b || !ids.c) {
    return NextResponse.json({ error: 'Faltó crear algún usuario — ver resultados', resultados }, { status: 500 });
  }

  // ── 2. Armar equipos: A líder de un equipo con A y B; C en otro ─────
  const { data: equipoAB, error: eqErr } = await admin
    .from('frecuencia_equipos')
    .insert({ nombre: 'Equipo test AB', lider_id: ids.a })
    .select('id')
    .single();
  push('crear frecuencia_equipos (A líder, con B)', !eqErr, eqErr?.message);

  const { data: equipoC, error: eqcErr } = await admin
    .from('frecuencia_equipos')
    .insert({ nombre: 'Equipo test C', lider_id: ids.c })
    .select('id')
    .single();
  push('crear frecuencia_equipos (C, otro equipo)', !eqcErr, eqcErr?.message);

  if (equipoAB) {
    const { error: memErr } = await admin.from('frecuencia_equipo_miembros').insert([
      { equipo_id: equipoAB.id, user_id: ids.a, rol_en_equipo: 'lider' },
      { equipo_id: equipoAB.id, user_id: ids.b, rol_en_equipo: 'miembro' },
    ]);
    push('agregar A y B como miembros del equipo AB', !memErr, memErr?.message);
  }

  // ── 3. Datos de prueba de B: íntimos + compartidos ──────────────────
  const { error: dialErr } = await admin.from('frecuencia_dial').insert({
    user_id: ids.b, fecha: '2026-10-04', momento: 'manana', frecuencia: 50,
  });
  push('insertar frecuencia_dial de B (íntimo)', !dialErr, dialErr?.message);

  const { error: espejoErr } = await admin.from('frecuencia_espejo').insert({
    user_id: ids.b, fecha: '2026-10-04', momento: 'manana', como_me_siento: 'test',
  });
  push('insertar frecuencia_espejo de B (íntimo)', !espejoErr, espejoErr?.message);

  const { data: bloqueB, error: bloqueErr } = await admin.from('frecuencia_bloques').insert({
    user_id: ids.b, tipo: 'FOCO', inicio: '2026-10-04T10:00:00Z', fin: '2026-10-04T11:00:00Z',
  }).select('id').single();
  push('insertar frecuencia_bloques de B (compartido con líder)', !bloqueErr, bloqueErr?.message);

  const { error: evidErr } = await admin.from('frecuencia_evidencia').insert({
    user_id: ids.b, bloque_id: bloqueB?.id ?? null, fecha: '2026-10-04', texto: 'test', tipo: 'LOGRO',
  });
  push('insertar frecuencia_evidencia de B (compartido con líder)', !evidErr, evidErr?.message);

  // ── 4. Sesiones reales de cada usuario (RLS de verdad, no admin) ────
  const clienteA = await signIn(cuentas.find(c => c.key === 'a')!.email);
  const clienteB = await signIn(cuentas.find(c => c.key === 'b')!.email);
  const clienteC = await signIn(cuentas.find(c => c.key === 'c')!.email);
  const clienteAdmin = await signIn(cuentas.find(c => c.key === 'admin')!.email);

  // A (líder del equipo de B) ve bloques/evidencia de B.
  const { data: aVeBloquesB } = await clienteA.from('frecuencia_bloques').select('id').eq('user_id', ids.b);
  push('A (líder) VE los bloques de B', (aVeBloquesB?.length ?? 0) > 0, { filas: aVeBloquesB?.length });

  const { data: aVeEvidenciaB } = await clienteA.from('frecuencia_evidencia').select('id').eq('user_id', ids.b);
  push('A (líder) VE la evidencia de B', (aVeEvidenciaB?.length ?? 0) > 0, { filas: aVeEvidenciaB?.length });

  // A NO ve el dial ni el espejo de B (íntimo, sin excepción de líder).
  const { data: aVeDialB } = await clienteA.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  push('A (líder) NO ve el dial de B (íntimo)', (aVeDialB?.length ?? 0) === 0, { filas: aVeDialB?.length });

  const { data: aVeEspejoB } = await clienteA.from('frecuencia_espejo').select('id').eq('user_id', ids.b);
  push('A (líder) NO ve el espejo de B (íntimo)', (aVeEspejoB?.length ?? 0) === 0, { filas: aVeEspejoB?.length });

  // C (otro equipo) no ve nada de B, ni compartido ni íntimo.
  const { data: cVeBloquesB } = await clienteC.from('frecuencia_bloques').select('id').eq('user_id', ids.b);
  push('C (otro equipo) NO ve los bloques de B', (cVeBloquesB?.length ?? 0) === 0, { filas: cVeBloquesB?.length });

  const { data: cVeDialB } = await clienteC.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  push('C (otro equipo) NO ve el dial de B', (cVeDialB?.length ?? 0) === 0, { filas: cVeDialB?.length });

  // admin (no dueño) no ve el dial ni el espejo de B — punto 16 de la orden.
  const { data: adminVeDialB } = await clienteAdmin.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  push('admin (no dueño) NO ve el dial de B (íntimo)', (adminVeDialB?.length ?? 0) === 0, { filas: adminVeDialB?.length });

  const { data: adminVeEspejoB } = await clienteAdmin.from('frecuencia_espejo').select('id').eq('user_id', ids.b);
  push('admin (no dueño) NO ve el espejo de B (íntimo)', (adminVeEspejoB?.length ?? 0) === 0, { filas: adminVeEspejoB?.length });

  // admin SÍ ve (solo lectura) los bloques de B — admin lee el resto, no escribe.
  const { data: adminVeBloquesB } = await clienteAdmin.from('frecuencia_bloques').select('id').eq('user_id', ids.b);
  push('admin VE (solo lectura) los bloques de B', (adminVeBloquesB?.length ?? 0) > 0, { filas: adminVeBloquesB?.length });

  // B no puede insertar un dial a nombre de A (nadie escribe filas ajenas).
  const { error: insertAjenoErr } = await clienteB.from('frecuencia_dial').insert({
    user_id: ids.a, fecha: '2026-10-05', momento: 'noche', frecuencia: 10,
  });
  push('B NO puede insertar un dial a nombre de A', !!insertAjenoErr, insertAjenoErr?.message);

  // admin no puede insertar un bloque a nombre de B (admin no escribe filas ajenas).
  const { error: adminInsertAjenoErr } = await clienteAdmin.from('frecuencia_bloques').insert({
    user_id: ids.b, tipo: 'FOCO', inicio: '2026-10-05T10:00:00Z', fin: '2026-10-05T11:00:00Z',
  });
  push('admin NO puede insertar un bloque a nombre de B', !!adminInsertAjenoErr, adminInsertAjenoErr?.message);

  // ── 5. Verificación de acceso por rol a Frecuencia ──────────────────
  const { tieneAccesoFrecuencia } = await import('@/lib/frecuencia-access');
  const setterHabilitado = await tieneAccesoFrecuencia('setter');
  const studentHabilitado = await tieneAccesoFrecuencia('student');
  push('rol setter tiene acceso a Frecuencia', setterHabilitado === true);
  push('rol student NO tiene acceso a Frecuencia', studentHabilitado === false);

  const todoOk = resultados.every(r => r.ok);
  return NextResponse.json({ todoOk, resultados, ids });
}
