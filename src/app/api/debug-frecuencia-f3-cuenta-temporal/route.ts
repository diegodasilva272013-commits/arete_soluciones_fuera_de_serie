/**
 * TEMPORAL — crea/borra UNA cuenta setter de prueba para la evidencia
 * Playwright de la Fase 3 (onboarding + Dial + Ecualizador). GET
 * ?accion=crear | ?accion=borrar | ?accion=verificar (consulta de
 * confirmación de filas guardadas, con la sesión de la propia cuenta
 * de prueba — no admin). Gated por FRECUENCIA_C8_SECRET.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const EMAIL = 'setter@frecuencia-f3-test.aretesoluciones.space';
const PASSWORD = 'Frecuencia-F3-Test-2026!';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
  const accion = req.nextUrl.searchParams.get('accion');

  const { data: existentes } = await admin.auth.admin.listUsers();
  const existente = existentes?.users?.find((u: any) => u.email === EMAIL);

  if (accion === 'borrar') {
    if (!existente) return NextResponse.json({ borrado: true, nota: 'ya no existía' });
    const { error } = await admin.auth.admin.deleteUser(existente.id);
    return NextResponse.json({ borrado: !error, error: error?.message });
  }

  if (accion === 'reiniciar') {
    if (!existente) return NextResponse.json({ error: 'no existe la cuenta de prueba' }, { status: 404 });
    const tablas = [
      'frecuencia_delegaciones', 'frecuencia_imagenes', 'frecuencia_evidencia', 'frecuencia_bloques',
      'frecuencia_criterios', 'frecuencia_tareas', 'frecuencia_objetivos', 'frecuencia_ideas',
      'frecuencia_revisiones', 'frecuencia_compromisos', 'frecuencia_dial', 'frecuencia_espejo',
      'frecuencia_mapa_energia', 'frecuencia_areas', 'frecuencia_identidad', 'frecuencia_preferencias',
      'frecuencia_equipo_miembros', 'frecuencia_equipos',
    ];
    for (const t of tablas) {
      await admin.from(t).delete().eq('user_id', existente.id);
      await admin.from(t).delete().eq('lider_id', existente.id);
    }
    return NextResponse.json({ reiniciado: true });
  }

  if (accion === 'verificar') {
    if (!existente) return NextResponse.json({ error: 'no existe la cuenta de prueba' }, { status: 404 });
    const anon = createClient(env.supabase.url, env.supabase.anonKey);
    const { data: sesion, error: errLogin } = await anon.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
    if (errLogin || !sesion.session) return NextResponse.json({ error: errLogin?.message }, { status: 500 });
    const cliente = createClient(env.supabase.url, env.supabase.anonKey, {
      global: { headers: { Authorization: `Bearer ${sesion.session.access_token}` } },
    }) as any;

    const tablas = ['frecuencia_identidad', 'frecuencia_preferencias', 'frecuencia_areas', 'frecuencia_dial', 'frecuencia_espejo', 'frecuencia_objetivos', 'frecuencia_mapa_energia'];
    const resultado: Record<string, unknown> = {};
    for (const t of tablas) {
      const { data, error } = await cliente.from(t).select('*').eq('user_id', existente.id);
      resultado[t] = error ? { error: error.message } : data;
    }
    return NextResponse.json(resultado);
  }

  // crear
  // Limpiar antes cualquier fila huérfana en `personas` (trigger de
  // otro subsistema, migración 0036, deduplicado solo por user_id, no
  // por email) — si no, poner role='setter' choca contra
  // personas_email_key en cuentas reusadas entre corridas.
  await admin.from('personas').delete().eq('email', EMAIL);
  let user = existente;
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { onboarding_done: true, frecuencia_f3_test: true },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    user = data.user;
  } else {
    await admin.auth.admin.updateUserById(user.id, { user_metadata: { onboarding_done: true, frecuencia_f3_test: true } });
  }
  const { error: roleErr } = await admin.from('profiles').update({ role: 'setter' }).eq('id', user.id);

  return NextResponse.json({ id: user.id, email: EMAIL, ok: !roleErr, error: roleErr?.message });
}
