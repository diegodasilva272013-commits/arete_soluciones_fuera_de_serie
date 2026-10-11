'use server';

import { cookies } from 'next/headers';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const COOKIE = 'propuesta-bombas-de-agua';
const MAX_AGE = 60 * 60 * 48; // 48 h

export async function checkPassword(pwd: string): Promise<{ ok: boolean }> {
  const expected = process.env.PROPUESTA_BOMBAS_CLAVE;
  if (!expected || pwd.trim() !== expected) return { ok: false };

  cookies().set(COOKIE, 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return { ok: true };
}

const DESTINO = 'diegodasilva272013@gmail.com';
const ASUNTO = '✅ Propuesta Bombas y motores de agua — aceptada';
const CORREO_ARETE = 'arete@aretesoluciones.space';

// Devuelve ok:true SOLO si el mail realmente salió. Primero por el SMTP de
// Hostinger (SMTP_PASS, el mismo que usa el resto del sitio) y, si no está
// configurado o falla, por Resend. Si no hay ningún medio, devuelve ok:false
// para que la página no diga "fuimos notificados" cuando no es cierto.
export async function notifyAcceptance(): Promise<{ ok: boolean }> {
  const fecha = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;padding:40px">
  <h2 style="color:#1a6fff;margin-bottom:8px">Propuesta aceptada</h2>
  <p style="color:#666;margin-top:0">La empresa de bombas y motores de agua revisó y aceptó la propuesta de la web con catálogo.</p>
  <table style="width:100%;border-collapse:collapse;margin-top:24px">
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:700;width:180px">Propuesta</td>
      <td style="padding:10px 14px">Web con catálogo, panel propio y botón de WhatsApp</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:700">Total</td>
      <td style="padding:10px 14px"><b>USD 620</b></td>
    </tr>
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:700">Forma de pago</td>
      <td style="padding:10px 14px">50% al confirmar (USD 310) · 50% al terminar (USD 310)</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:700">Aceptado el</td>
      <td style="padding:10px 14px">${fecha}</td>
    </tr>
  </table>
  <p style="margin-top:32px;font-size:13px;color:#999">Areté Soluciones · Sistema de propuestas</p>
</div>`;

  const pass = process.env.SMTP_PASS;
  if (pass) {
    const user = process.env.SMTP_USER || CORREO_ARETE;
    const port = Number(process.env.SMTP_PORT || 465);
    try {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transport.sendMail({ from: `Areté Propuestas <${user}>`, to: DESTINO, subject: ASUNTO, html });
      transport.close();
      return { ok: true };
    } catch (e) {
      console.error('[propuesta-bombas] SMTP falló', e);
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const { error } = await new Resend(key).emails.send({
        from: 'Areté Propuestas <ia@aretesoluciones.com>',
        to: [DESTINO],
        subject: ASUNTO,
        html,
      });
      if (!error) return { ok: true };
      console.error('[propuesta-bombas] Resend rechazó el mail', error);
    } catch (e) {
      console.error('[propuesta-bombas] Resend falló', e);
    }
  }

  console.error('[propuesta-bombas] aceptación sin enviar: no hay SMTP_PASS ni RESEND_API_KEY que funcione');
  return { ok: false };
}
