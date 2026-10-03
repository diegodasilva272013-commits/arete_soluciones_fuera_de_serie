import { Resend } from 'resend';
import { SEMANAS, TEMPORADA_NOMBRE, profesLabel } from '@/app/fuera-de-serie/temporada-1/_data';

/**
 * Mails de Areté Fuera de Serie · Temporada 1.
 * - Confirmación al registrarse (incluye el Zoom si FDS_T1_ZOOM_URL ya está cargado).
 * - Envío del link de Zoom (desde /admin/temporada-1).
 */

const FROM = process.env.FDS_EMAIL_FROM || 'Areté Fuera de Serie <ia@aretesoluciones.com>';

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

function layout(nombre: string, cuerpo: string): string {
  return `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111;background:#fff">
  <div style="background:#050505;padding:28px 32px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#5C9AFF">Areté Fuera de Serie</div>
    <div style="font-family:Arial,sans-serif;font-weight:800;font-size:26px;color:#F2EFE9;margin-top:8px">Temporada 1</div>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:17px">Hola ${esc(nombre)},</p>
    ${cuerpo}
    <p style="font-size:15px;color:#444;margin-top:8px">9 clases en vivo · 90 minutos · Gratis<br>Lun y Mié 20 h · Sáb 18 h (hora Argentina)</p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px">${programaHtml()}</table>
    <p style="font-size:15px;margin-top:28px">Agendá las que quieras. Nos vemos del otro lado.<br>— Equipo Areté</p>
  </div>
</div>`;
}

function zoomBlock(zoomUrl: string): string {
  return `
    <p style="margin:24px 0">
      <a href="${esc(zoomUrl)}" style="background:#2969D1;color:#fff;padding:14px 26px;text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Entrar a las clases por Zoom</a>
    </p>
    <p style="font-size:13px;color:#8A8A8A">Es el mismo link para las 9 clases. Guardá este mail.<br>${esc(zoomUrl)}</p>`;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export async function enviarConfirmacion(to: string, nombre: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const zoom = process.env.FDS_T1_ZOOM_URL;
  const cuerpo = zoom
    ? `<p style="font-size:16px">Ya estás adentro de <b>${TEMPORADA_NOMBRE}</b>. Este es tu link para las clases:</p>${zoomBlock(zoom)}`
    : `<p style="font-size:16px">Ya estás adentro de <b>${TEMPORADA_NOMBRE}</b>. En estos días te mandamos a este mail el link de Zoom para las clases.</p>`;
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: zoom ? 'Tu link de Zoom · Fuera de Serie T1' : 'Estás adentro · Fuera de Serie T1',
    html: layout(nombre, cuerpo),
  });
  if (error) console.error('[fds-t1] confirmación', to, error);
  return !error;
}

export async function enviarZoom(to: string, nombre: string, zoomUrl: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const cuerpo = `<p style="font-size:16px">Este es el link de Zoom para <b>${TEMPORADA_NOMBRE}</b>. Arrancamos el <b>lunes 5 de octubre a las 20 h</b>.</p>${zoomBlock(zoomUrl)}`;
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: 'Tu link de Zoom · Fuera de Serie T1',
    html: layout(nombre, cuerpo),
  });
  if (error) console.error('[fds-t1] zoom', to, error);
  return !error;
}
