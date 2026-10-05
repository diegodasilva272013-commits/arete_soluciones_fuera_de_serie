/**
 * TEMPORAL — crea o borra las 2 cuentas de prueba (setter + student)
 * usadas solo para las capturas de pantalla de /frecuencia. Separado
 * del test C8 a propósito: este endpoint no toca datos frecuencia_,
 * solo crea/borra las cuentas de Auth + su role en profiles.
 * GET ?accion=crear | GET ?accion=borrar. Gated por
 * FRECUENCIA_C8_SECRET. Borrar este archivo una vez terminado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const DOMINIO_TEST = 'frecuencia-captura.aretesoluciones.space';
const PASSWORD = 'Frecuencia-Captura-2026!';

const CUENTAS = [
  { email: `setter@${DOMINIO_TEST}`, role: 'setter' },
  { email: `student@${DOMINIO_TEST}`, role: 'student' },
] as const;

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey) as any;
  const accion = req.nextUrl.searchParams.get('accion');

  const { data: existentes } = await admin.auth.admin.listUsers();

  if (accion === 'borrar') {
    const resultados = [];
    for (const cuenta of CUENTAS) {
      const user = existentes?.users?.find((u: any) => u.email === cuenta.email);
      if (user) {
        const { error } = await admin.auth.admin.deleteUser(user.id);
        resultados.push({ email: cuenta.email, borrado: !error, error: error?.message });
      } else {
        resultados.push({ email: cuenta.email, borrado: true, nota: 'ya no existía' });
      }
    }
    return NextResponse.json({ resultados });
  }

  const resultados = [];
  for (const cuenta of CUENTAS) {
    let user = existentes?.users?.find((u: any) => u.email === cuenta.email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email: cuenta.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { onboarding_done: true, frecuencia_captura: true },
      });
      if (error) { resultados.push({ email: cuenta.email, ok: false, error: error.message }); continue; }
      user = data.user;
    } else {
      await admin.auth.admin.updateUserById(user.id, { user_metadata: { onboarding_done: true, frecuencia_captura: true } });
    }
    const { error: roleErr } = await admin.from('profiles').update({ role: cuenta.role }).eq('id', user.id);
    resultados.push({ email: cuenta.email, id: user.id, role: cuenta.role, ok: !roleErr, error: roleErr?.message });
  }

  return NextResponse.json({ resultados, password: PASSWORD });
}
