import { NextResponse } from 'next/server';
import { EMAIL } from '../../constants';

export const runtime = 'nodejs';

type Body = {
  nombre?: string;
  empresa?: string;
  email?: string;
  mensaje?: string;
};

/**
 * Envía el formulario de contacto de /empresa vía Resend (HTTP API directa,
 * sin agregar el paquete 'resend' como dependencia). Si RESEND_API_KEY no
 * está configurada, el frontend (contacto/page.tsx) ni siquiera muestra el
 * formulario — este handler existe para cuando se configure la key.
 */
export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'El envío por formulario no está configurado todavía. Escribinos por WhatsApp.' },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const nombre = (body.nombre ?? '').trim();
  const empresa = (body.empresa ?? '').trim();
  const email = (body.email ?? '').trim();
  const mensaje = (body.mensaje ?? '').trim();

  if (!nombre || !email || !mensaje) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
  }

  const from = process.env.RESEND_FROM_EMAIL || `Areté Soluciones <onboarding@resend.dev>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: EMAIL,
        reply_to: email,
        subject: `Nuevo contacto de ${nombre}${empresa ? ` (${empresa})` : ''}`,
        text: `Nombre: ${nombre}\nEmpresa: ${empresa || '—'}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Resend error', res.status, detail);
      return NextResponse.json({ error: 'No pudimos enviar el mensaje. Probá por WhatsApp.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form send failed', err);
    return NextResponse.json({ error: 'No pudimos enviar el mensaje. Probá por WhatsApp.' }, { status: 500 });
  }
}
