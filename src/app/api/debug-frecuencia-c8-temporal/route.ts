/**
 * TEMPORAL — test de aislamiento C8 (v4) + verificación de acceso por
 * rol. Crea cuentas de prueba vía Supabase Auth (admin client), nunca
 * insertando a mano en profiles. Requiere que la migración 0078 v4 ya
 * esté corrida. Idempotente: limpia sus propios datos al empezar y al
 * terminar, así se puede correr muchas veces sin acumular basura ni
 * romper por UNIQUE. Solo GET, solo corre si
 * process.env.FRECUENCIA_C8_SECRET matchea el header. Borrar este
 * archivo (y las cuentas de prueba) una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const DOMINIO_TEST = 'frecuencia-test.aretesoluciones.space'; // dominio inventado, no recibe mail real
const PASSWORD = 'Frecuencia-Test-2026!';
const BUCKET = 'frecuencia-imagenes';

type Resultado = { paso: string; ok: boolean; detalle?: unknown };

const codigosRls = new Set<string>();
const registrarCodigo = (error: unknown) => {
  const code = (error as { code?: string } | null)?.code;
  if (code) codigosRls.add(code);
};

async function signIn(email: string) {
  const anon = createClient(env.supabase.url, env.supabase.anonKey);
  const { data, error } = await anon.auth.signInWithPassword({ email, password: PASSWORD });
  if (error || !data.session) throw new Error(`No se pudo loguear ${email}: ${error?.message}`);
  return createClient(env.supabase.url, env.supabase.anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
  });
}

async function limpiarDatosDeTest(admin: any, userIds: string[]) {
  if (userIds.length === 0) return;
  await admin.from('frecuencia_delegaciones').delete().in('de_user_id', userIds);
  await admin.from('frecuencia_imagenes').delete().in('user_id', userIds);
  await admin.from('frecuencia_evidencia').delete().in('user_id', userIds);
  await admin.from('frecuencia_bloques').delete().in('user_id', userIds);
  await admin.from('frecuencia_criterios').delete().in('user_id', userIds);
  await admin.from('frecuencia_tareas').delete().in('user_id', userIds);
  await admin.from('frecuencia_objetivos').delete().in('user_id', userIds);
  await admin.from('frecuencia_ideas').delete().in('user_id', userIds);
  await admin.from('frecuencia_revisiones').delete().in('user_id', userIds);
  await admin.from('frecuencia_compromisos').delete().in('user_id', userIds);
  await admin.from('frecuencia_dial').delete().in('user_id', userIds);
  await admin.from('frecuencia_espejo').delete().in('user_id', userIds);
  await admin.from('frecuencia_equipo_miembros').delete().in('user_id', userIds);
  await admin.from('frecuencia_equipos').delete().in('lider_id', userIds);
  // Efecto colateral de un trigger de OTRO subsistema (Motor de
  // Evolución, migración 0036): poner role='setter' crea una fila en
  // `personas` con ON CONFLICT (user_id) DO NOTHING — no está
  // deduplicado por email. Si no se borra acá, la próxima corrida crea
  // un usuario nuevo con el mismo email de prueba y choca contra
  // `personas_email_key` (fila huérfana de la corrida anterior), y el
  // UPDATE de role completo para esa fila. Se borra por dominio de
  // email de prueba, no por user_id, porque la fila puede haber
  // quedado huérfana tras borrar la cuenta de Auth.
  await admin.from('personas').delete().like('email', `%@${DOMINIO_TEST}`);
  for (const uid of userIds) {
    const { data: files } = await admin.storage.from(BUCKET).list(uid);
    if (files?.length) {
      await admin.storage.from(BUCKET).remove(files.map((f: { name: string }) => `${uid}/${f.name}`));
    }
  }
}

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
  const resultados: Resultado[] = [];
  const push = (paso: string, ok: boolean, detalle?: unknown) => resultados.push({ paso, ok, detalle });

  // ── 1. Crear/recuperar usuarios de prueba vía Auth (idempotente) ───
  const cuentas = [
    { key: 'setter',  email: `frecuencia-test-setter@${DOMINIO_TEST}`,  role: 'setter' },
    { key: 'student', email: `frecuencia-test-student@${DOMINIO_TEST}`, role: 'student' },
    { key: 'admin',   email: `frecuencia-test-admin@${DOMINIO_TEST}`,   role: 'admin' },
    { key: 'a',       email: `frecuencia-test-a@${DOMINIO_TEST}`,       role: 'setter' }, // líder de AB
    { key: 'b',       email: `frecuencia-test-b@${DOMINIO_TEST}`,       role: 'setter' }, // miembro de AB
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

  const todosLosIds = Object.values(ids);

  // Idempotencia: limpiar cualquier resto de una corrida anterior que
  // no haya llegado a la limpieza final (por ejemplo, por un crash).
  await limpiarDatosDeTest(admin, todosLosIds);

  // ── 2. Armar equipos. El trigger frecuencia_al_crear_equipo carga al
  // líder como miembro solo — no hace falta insertarlo a mano. ───────
  const { data: equipoAB, error: eqErr } = await admin
    .from('frecuencia_equipos')
    .insert({ nombre: 'Equipo test AB', lider_id: ids.a })
    .select('id')
    .single();
  push('crear frecuencia_equipos (A líder)', !eqErr, eqErr?.message);

  const { data: equipoC, error: eqcErr } = await admin
    .from('frecuencia_equipos')
    .insert({ nombre: 'Equipo test C', lider_id: ids.c })
    .select('id')
    .single();
  push('crear frecuencia_equipos (C, otro equipo)', !eqcErr, eqcErr?.message);

  if (equipoAB) {
    const { error: memErr } = await admin.from('frecuencia_equipo_miembros').insert({
      equipo_id: equipoAB.id, user_id: ids.b, rol_en_equipo: 'miembro',
    });
    push('agregar B como miembro del equipo AB', !memErr, memErr?.message);
  }

  const { data: miembrosAB } = await admin.from('frecuencia_equipo_miembros').select('user_id').eq('equipo_id', equipoAB?.id);
  push('trigger cargó a A (líder) como miembro automáticamente', !!miembrosAB?.some((m: any) => m.user_id === ids.a), { miembros: miembrosAB });

  // ── 3. Datos de prueba de B: íntimos + compartidos + delegables ────
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
  push('insertar frecuencia_bloques de B (visible para su líder)', !bloqueErr, bloqueErr?.message);

  const { error: evidErr } = await admin.from('frecuencia_evidencia').insert({
    user_id: ids.b, bloque_id: bloqueB?.id ?? null, fecha: '2026-10-04', texto: 'test', tipo: 'LOGRO',
  });
  push('insertar frecuencia_evidencia de B (visible para su líder)', !evidErr, evidErr?.message);

  const { data: objetivoB, error: objErr } = await admin.from('frecuencia_objetivos').insert({
    user_id: ids.b, titulo: 'Objetivo test de B',
  }).select('id').single();
  push('insertar frecuencia_objetivos de B', !objErr, objErr?.message);

  const { error: ideaErr } = await admin.from('frecuencia_ideas').insert({ user_id: ids.b, texto: 'Idea test de B' });
  push('insertar frecuencia_ideas de B', !ideaErr, ideaErr?.message);

  const { error: revErr } = await admin.from('frecuencia_revisiones').insert({ user_id: ids.b, semana: '2026-09-28' });
  push('insertar frecuencia_revisiones de B', !revErr, revErr?.message);

  const { data: tareaB, error: tareaErr } = await admin.from('frecuencia_tareas').insert({
    user_id: ids.b, objetivo_id: objetivoB?.id ?? null, titulo: 'Tarea delegable de B',
  }).select('id, titulo').single();
  push('insertar frecuencia_tareas de B (para delegar)', !tareaErr, tareaErr?.message);

  const { data: criterioB, error: critErr } = await admin.from('frecuencia_criterios').insert({
    user_id: ids.b, ambito: 'personal', titulo: 'Criterio de B', que_se_decide: 'test',
  }).select('id, titulo').single();
  push('insertar frecuencia_criterios de B (para delegar)', !critErr, critErr?.message);

  const { data: compromisoB, error: compErr } = await admin.from('frecuencia_compromisos').insert({
    user_id: ids.b, co_conductor_id: ids.a, texto_mensual: 'Compromiso test de B', mes: '2026-10-01',
  }).select('id, avance').single();
  push('insertar frecuencia_compromisos de B (co-conductor A)', !compErr, compErr?.message);

  // Un archivo de B en storage, para probar aislamiento de carpetas.
  const { error: uploadErr } = await admin.storage.from(BUCKET).upload(
    `${ids.b}/evidencia-test.png`,
    new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
    { contentType: 'image/png', upsert: true },
  );
  push('subir archivo de prueba de B a storage', !uploadErr, uploadErr?.message);

  // ── 4. Sesiones reales de cada usuario (RLS de verdad, no admin) ────
  const clienteSetter = await signIn(cuentas.find(c => c.key === 'setter')!.email);
  const clienteStudent = await signIn(cuentas.find(c => c.key === 'student')!.email);
  const clienteA = await signIn(cuentas.find(c => c.key === 'a')!.email);
  const clienteB = await signIn(cuentas.find(c => c.key === 'b')!.email);
  const clienteC = await signIn(cuentas.find(c => c.key === 'c')!.email);
  const clienteAdmin = await signIn(cuentas.find(c => c.key === 'admin')!.email);
  const clienteAnon = createClient(env.supabase.url, env.supabase.anonKey); // sin sesión

  // B ve a A en la lista de miembros de su propio equipo (necesario
  // para elegir a quién delegar). C no ve nada del equipo AB.
  const rBVeEquipoAB = await clienteB.from('frecuencia_equipo_miembros').select('user_id').eq('equipo_id', equipoAB?.id);
  registrarCodigo(rBVeEquipoAB.error);
  push('B ve a A en la lista de miembros de su equipo', !rBVeEquipoAB.error && !!rBVeEquipoAB.data?.some((m: any) => m.user_id === ids.a), { filas: rBVeEquipoAB.data?.length });

  const rCVeEquipoAB = await clienteC.from('frecuencia_equipo_miembros').select('user_id').eq('equipo_id', equipoAB?.id);
  registrarCodigo(rCVeEquipoAB.error);
  push('C NO ve a nadie del equipo AB', !rCVeEquipoAB.error && (rCVeEquipoAB.data?.length ?? 0) === 0, { filas: rCVeEquipoAB.data?.length });

  // A (líder del equipo de B) ve bloques/evidencia de B.
  const r1 = await clienteA.from('frecuencia_bloques').select('id').eq('user_id', ids.b);
  registrarCodigo(r1.error);
  push('A (líder) VE los bloques de B', !r1.error && (r1.data?.length ?? 0) > 0, { filas: r1.data?.length, error: r1.error?.message });

  const r2 = await clienteA.from('frecuencia_evidencia').select('id').eq('user_id', ids.b);
  registrarCodigo(r2.error);
  push('A (líder) VE la evidencia de B', !r2.error && (r2.data?.length ?? 0) > 0, { filas: r2.data?.length });

  // A NO ve el dial ni el espejo de B (íntimo). "NO ve" exige 0 filas
  // Y sin error — RLS en SELECT filtra en silencio, nunca debería
  // devolver un error real acá.
  const r3 = await clienteA.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  registrarCodigo(r3.error);
  push('A (líder) NO ve el dial de B (íntimo) — 0 filas, sin error', !r3.error && (r3.data?.length ?? 0) === 0, { filas: r3.data?.length, error: r3.error?.message });

  const r4 = await clienteA.from('frecuencia_espejo').select('id').eq('user_id', ids.b);
  registrarCodigo(r4.error);
  push('A (líder) NO ve el espejo de B (íntimo) — 0 filas, sin error', !r4.error && (r4.data?.length ?? 0) === 0, { filas: r4.data?.length });

  // C (otro equipo) no ve nada de B.
  const r5 = await clienteC.from('frecuencia_bloques').select('id').eq('user_id', ids.b);
  registrarCodigo(r5.error);
  push('C (otro equipo) NO ve los bloques de B', !r5.error && (r5.data?.length ?? 0) === 0, { filas: r5.data?.length });

  const r6 = await clienteC.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  registrarCodigo(r6.error);
  push('C (otro equipo) NO ve el dial de B', !r6.error && (r6.data?.length ?? 0) === 0, { filas: r6.data?.length });

  // admin (no dueño) no ve nada personal ni compartido de B.
  const r7 = await clienteAdmin.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  registrarCodigo(r7.error);
  push('admin (no dueño) NO ve el dial de B (íntimo)', !r7.error && (r7.data?.length ?? 0) === 0, { filas: r7.data?.length });

  const r8 = await clienteAdmin.from('frecuencia_espejo').select('id').eq('user_id', ids.b);
  registrarCodigo(r8.error);
  push('admin (no dueño) NO ve el espejo de B (íntimo)', !r8.error && (r8.data?.length ?? 0) === 0, { filas: r8.data?.length });

  const r9 = await clienteAdmin.from('frecuencia_bloques').select('id').eq('user_id', ids.b);
  registrarCodigo(r9.error);
  push('admin (no dueño) NO ve los bloques de B (sin excepción de admin)', !r9.error && (r9.data?.length ?? 0) === 0, { filas: r9.data?.length });

  const r10 = await clienteAdmin.from('frecuencia_objetivos').select('id').eq('user_id', ids.b);
  registrarCodigo(r10.error);
  push('admin (no dueño) NO ve los objetivos de B → 0 filas', !r10.error && (r10.data?.length ?? 0) === 0, { filas: r10.data?.length });

  const r11 = await clienteAdmin.from('frecuencia_ideas').select('id').eq('user_id', ids.b);
  registrarCodigo(r11.error);
  push('admin (no dueño) NO ve las ideas de B → 0 filas', !r11.error && (r11.data?.length ?? 0) === 0, { filas: r11.data?.length });

  const r12 = await clienteAdmin.from('frecuencia_revisiones').select('id').eq('user_id', ids.b);
  registrarCodigo(r12.error);
  push('admin (no dueño) NO ve las revisiones de B → 0 filas', !r12.error && (r12.data?.length ?? 0) === 0, { filas: r12.data?.length });

  // Sin sesión (anon): o error de permiso, o 0 filas — nunca filas reales.
  const r13 = await clienteAnon.from('frecuencia_dial').select('id').eq('user_id', ids.b);
  registrarCodigo(r13.error);
  const anonBloqueado = (r13.data?.length ?? 0) === 0; // con o sin error, mientras no haya filas
  push('sin sesión (anon) NO obtiene filas del dial de B', anonBloqueado, { filas: r13.data?.length, error: r13.error?.message, code: r13.error?.code });

  // INSERTs que deben fallar con error real (violan WITH CHECK).
  const r14 = await clienteB.from('frecuencia_dial').insert({ user_id: ids.a, fecha: '2026-10-05', momento: 'noche', frecuencia: 10 });
  registrarCodigo(r14.error);
  push('B NO puede insertar un dial a nombre de A', !!r14.error, r14.error?.message);

  const r15 = await clienteAdmin.from('frecuencia_bloques').insert({ user_id: ids.b, tipo: 'FOCO', inicio: '2026-10-05T10:00:00Z', fin: '2026-10-05T11:00:00Z' });
  registrarCodigo(r15.error);
  push('admin NO puede insertar un bloque a nombre de B', !!r15.error, r15.error?.message);

  const r16 = await clienteC.from('frecuencia_equipos').insert({ nombre: 'Equipo pirata de C', lider_id: ids.c });
  registrarCodigo(r16.error);
  push('C (no admin) NO puede crear un frecuencia_equipos', !!r16.error, r16.error?.message);

  const r17 = await clienteC.from('frecuencia_equipo_miembros').insert({ equipo_id: equipoAB?.id, user_id: ids.c, rol_en_equipo: 'miembro' });
  registrarCodigo(r17.error);
  push('C (no admin) NO puede agregarse como miembro de otro equipo', !!r17.error, r17.error?.message);

  const r18 = await clienteStudent.from('frecuencia_objetivos').insert({ user_id: ids.student, titulo: 'Objetivo de student, no debería poder' });
  registrarCodigo(r18.error);
  push('student NO puede insertar en frecuencia_objetivos (rol no habilitado)', !!r18.error, r18.error?.message);

  const r19 = await clienteSetter.from('frecuencia_objetivos').insert({ user_id: ids.setter, titulo: 'Objetivo de setter, control positivo' });
  registrarCodigo(r19.error);
  push('(control) setter SÍ puede insertar un objetivo propio', !r19.error, r19.error?.message);

  // Delegación real: B delega su tarea a A (comparten equipo AB).
  let delegacionId: string | null = null;
  if (tareaB && criterioB) {
    const rDeleg = await clienteB.from('frecuencia_delegaciones').insert({
      tarea_id: tareaB.id, de_user_id: ids.b, a_user_id: ids.a, criterio_id: criterioB.id, fecha: '2026-10-04',
    }).select('id').single();
    registrarCodigo(rDeleg.error);
    push('B delega su tarea a A (comparten equipo) → se crea', !rDeleg.error, rDeleg.error?.message);
    delegacionId = rDeleg.data?.id ?? null;

    const rDelegFail = await clienteB.from('frecuencia_delegaciones').insert({
      tarea_id: tareaB.id, de_user_id: ids.b, a_user_id: ids.c, criterio_id: criterioB.id, fecha: '2026-10-04',
    });
    registrarCodigo(rDelegFail.error);
    push('B NO puede delegarle a C (no comparten equipo)', !!rDelegFail.error, rDelegFail.error?.message);

    const rDelegASiMismo = await clienteB.from('frecuencia_delegaciones').insert({
      tarea_id: tareaB.id, de_user_id: ids.b, a_user_id: ids.b, criterio_id: criterioB.id, fecha: '2026-10-04',
    });
    registrarCodigo(rDelegASiMismo.error);
    push('B NO puede delegarse la tarea a sí mismo', !!rDelegASiMismo.error, rDelegASiMismo.error?.message);

    // A (receptor) lee la tarea y el criterio delegados.
    const rLeeTarea = await clienteA.from('frecuencia_tareas').select('id').eq('id', tareaB.id);
    registrarCodigo(rLeeTarea.error);
    push('A (receptor) LEE la tarea delegada', !rLeeTarea.error && (rLeeTarea.data?.length ?? 0) > 0, { filas: rLeeTarea.data?.length });

    const rLeeCriterio = await clienteA.from('frecuencia_criterios').select('id').eq('id', criterioB.id);
    registrarCodigo(rLeeCriterio.error);
    push('A (receptor) LEE el criterio delegado', !rLeeCriterio.error && (rLeeCriterio.data?.length ?? 0) > 0, { filas: rLeeCriterio.data?.length });

    // A (receptor) intenta editar: la fila no es visible para su propia
    // policy de UPDATE (USING user_id = auth.uid()) → Postgres filtra
    // la fila, el UPDATE afecta 0 filas, SIN error (no es un CHECK que
    // falla, es una fila invisible). Verificamos con el service role
    // que el valor real no cambió.
    const rEditaTarea = await clienteA.from('frecuencia_tareas').update({ titulo: 'hackeada' }).eq('id', tareaB.id).select('id');
    registrarCodigo(rEditaTarea.error);
    push('A (receptor) UPDATE de la tarea delegada = 0 filas, sin error', !rEditaTarea.error && (rEditaTarea.data?.length ?? 0) === 0, { filas: rEditaTarea.data?.length, error: rEditaTarea.error?.message });

    const { data: tareaTrasIntento } = await admin.from('frecuencia_tareas').select('titulo').eq('id', tareaB.id).single();
    push('(verificación service role) el título de la tarea NO cambió', tareaTrasIntento?.titulo === tareaB.titulo, { tituloActual: tareaTrasIntento?.titulo });

    const rEditaCriterio = await clienteA.from('frecuencia_criterios').update({ titulo: 'hackeado' }).eq('id', criterioB.id).select('id');
    registrarCodigo(rEditaCriterio.error);
    push('A (receptor) UPDATE del criterio delegado = 0 filas, sin error', !rEditaCriterio.error && (rEditaCriterio.data?.length ?? 0) === 0, { filas: rEditaCriterio.data?.length });

    const { data: criterioTrasIntento } = await admin.from('frecuencia_criterios').select('titulo').eq('id', criterioB.id).single();
    push('(verificación service role) el título del criterio NO cambió', criterioTrasIntento?.titulo === criterioB.titulo, { tituloActual: criterioTrasIntento?.titulo });
  }

  // Solo quien delega (B) marca "volvio" — A (receptor) no puede.
  if (delegacionId) {
    const rVolvioA = await clienteA.from('frecuencia_delegaciones').update({ volvio: true }).eq('id', delegacionId).select('id');
    registrarCodigo(rVolvioA.error);
    push('A (receptor) UPDATE "volvio" = 0 filas, sin error', !rVolvioA.error && (rVolvioA.data?.length ?? 0) === 0, { filas: rVolvioA.data?.length });

    const { data: delegTrasIntentoA } = await admin.from('frecuencia_delegaciones').select('volvio').eq('id', delegacionId).single();
    push('(verificación service role) "volvio" sigue false tras el intento de A', delegTrasIntentoA?.volvio === false, { volvio: delegTrasIntentoA?.volvio });

    const rVolvioB = await clienteB.from('frecuencia_delegaciones').update({ volvio: true }).eq('id', delegacionId).select('id');
    registrarCodigo(rVolvioB.error);
    push('B (quien delega) SÍ puede marcar "volvio"', !rVolvioB.error && (rVolvioB.data?.length ?? 0) > 0, { filas: rVolvioB.data?.length });
  }

  // ── Compromisos: solo vía función, nunca UPDATE directo ─────────────
  if (compromisoB) {
    const rFnA = await clienteA.rpc('frecuencia_actualizar_avance_compromiso', { p_compromiso_id: compromisoB.id, p_avance: 50 });
    registrarCodigo(rFnA.error);
    push('A (co-conductor) actualiza avance vía función → OK', !rFnA.error, rFnA.error?.message);

    const { data: compTrasA } = await admin.from('frecuencia_compromisos').select('avance').eq('id', compromisoB.id).single();
    push('(verificación service role) avance quedó en 50 tras la función', compTrasA?.avance === 50, { avance: compTrasA?.avance });

    const rFnC = await clienteC.rpc('frecuencia_actualizar_avance_compromiso', { p_compromiso_id: compromisoB.id, p_avance: 99 });
    registrarCodigo(rFnC.error);
    push('C (ajeno) NO puede actualizar avance vía función', !!rFnC.error, rFnC.error?.message);

    const { data: compTrasC } = await admin.from('frecuencia_compromisos').select('avance').eq('id', compromisoB.id).single();
    push('(verificación service role) avance sigue en 50 tras el intento de C', compTrasC?.avance === 50, { avance: compTrasC?.avance });

    const rUpdateDirecto = await clienteA.from('frecuencia_compromisos').update({ avance: 1 }).eq('id', compromisoB.id).select('id');
    registrarCodigo(rUpdateDirecto.error);
    push('A (co-conductor) NO puede hacer UPDATE directo (solo por función)', !rUpdateDirecto.error && (rUpdateDirecto.data?.length ?? 0) === 0, { filas: rUpdateDirecto.data?.length });
  }

  // ── Storage: aislamiento por carpeta de usuario ─────────────────────
  const rListaPropia = await clienteB.storage.from(BUCKET).list(ids.b);
  push('B lista su propia carpeta en storage', !rListaPropia.error && (rListaPropia.data?.length ?? 0) > 0, { archivos: rListaPropia.data?.length, error: rListaPropia.error?.message });

  const rListaAjena = await clienteC.storage.from(BUCKET).list(ids.b);
  const listaAjenaVacia = !!rListaAjena.error || (rListaAjena.data?.length ?? 0) === 0;
  push('C NO ve los archivos de la carpeta de B', listaAjenaVacia, { archivos: rListaAjena.data?.length, error: rListaAjena.error?.message });

  const rSubeAjeno = await clienteC.storage.from(BUCKET).upload(`${ids.b}/intento-de-c.png`, new Blob([new Uint8Array([9])], { type: 'image/png' }));
  push('C NO puede subir un archivo a la carpeta de B', !!rSubeAjeno.error, rSubeAjeno.error?.message);

  // ── Verificación de acceso por rol a Frecuencia (capa de app) ───────
  const { tieneAccesoFrecuencia } = await import('@/lib/frecuencia-access');
  push('rol setter tiene acceso a Frecuencia', (await tieneAccesoFrecuencia('setter')) === true);
  push('rol student NO tiene acceso a Frecuencia', (await tieneAccesoFrecuencia('student')) === false);

  // Ninguna consulta de todo el test devolvió 42P17 (recursión de RLS).
  push('ninguna consulta devolvió 42P17 (recursión de RLS)', !codigosRls.has('42P17'), { codigosVistos: Array.from(codigosRls) });

  // ── Limpieza final — deja todo como estaba antes de esta corrida,
  // incluidas las 6 cuentas de Auth (no se reutilizan entre corridas).
  await limpiarDatosDeTest(admin, todosLosIds);

  for (const uid of todosLosIds) {
    const { error: delUserErr } = await admin.auth.admin.deleteUser(uid);
    push(`borrar cuenta de Auth ${uid}`, !delUserErr, delUserErr?.message);
  }

  const todoOk = resultados.every(r => r.ok);
  return NextResponse.json({ todoOk, resultados, ids });
}
