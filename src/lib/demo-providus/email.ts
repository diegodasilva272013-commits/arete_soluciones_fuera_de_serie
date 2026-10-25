/**
 * DEMO PROVIDUS — mail de bienvenida al cliente, desde arete@aretesoluciones.space. Solo servidor.
 * Camino principal: SMTP de Hostinger (SMTP_PASS). Respaldo: Resend. Nunca lanza: devuelve el estado.
 */
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const CORREO_ARETE = 'arete@aretesoluciones.space';
const REMITENTE = `Providus <${CORREO_ARETE}>`;

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export interface DatosMail { nombre: string; vendedor: string | null; promotora: string | null; evento: string | null }

export function armarMail(d: DatosMail): { asunto: string; html: string; texto: string } {
  const asunto = `${d.nombre}, gracias por visitarnos en Providus`;
  const lineas = [
    `Hola ${d.nombre},`,
    d.evento ? `Gracias por pasar por nuestro stand en ${d.evento}. Ya tenemos tus datos.` : 'Gracias por pasar por nuestro stand. Ya tenemos tus datos.',
    d.vendedor ? `${d.vendedor} del equipo de Providus se va a comunicar con vos para contarte todo.` : 'Un asesor del equipo de Providus se va a comunicar con vos para contarte todo.',
    'Si no esperabas este mensaje, ignoralo.',
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;background:#fff">
  <div style="background:#0b0907;padding:26px 30px"><div style="font-weight:800;font-size:24px;color:#f0562a;letter-spacing:.02em">Providus</div></div>
  <div style="padding:28px 30px;font-size:16px;line-height:1.6">${lineas.map((l) => `<p style="margin:0 0 14px">${esc(l)}</p>`).join('')}<p style="margin:22px 0 0;color:#555">Equipo Providus</p></div>
</div>`;
  return { asunto, html, texto: `${lineas.join('\n\n')}\n\nEquipo Providus` };
}

export type ResultadoMail = { estado: 'enviado' } | { estado: 'omitido' } | { estado: 'fallido'; error: string };

export async function enviarMailCliente(para: string, d: DatosMail): Promise<ResultadoMail> {
  const m = armarMail(d);
  try {
    const pass = process.env.SMTP_PASS;
    if (pass) {
      const user = process.env.SMTP_USER || CORREO_ARETE;
      const puerto = Number(process.env.SMTP_PORT || 465);
      const t = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.hostinger.com', port: puerto, secure: puerto === 465, auth: { user, pass } });
      await t.sendMail({ from: REMITENTE, to: para, subject: m.asunto, html: m.html, text: m.texto, replyTo: CORREO_ARETE });
      return { estado: 'enviado' };
    }
    const key = process.env.RESEND_API_KEY;
    if (!key) return { estado: 'omitido' };
    const r = await new Resend(key).emails.send({ from: REMITENTE, to: [para], subject: m.asunto, html: m.html, text: m.texto, replyTo: CORREO_ARETE });
    return r.error ? { estado: 'fallido', error: r.error.message } : { estado: 'enviado' };
  } catch (e) {
    return { estado: 'fallido', error: e instanceof Error ? e.message : String(e) };
  }
}
