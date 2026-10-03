import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { enviarConfirmacion } from '@/lib/fds-temporada-email';
import { TEMPORADA_SLUG } from '@/app/fuera-de-serie/temporada-1/_data';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/fuera-de-serie/temporada-1/registro
 *
 * Alta pública a las clases en vivo de la Temporada 1. Sin auth —
 * escribe con la service_role key (igual que /api/reclutamiento/postular)
 * y valida a mano. Re-registrarse con el mismo mail actualiza los datos
 * en vez de duplicar la fila.
 */
export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'anon';
  if (!rateLimit(`fds-t1:${ip}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: 'Demasiados intentos. Probá de nuevo en unos minutos.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

  const { nombre, apellido, edad, email, telefono, motivo, website } = body as Record<string, unknown>;

  // Honeypot: si viene completo es un bot. Responde OK sin escribir nada.
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  if (typeof nombre !== 'string' || !nombre.trim()) {
    return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 });
  }
  if (typeof apellido !== 'string' || !apellido.trim()) {
    return NextResponse.json({ error: 'Falta el apellido' }, { status: 400 });
  }
  const edadNum = typeof edad === 'number' ? edad : Number(edad);
  if (!Number.isInteger(edadNum) || edadNum < 14 || edadNum > 99) {
    return NextResponse.json({ error: 'Edad inválida' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Mail inválido' }, { status: 400 });
  }
  if (typeof telefono !== 'string' || telefono.replace(/\D/g, '').length < 6) {
    return NextResponse.json({ error: 'Teléfono inválido' }, { status: 400 });
  }
  if (typeof motivo !== 'string' || motivo.trim().length < 10) {
    return NextResponse.json({ error: 'Contanos un poco más qué esperás de las clases' }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();
  const telDigits = telefono.replace(/\D/g, '');
  const admin = createSupabaseAdminClient() as any;

  const { data: existente } = await admin
    .from('fds_temporada_registros')
    .select('id, zoom_enviado_at')
    .eq('temporada', TEMPORADA_SLUG)
    .eq('email', emailNorm)
    .maybeSingle();

  // Mismo teléfono con otro mail → no dejar inscribirse de nuevo. Se compara
  // solo por dígitos (sin +, espacios ni guiones) para que no se cuelen
  // duplicados por formato. No hay índice único en la base para esto —
  // se trae la lista de teléfonos ya inscriptos y se compara acá; para la
  // escala de esta inscripción (cientos, no millones) es más que suficiente.
  if (!existente) {
    const { data: telefonos } = await admin
      .from('fds_temporada_registros')
      .select('telefono')
      .eq('temporada', TEMPORADA_SLUG);
    const yaExiste = ((telefonos ?? []) as { telefono: string }[]).some(
      (r) => r.telefono.replace(/\D/g, '') === telDigits
    );
    if (yaExiste) {
      return NextResponse.json({ error: 'Ese teléfono ya está inscripto en la Temporada 1.' }, { status: 409 });
    }
  }

  const { error } = await admin
    .from('fds_temporada_registros')
    .upsert(
      {
        temporada: TEMPORADA_SLUG,
        nombre: nombre.trim().slice(0, 80),
        apellido: apellido.trim().slice(0, 80),
        edad: edadNum,
        email: emailNorm,
        telefono: telefono.trim().slice(0, 40),
        motivo: motivo.trim().slice(0, 2000),
      },
      { onConflict: 'temporada,email' }
    );

  if (error) {
    console.error('[fds-t1/registro]', error);
    return NextResponse.json({ error: 'No pudimos guardar tu registro. Probá de nuevo.' }, { status: 500 });
  }

  // Mail de confirmación (incluye el Zoom) solo en el primer registro;
  // si sale bien, la fila queda marcada como enviada.
  if (!existente) {
    const enviado = await enviarConfirmacion(emailNorm, nombre.trim());
    if (enviado) {
      await admin
        .from('fds_temporada_registros')
        .update({ zoom_enviado_at: new Date().toISOString() })
        .eq('temporada', TEMPORADA_SLUG)
        .eq('email', emailNorm);
    }
  }

  return NextResponse.json({ ok: true });
}
