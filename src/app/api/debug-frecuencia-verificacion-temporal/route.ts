/**
 * TEMPORAL — confirma que la limpieza del test C8 borró todo: filas
 * frecuencia_* y las 6 cuentas de prueba (auth.users + profiles).
 * Solo GET, gated por FRECUENCIA_C8_SECRET. Borrar una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const DOMINIO_TEST = 'frecuencia-test.aretesoluciones.space';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;

  const { data: usuarios } = await admin.auth.admin.listUsers();
  const cuentasRestantes = (usuarios?.users ?? []).filter((u: any) => u.email?.endsWith(`@${DOMINIO_TEST}`));

  const { data: perfilesRestantes } = await admin
    .from('profiles')
    .select('id, email')
    .like('email', `%@${DOMINIO_TEST}`);

  const conteosFrecuencia: Record<string, number | null> = {};
  for (const tabla of [
    'frecuencia_equipos', 'frecuencia_equipo_miembros', 'frecuencia_dial', 'frecuencia_espejo',
    'frecuencia_bloques', 'frecuencia_evidencia', 'frecuencia_objetivos', 'frecuencia_ideas',
    'frecuencia_revisiones', 'frecuencia_tareas', 'frecuencia_criterios', 'frecuencia_compromisos',
    'frecuencia_delegaciones', 'frecuencia_imagenes',
  ]) {
    const { count } = await admin.from(tabla).select('*', { count: 'exact', head: true });
    conteosFrecuencia[tabla] = count ?? null;
  }

  const { data: archivosBucket } = await admin.storage.from('frecuencia-imagenes').list();

  return NextResponse.json({
    cuentasAuthRestantes: cuentasRestantes.map((u: any) => u.email),
    perfilesRestantes,
    conteosFrecuencia,
    archivosEnBucket: archivosBucket,
    todoLimpio:
      cuentasRestantes.length === 0 &&
      (perfilesRestantes?.length ?? 0) === 0 &&
      Object.values(conteosFrecuencia).every((c) => c === 0) &&
      (archivosBucket?.length ?? 0) === 0,
  });
}
