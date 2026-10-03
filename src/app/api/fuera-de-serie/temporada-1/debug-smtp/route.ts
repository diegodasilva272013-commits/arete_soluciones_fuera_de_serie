/**
 * GET /api/fuera-de-serie/temporada-1/debug-smtp
 *
 * TEMPORAL — para diagnosticar por qué el mail de confirmación de
 * Temporada 1 no llega. Verifica la conexión SMTP a Hostinger desde
 * el entorno real de Vercel (las credenciales ya se probaron bien
 * desde afuera de Vercel, así que esto aísla si el problema es algo
 * específico de la red de Vercel). Borrar este archivo una vez resuelto.
 */
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const pass = process.env.SMTP_PASS;
  if (!pass) {
    return NextResponse.json({ ok: false, step: 'env', error: 'SMTP_PASS no está seteada en este runtime' });
  }

  const user = process.env.SMTP_USER || 'arete@aretesoluciones.space';
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = Number(process.env.SMTP_PORT || 465);

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  try {
    await transport.verify();
    return NextResponse.json({ ok: true, host, port, user, passLength: pass.length });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      step: 'verify',
      host, port, user, passLength: pass.length,
      error: err?.message ?? String(err),
      code: err?.code ?? null,
      response: err?.response ?? null,
    });
  }
}
