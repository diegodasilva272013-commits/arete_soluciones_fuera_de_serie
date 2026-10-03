import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { SEMANAS, TEMPORADA_NOMBRE, profesLabel } from '@/app/fuera-de-serie/temporada-1/_data';

/**
 * Mails de Areté Fuera de Serie · Temporada 1.
 * - Confirmación al registrarse (con el link de Zoom).
 * - Envío del link de Zoom a los inscriptos que todavía no lo tienen
 *   (cron diario y botón en /admin/temporada-1).
 *
 * Remitente: arete@aretesoluciones.space.
 *  1. Si SMTP_PASS está configurada, se envía por el SMTP de Hostinger con
 *     esa casilla (smtp.hostinger.com:465). Es el camino principal.
 *  2. Si no, por Resend; si Resend rechaza el remitente, reintenta con el de
 *     respaldo y deja arete@aretesoluciones.space como dirección de respuesta.
 */

const CORREO_ARETE = 'arete@aretesoluciones.space';
const FROM = process.env.FDS_EMAIL_FROM || `Areté Fuera de Serie <${CORREO_ARETE}>`;
const FROM_RESPALDO = 'Areté Fuera de Serie <ia@aretesoluciones.com>';

/** Zoom de la temporada (se puede pisar con la variable FDS_T1_ZOOM_URL). */
const ZOOM_T1 = {
  url: 'https://us06web.zoom.us/j/89430152746?pwd=nyBebUNzOHDXKAXUn4eHZwZupxnnu3.1',
  id: '894 3015 2746',
  codigo: '896785',
};

export function zoomUrl(): string {
  return process.env.FDS_T1_ZOOM_URL || ZOOM_T1.url;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function programaHtml(): string {
  return SEMANAS.map((s) => `
    <tr><td colspan="2" style="padding:18px 0 6px;font-family:monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#2F7BF6">Semana ${s.n} · ${esc(s.nombre)}</td></tr>
    ${s.episodios.map((e) => `
    <tr>
      <td style="padding:6px 12px 6px 0;white-space:nowrap;color:#8A8A8A;font-size:13px;vertical-align:top">${e.dia} ${e.fecha} · ${e.hora}</td>
      <td style="padding:6px 0;font-size:14px;color:#111"><b>${esc(e.titulo)}</b> <span style="color:#8A8A8A">· ${esc(profesLabel(e.profes))}</span></td>
    </tr>`).join('')}`).join('');
}

function zoomBlock(url: string): string {
  const esDefault = url === ZOOM_T1.url;
  return `
    <p style="margin:24px 0">
      <a href="${esc(url)}" style="background:#2969D1;color:#fff;padding:14px 26px;text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Entrar a las clases por Zoom</a>
    </p>
    <p style="font-size:14px;color:#444;line-height:1.6">
      ${esDefault ? `ID de reunión: <b>${ZOOM_T1.id}</b><br>Código de acceso: <b>${ZOOM_T1.codigo}</b><br>` : ''}
      Es el mismo link para las 9 clases. Guardá este mail.<br>
      <span style="color:#8A8A8A;font-size:12px">${esc(url)}</span>
    </p>`;
}

function html(nombre: string, intro: string, url: string): string {
  return `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111;background:#fff">
  <div style="background:#050505;padding:28px 32px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#5C9AFF">Areté Fuera de Serie</div>
    <div style="font-family:Arial,sans-serif;font-weight:800;font-size:26px;color:#F2EFE9;margin-top:8px">Temporada 1</div>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:17px">Hola ${esc(nombre)},</p>
    <p style="font-size:16px">${intro}</p>
    ${zoomBlock(url)}
    <p style="font-size:15px;color:#444;margin-top:8px">9 clases en vivo · 90 minutos · Gratis<br>Lun y Mié 20 h · Sáb 18 h (hora Argentina)</p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px">${programaHtml()}</table>
    <p style="font-size:15px;margin-top:28px">Agendá las que quieras. Nos vemos del otro lado.<br>— Equipo Areté</p>
  </div>
</div>`;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

/** SMTP de Hostinger con la casilla arete@aretesoluciones.space. */
function getSmtp() {
  const pass = process.env.SMTP_PASS;
  if (!pass) return null;
  const user = process.env.SMTP_USER || CORREO_ARETE;
  return {
    user,
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 2,
      maxMessages: 100,
    }),
  };
}

type Mail = { to: string; subject: string; html: string };

/** Envía por Resend un lote (máx. 100); si rechaza el remitente, reintenta con el de respaldo. */
async function enviarLoteResend(resend: Resend, mails: Mail[]): Promise<boolean> {
  const armar = (from: string) =>
    mails.map((m) => ({ from, to: [m.to], subject: m.subject, html: m.html, replyTo: CORREO_ARETE }));

  const primero = await resend.batch.send(armar(FROM));
  if (!primero.error) return true;
  console.error('[fds-t1] lote rechazado con', FROM, primero.error);

  const respaldo = await resend.batch.send(armar(FROM_RESPALDO));
  if (respaldo.error) console.error('[fds-t1] lote rechazado con respaldo', respaldo.error);
  return !respaldo.error;
}

/** Envía los mails y devuelve los destinatarios a los que salió bien. */
async function enviarMails(mails: Mail[]): Promise<string[]> {
  const smtp = getSmtp();
  if (smtp) {
    const ok: string[] = [];
    for (const m of mails) {
      try {
        await smtp.transport.sendMail({
          from: `Areté Fuera de Serie <${smtp.user}>`,
          to: m.to,
          subject: m.subject,
          html: m.html,
          replyTo: CORREO_ARETE,
        });
        ok.push(m.to);
      } catch (e) {
        console.error('[fds-t1] SMTP Hostinger falló para', m.to, e);
      }
    }
    smtp.transport.close();
    return ok;
  }

  const resend = getResend();
  if (!resend) return [];
  const ok: string[] = [];
  for (let i = 0; i < mails.length; i += 100) {
    const lote = mails.slice(i, i + 100);
    if (await enviarLoteResend(resend, lote)) ok.push(...lote.map((m) => m.to));
  }
  return ok;
}

const ASUNTO = 'Tu link de Zoom · Fuera de Serie T1';

/** Mail de confirmación al registrarse (ya incluye el Zoom). */
export async function enviarConfirmacion(to: string, nombre: string): Promise<boolean> {
  const intro = `Ya estás adentro de <b>${TEMPORADA_NOMBRE}</b>. Arrancamos el <b>lunes 5 de octubre a las 20 h</b> (Argentina). Este es tu link para las clases:`;
  const ok = await enviarMails([{ to, subject: ASUNTO, html: html(nombre, intro, zoomUrl()) }]);
  return ok.length === 1;
}

/** Manda el Zoom a una lista de inscriptos. Devuelve los emails a los que se envió bien. */
export async function enviarZoomMasivo(
  destinatarios: { email: string; nombre: string }[],
  url: string = zoomUrl()
): Promise<string[]> {
  const intro = `Este es el link de Zoom para <b>${TEMPORADA_NOMBRE}</b>. Arrancamos el <b>lunes 5 de octubre a las 20 h</b> (Argentina).`;
  return enviarMails(destinatarios.map((d) => ({ to: d.email, subject: ASUNTO, html: html(d.nombre, intro, url) })));
}

/** Hay algún medio de envío configurado (SMTP de Hostinger o Resend). */
export function hayEnvioConfigurado(): boolean {
  return Boolean(process.env.SMTP_PASS || process.env.RESEND_API_KEY);
}

/** Qué medio de envío está activo (para mostrarlo en el panel). */
export function estadoEnvio(): { via: 'hostinger' | 'resend' | 'ninguno'; detalle: string } {
  if (process.env.SMTP_PASS) {
    return { via: 'hostinger', detalle: `Hostinger SMTP con ${process.env.SMTP_USER || CORREO_ARETE}` };
  }
  if (process.env.RESEND_API_KEY) {
    return { via: 'resend', detalle: 'Resend (falta SMTP_PASS de Hostinger)' };
  }
  return { via: 'ninguno', detalle: 'Sin medio de envío: falta SMTP_PASS' };
}

/** Envía un mail de prueba y devuelve el error exacto si falla. */
export async function enviarPrueba(to: string): Promise<{ ok: boolean; via: string; error?: string }> {
  const intro = `Esto es una <b>prueba</b> del envío de ${TEMPORADA_NOMBRE}. Así le llega el mail a cada inscripto:`;
  const mail = { to, subject: `[Prueba] ${ASUNTO}`, html: html('equipo Areté', intro, zoomUrl()) };
  const smtp = getSmtp();
  if (smtp) {
    try {
      await smtp.transport.sendMail({
        from: `Areté Fuera de Serie <${smtp.user}>`,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        replyTo: CORREO_ARETE,
      });
      return { ok: true, via: 'hostinger' };
    } catch (e) {
      return { ok: false, via: 'hostinger', error: e instanceof Error ? e.message : String(e) };
    } finally {
      smtp.transport.close();
    }
  }
  const resend = getResend();
  if (!resend) return { ok: false, via: 'ninguno', error: 'Falta SMTP_PASS (Hostinger) en Vercel' };
  const r = await resend.emails.send({ from: FROM, to: [to], subject: mail.subject, html: mail.html, replyTo: CORREO_ARETE });
  return r.error ? { ok: false, via: 'resend', error: r.error.message } : { ok: true, via: 'resend' };
}
