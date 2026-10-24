/**
 * DEMO PROVIDUS — envía UN WhatsApp de prueba al número que se indique, por Twilio. Solo administración.
 * Con la plantilla aprobada (modo "plantilla") o con el texto directo (modo "texto": sirve en el sandbox de Twilio o
 * si el cliente escribió en las últimas 24 h). Datos de ejemplo para las variables.
 */
import { NextResponse } from 'next/server';
import { esAdmin, permitirIntento, sesionActual } from '@/lib/demo-providus/sesion';
import { falla, ipDe } from '@/lib/demo-providus/datos';
import { normalizarTelefono } from '@/lib/demo-providus/telefono';
import { leerConfig } from '@/lib/demo-providus/whatsapp-config';
import { configTwilio, enviarWhatsApp, renderPlantilla, validarPlantilla, variablesDeContenido, type ContenidoWhatsapp } from '@/lib/demo-providus/whatsapp';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const txt = (v: unknown, max = 80): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  if (!permitirIntento(ipDe(req), 6)) return falla('limite', 429, 'Demasiados envíos de prueba seguidos. Esperá un minuto.');
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }

  const numero = normalizarTelefono(txt(b.numero, 40));
  if (!numero) return falla('numero', 422, 'El número no es válido. Escribilo con código de área, por ejemplo 345 4100816.');
  const twilio = configTwilio();
  if (!twilio) return falla('twilio', 422, 'Faltan las credenciales de Twilio en Vercel (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM).');

  try {
    const { config } = await leerConfig();
    const datos = { nombre: txt(b.nombre) || 'Carlos', apellido: 'Gómez', vendedor: txt(b.vendedor) || 'Paola', promotora: 'Laura Pérez', evento: 'Prueba de la plantilla' };
    let contenido: ContenidoWhatsapp;
    let mostrado: string;
    if (b.modo === 'plantilla') {
      if (!config.content_sid || !config.variables_orden.length) return falla('plantilla', 422, 'Todavía no hay una plantilla creada en Twilio. Creala con el botón "Crear plantilla y pedir aprobación".');
      contenido = { contentSid: config.content_sid, variables: variablesDeContenido(config.variables_orden, datos) };
      mostrado = renderPlantilla(config.texto_contenido ?? config.texto, datos);
    } else {
      const texto = typeof b.texto === 'string' && b.texto.trim() ? b.texto : config.texto;
      const e = validarPlantilla(texto);
      if (e) return falla('texto', 422, e);
      mostrado = renderPlantilla(texto, datos);
      contenido = { texto: mostrado };
    }
    const r = await enviarWhatsApp(twilio, numero, contenido);
    if (r.estado === 'fallido') console.error('[demo-providus] WhatsApp de prueba fallido:', r.error);
    return NextResponse.json({ ok: r.estado === 'enviado', estado: r.estado, detalle: r.estado === 'enviado' ? null : r.error, enviado_a: numero, desde: twilio.from, texto: mostrado, sid: r.estado === 'enviado' ? r.sid : null });
  } catch (e) {
    console.error('[demo-providus] whatsapp probar', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'No se pudo enviar el mensaje de prueba.');
  }
}
