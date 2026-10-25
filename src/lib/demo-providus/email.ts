/**
 * DEMO PROVIDUS — mail de bienvenida al cliente, desde arete@aretesoluciones.space. Solo servidor.
 * Camino principal: SMTP de Hostinger (SMTP_PASS). Respaldo: Resend. Nunca lanza: devuelve el estado.
 */
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const CORREO_ARETE = 'arete@aretesoluciones.space';
const REMITENTE = `Providus <${CORREO_ARETE}>`;

const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export interface DatosMail { nombre: string; apellido?: string; vendedor: string | null; promotora: string | null; evento: string | null; fotoUrl?: string | null }

export function armarMail(d: DatosMail, conFoto = false): { asunto: string; html: string; texto: string } {
  const asunto = `${d.nombre}, gracias por visitarnos en Providus`;
  const lineas = [
    `Hola ${d.nombre},`,
    d.evento ? `Es un gusto darte la bienvenida a Providus. Gracias por pasar por nuestro stand en ${d.evento}: tus datos quedaron registrados y te dejamos la foto de este momento como recuerdo.` : 'Es un gusto darte la bienvenida a Providus. Gracias por pasar por nuestro stand: tus datos quedaron registrados y te dejamos la foto de este momento como recuerdo.',
    d.promotora ? `Te atendió ${d.promotora}.` : '',
    d.vendedor ? `${d.vendedor} del equipo de Providus se va a comunicar con vos para contarte todo.` : 'Un asesor del equipo de Providus se va a comunicar con vos para contarte todo.',
    'Si no esperabas este mensaje, ignoralo.',
  ];
  const lineasOk = lineas.filter(Boolean);
  const p = (l: string) => `<p style="margin:0 0 14px">${esc(l)}</p>`;
  const foto = conFoto ? '<p style="margin:0 0 18px"><img src="cid:foto-providus" alt="Tu foto en el stand de Providus" style="display:block;width:100%;max-width:500px;height:auto;border-radius:10px"></p>' : '';
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;background:#fff">
  <div style="background:#0b0907;padding:26px 30px"><div style="font-weight:800;font-size:24px;color:#f0562a;letter-spacing:.02em">Providus</div></div>
  <div style="padding:28px 30px;font-size:16px;line-height:1.6">${lineasOk.slice(0, 3).map(p).join('')}${foto}${lineasOk.slice(3).map(p).join('')}<p style="margin:22px 0 0;color:#555">Equipo Providus</p></div>
</div>`;
  return { asunto, html, texto: `${lineasOk.join('\n\n')}\n\nEquipo Providus` };
}

export type ResultadoMail = { estado: 'enviado' } | { estado: 'omitido' } | { estado: 'fallido'; error: string };

/** Baja la foto del stand para adjuntarla en el mail. Si no se puede, el mail sale igual, sin foto. */
async function bajarFoto(url: string | null | undefined): Promise<{ contenido: Buffer; tipo: string; ext: string } | null> {
  if (!url) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return null;
    const tipo = r.headers.get('content-type') ?? 'image/jpeg';
    return { contenido: Buffer.from(await r.arrayBuffer()), tipo, ext: tipo.includes('png') ? 'png' : tipo.includes('webp') ? 'webp' : 'jpg' };
  } catch { return null; }
}

export async function enviarMailCliente(para: string, d: DatosMail): Promise<ResultadoMail> {
  const foto = await bajarFoto(d.fotoUrl);
  const m = armarMail(d, foto !== null);
  try {
    const pass = process.env.SMTP_PASS;
    if (pass) {
      const user = process.env.SMTP_USER || CORREO_ARETE;
      const puerto = Number(process.env.SMTP_PORT || 465);
      const t = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.hostinger.com', port: puerto, secure: puerto === 465, auth: { user, pass } });
      await t.sendMail({ from: REMITENTE, to: para, subject: m.asunto, html: m.html, text: m.texto, replyTo: CORREO_ARETE, attachments: foto ? [{ filename: `foto-providus.${foto.ext}`, content: foto.contenido, contentType: foto.tipo, cid: 'foto-providus' }] : [] });
      return { estado: 'enviado' };
    }
    const key = process.env.RESEND_API_KEY;
    if (!key) return { estado: 'omitido' };
    const r = await new Resend(key).emails.send({ from: REMITENTE, to: [para], subject: m.asunto, html: m.html, text: m.texto, replyTo: CORREO_ARETE, attachments: foto ? [{ filename: `foto-providus.${foto.ext}`, content: foto.contenido, contentId: 'foto-providus' }] : [] });
    return r.error ? { estado: 'fallido', error: r.error.message } : { estado: 'enviado' };
  } catch (e) {
    return { estado: 'fallido', error: e instanceof Error ? e.message : String(e) };
  }
}
