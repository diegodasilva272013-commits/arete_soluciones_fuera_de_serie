'use server';

import { cookies } from 'next/headers';
import { Resend } from 'resend';

const COOKIE  = 'propuesta-providus';
const MAX_AGE = 60 * 60 * 48; // 48 h

export async function checkPassword(pwd: string): Promise<{ ok: boolean }> {
  const expected = process.env.PROPUESTA_PROVIDUS_CLAVE;
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

export async function notifyAcceptance(): Promise<{ ok: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: true };

  try {
    const resend = new Resend(key);
    const fecha = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      dateStyle: 'full',
      timeStyle: 'short',
    });
    await resend.emails.send({
      from:    'Areté Propuestas <ia@aretesoluciones.com>',
      to:      ['diegodasilva272013@gmail.com'],
      subject: '✅ Propuesta Providus S.A. — aceptada',
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;padding:40px">
  <h2 style="color:#1a6fff;margin-bottom:8px">Propuesta aceptada</h2>
  <p style="color:#666;margin-top:0">Providus S.A. revisó y aceptó la propuesta de la plataforma de captación.</p>
  <table style="width:100%;border-collapse:collapse;margin-top:24px">
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:700;width:180px">Propuesta</td>
      <td style="padding:10px 14px">Providus — Plataforma de captación, gestión y venta</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:700">Módulo 1</td>
      <td style="padding:10px 14px">Captación, reparto y métricas — USD 15.000</td>
    </tr>
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:700">Módulo 2</td>
      <td style="padding:10px 14px">Agente de inteligencia artificial — USD 7.000</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:700">Total</td>
      <td style="padding:10px 14px"><b>USD 22.000</b> · 50% al inicio y 50% contra entrega, por módulo</td>
    </tr>
    <tr style="background:#f5f5f5">
      <td style="padding:10px 14px;font-weight:700">Plazo</td>
      <td style="padding:10px 14px">1 mes por módulo</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;font-weight:700">Aceptado el</td>
      <td style="padding:10px 14px">${fecha}</td>
    </tr>
  </table>
  <p style="margin-top:32px;font-size:13px;color:#999">Areté Soluciones · Sistema de propuestas</p>
</div>`,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
