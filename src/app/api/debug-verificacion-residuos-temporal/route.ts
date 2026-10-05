/**
 * TEMPORAL — verificación puntual pedida por Diego:
 * 1) residuo de cuentas de prueba en personas/profiles/notifications
 * 2) la fila 29 de profiles (28 -> 29)
 * Solo lectura. Gated por FRECUENCIA_C8_SECRET. Borrar al terminar.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

const PATRONES_TEST = [
  'frecuencia-test.aretesoluciones.space',
  'frecuencia-captura.aretesoluciones.space',
  'frecuencia-f3-test.aretesoluciones.space',
];

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createSupabaseAdminClient() as any;

  // ── 1. Residuo en personas, profiles, notifications ────────────────
  const residuo: Record<string, unknown> = {};

  for (const dominio of PATRONES_TEST) {
    const { data: personasResiduo } = await admin
      .from('personas')
      .select('id, nombre, email, user_id, created_at')
      .like('email', `%@${dominio}`);
    residuo[`personas__${dominio}`] = personasResiduo ?? [];

    const { data: profilesResiduo } = await admin
      .from('profiles')
      .select('id, email, role, created_at')
      .like('email', `%@${dominio}`);
    residuo[`profiles__${dominio}`] = profilesResiduo ?? [];
  }

  // auth.users también (por si profiles no cascadeó pero el user sigue)
  const { data: authUsers } = await admin.auth.admin.listUsers();
  const authResiduo = (authUsers?.users ?? []).filter((u: any) =>
    PATRONES_TEST.some((d) => u.email?.endsWith(`@${d}`))
  );
  residuo['auth_users_residuo'] = authResiduo.map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at }));

  // notifications: por los ids que hayan quedado en profiles-residuo de cualquier dominio
  const idsResiduo = [
    ...(residuo['profiles__frecuencia-test.aretesoluciones.space'] as any[]).map((p) => p.id),
    ...(residuo['profiles__frecuencia-captura.aretesoluciones.space'] as any[]).map((p) => p.id),
    ...(residuo['profiles__frecuencia-f3-test.aretesoluciones.space'] as any[]).map((p) => p.id),
    ...authResiduo.map((u: any) => u.id),
  ];
  const idsUnicos = [...new Set(idsResiduo)];
  if (idsUnicos.length > 0) {
    const { data: notifResiduo } = await admin
      .from('notifications')
      .select('id, user_id, type, title, created_at')
      .in('user_id', idsUnicos);
    residuo['notifications_residuo'] = notifResiduo ?? [];
  } else {
    residuo['notifications_residuo'] = [];
  }

  const totalResiduo = Object.entries(residuo)
    .filter(([k]) => k !== 'auth_users_residuo' && k !== 'notifications_residuo')
    .reduce((acc, [, v]) => acc + (Array.isArray(v) ? v.length : 0), 0)
    + authResiduo.length
    + (residuo['notifications_residuo'] as any[]).length;

  // ── 2. Profiles completo, para ver la fila de más (28 -> 29) ───────
  const { data: todosLosProfiles, count } = await admin
    .from('profiles')
    .select('id, email, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: true });

  return NextResponse.json({
    residuo,
    totalResiduo,
    todoLimpio: totalResiduo === 0,
    profiles: { count, filas: todosLosProfiles },
  });
}
