import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Alta pública de una postulación de reclutamiento. Sin auth — lo usa
 * cualquier visitante de /reclutamiento — así que escribe siempre con
 * la service_role key (nunca expone la tabla vía RLS a un rol
 * público) y valida a mano en vez de confiar en constraints del
 * cliente.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });

  const {
    nombre, apellido, email, edad, telefono,
    experiencia, motivo, motivacion,
    // Honeypot: campo invisible para humanos en el form; si viene
    // completo, es un bot rellenando todos los inputs del DOM.
    website,
  } = body as Record<string, unknown>;

  if (typeof website === 'string' && website.trim() !== '') {
    // Responde OK sin escribir nada — no le da al bot ninguna señal
    // de que fue detectado.
    return NextResponse.json({ id: 'ok' });
  }

  if (typeof nombre !== 'string' || !nombre.trim()) {
    return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 });
  }
  if (typeof apellido !== 'string' || !apellido.trim()) {
    return NextResponse.json({ error: 'Falta el apellido' }, { status: 400 });
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }
  const edadNum = typeof edad === 'number' ? edad : Number(edad);
  if (!Number.isFinite(edadNum) || edadNum < 16 || edadNum > 90) {
    return NextResponse.json({ error: 'Edad inválida' }, { status: 400 });
  }
  if (typeof motivo !== 'string' || motivo.trim().length < 10) {
    return NextResponse.json({ error: 'Contanos un poco más por qué querés ser parte del equipo' }, { status: 400 });
  }
  if (typeof motivacion !== 'string' || motivacion.trim().length < 10) {
    return NextResponse.json({ error: 'Contanos un poco más qué te motiva a tomar este puesto' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient() as any;

  // Verificar si el teléfono ya existe
  const telefonoClean = typeof telefono === 'string' && telefono.trim() ? telefono.trim() : null;
  if (telefonoClean) {
    const { data: existing } = await admin
      .from('reclutamiento_postulantes')
      .select('id')
      .eq('telefono', telefonoClean)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Este número de teléfono ya tiene una postulación registrada.' },
        { status: 409 }
      );
    }
  }

  const { data, error } = await admin
    .from('reclutamiento_postulantes')
    .insert({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      edad: edadNum,
      telefono: typeof telefono === 'string' && telefono.trim() ? telefono.trim() : null,
      experiencia: typeof experiencia === 'string' ? experiencia.trim() : null,
      motivo: motivo.trim(),
      motivacion: motivacion.trim(),
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'No se pudo guardar la postulación' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id as string });
}
