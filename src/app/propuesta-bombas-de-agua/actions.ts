'use server';

import { cookies } from 'next/headers';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { evolutionSendText, type EvolutionInstance } from '@/lib/evolution';

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

const DESTINO_MAIL = 'diegodasilva272013@gmail.com';
const ASUNTO = '✅ Propuesta Bombas y motores de agua — aceptada';
const CORREO_ARETE = 'arete@aretesoluciones.space';
// WhatsApp de Diego (+54 345 410-0816). En Argentina los celulares van con 9
// después del 54; se prueba primero así y, si el envío falla, tal cual se cargó.
const WHATSAPP_DESTINO = ['5493454100816', '543454100816'];

function mailHtml(fecha: string): string {
  return `
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
}

function whatsappTexto(fecha: string): string {
  return [
    '✅ *Propuesta aceptada* — Bombas y motores de agua',
    '',
    'Total: USD 620',
    'Pago: 50% al confirmar (USD 310) · 50% al terminar (USD 310)',
    `Aceptada el ${fecha}`,
  ].join('\n');
}

// Devuelve true SOLO si el mail realmente salió. Primero por el SMTP de
// Hostinger (SMTP_PASS, el mismo que usa el resto del sitio) y, si no está
// configurado o falla, por Resend.
async function enviarMail(fecha: string): Promise<boolean> {
  const html = mailHtml(fecha);

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
      await transport.sendMail({ from: `Areté Propuestas <${user}>`, to: DESTINO_MAIL, subject: ASUNTO, html });
      transport.close();
      return true;
    } catch (e) {
      console.error('[propuesta-bombas] SMTP falló', e);
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const { error } = await new Resend(key).emails.send({
        from: 'Areté Propuestas <ia@aretesoluciones.com>',
        to: [DESTINO_MAIL],
        subject: ASUNTO,
        html,
      });
      if (!error) return true;
      console.error('[propuesta-bombas] Resend rechazó el mail', error);
    } catch (e) {
      console.error('[propuesta-bombas] Resend falló', e);
    }
  }

  console.error('[propuesta-bombas] mail sin enviar: no hay SMTP_PASS ni RESEND_API_KEY que funcione');
  return false;
}

// WhatsApp por la Evolution API que ya usa la plataforma (instancias en la
// tabla evolution_instances). Prueba primero las instancias conectadas;
// EVOLUTION_NOTIFY_INSTANCE_ID permite fijar una en particular.
async function enviarWhatsApp(fecha: string): Promise<boolean> {
  try {
    const admin = createSupabaseAdminClient() as any;
    const fija = process.env.EVOLUTION_NOTIFY_INSTANCE_ID;
    let q = admin.from('evolution_instances').select('*');
    if (fija) q = q.eq('id', fija);
    const { data, error } = await q;
    if (error) throw error;

    const instancias = ((data ?? []) as EvolutionInstance[])
      .sort((a, b) => Number(b.status === 'connected') - Number(a.status === 'connected'))
      .slice(0, 3);
    if (instancias.length === 0) {
      console.error('[propuesta-bombas] WhatsApp sin enviar: no hay instancias de Evolution cargadas');
      return false;
    }

    const texto = whatsappTexto(fecha);
    for (const instancia of instancias) {
      for (const numero of WHATSAPP_DESTINO) {
        try {
          await evolutionSendText(instancia, numero, texto);
          return true;
        } catch (e) {
          console.error(`[propuesta-bombas] WhatsApp falló (instancia ${instancia.name}, estado ${instancia.status}, número ${numero})`, e);
        }
      }
    }
  } catch (e) {
    console.error('[propuesta-bombas] WhatsApp falló', e);
  }
  return false;
}

// ok:true si salió por AL MENOS un canal (mail o WhatsApp). Si no sale por
// ninguno devuelve ok:false y la página muestra el error en lugar de decir
// "fuimos notificados" cuando no es cierto.
export async function notifyAcceptance(): Promise<{ ok: boolean }> {
  const fecha = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const [mail, whatsapp] = await Promise.all([enviarMail(fecha), enviarWhatsApp(fecha)]);
  console.log(`[propuesta-bombas] aceptación — mail: ${mail ? 'ok' : 'falló'}, whatsapp: ${whatsapp ? 'ok' : 'falló'}`);
  return { ok: mail || whatsapp };
}
