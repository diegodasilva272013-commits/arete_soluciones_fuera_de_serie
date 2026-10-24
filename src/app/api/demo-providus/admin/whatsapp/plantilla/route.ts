/**
 * DEMO PROVIDUS — crea la plantilla de WhatsApp en Twilio y la manda a aprobar. Solo administración.
 * Toma el texto que se está editando, lo convierte al formato que pide WhatsApp ({{nombre}} → {{1}}…), lo crea en la
 * Content API de Twilio y pide la aprobación de WhatsApp (suele tardar hasta un día hábil). Guarda el SID de la
 * plantilla: desde ahí el envío automático la usa. Mientras no esté aprobada, WhatsApp rechaza los envíos.
 */
import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { falla } from '@/lib/demo-providus/datos';
import { FALTA_SQL_WA, guardarConfig, leerConfig } from '@/lib/demo-providus/whatsapp-config';
import { autenticacion, configTwilio, textoNumerado, validarPlantilla, variablesDelTexto, type ConfigWhatsapp } from '@/lib/demo-providus/whatsapp';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const EJEMPLO: Record<string, string> = { nombre: 'Carlos', apellido: 'Gómez', vendedor: 'Paola', promotora: 'Laura Pérez', evento: 'Expo Rosario' };

export async function POST(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  let b: { texto?: unknown; categoria?: unknown };
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  const errorTexto = validarPlantilla(b.texto);
  if (errorTexto) return falla('texto', 422, errorTexto);
  const tw = configTwilio();
  if (!tw) return falla('twilio', 422, 'Faltan las credenciales de Twilio en Vercel (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM).');

  const texto = (b.texto as string).trim();
  const orden = variablesDelTexto(texto);
  const numerado = textoNumerado(texto, orden);
  // WhatsApp no acepta plantillas que empiecen o terminen con una variable, ni dos variables pegadas.
  if (/^\s*\{\{/.test(numerado) || /\}\}\s*$/.test(numerado)) return falla('texto', 422, 'WhatsApp no deja que la plantilla empiece ni termine con una variable. Agregá una palabra antes de la primera y después de la última.');
  if (/\}\}\s*\{\{/.test(numerado)) return falla('texto', 422, 'WhatsApp no deja dos variables pegadas. Separalas con una palabra.');
  const categoria = b.categoria === 'MARKETING' ? 'MARKETING' : 'UTILITY';

  const { config, guardable } = await leerConfig();
  if (!guardable) return falla('tabla', 503, FALTA_SQL_WA);

  const auth = autenticacion(tw);
  const nombre = `providus_bienvenida_${Date.now().toString(36)}`;
  try {
    const crear = await fetch('https://content.twilio.com/v1/Content', {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendly_name: nombre, language: 'es', variables: Object.fromEntries(orden.map((v, i) => [String(i + 1), EJEMPLO[v] ?? 'ejemplo'])), types: { 'twilio/text': { body: numerado } } }),
      signal: AbortSignal.timeout(15_000),
    });
    const c = await crear.json().catch(() => null);
    if (!crear.ok || !c?.sid) return falla('twilio', 502, `Twilio no creó la plantilla (${crear.status}): ${c?.message ?? 'sin detalle'}`);

    const aprobar = await fetch(`https://content.twilio.com/v1/Content/${encodeURIComponent(c.sid)}/ApprovalRequests/WhatsApp`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre, category: categoria }),
      signal: AbortSignal.timeout(15_000),
    });
    const a = await aprobar.json().catch(() => null);
    const valor: ConfigWhatsapp = { ...config, texto, content_sid: c.sid, variables_orden: orden, texto_contenido: texto };
    const g = await guardarConfig(valor);
    if (!g.ok) return falla('base', 502, `La plantilla se creó en Twilio (${c.sid}) pero no se pudo guardar acá: ${g.mensaje}`);
    if (!aprobar.ok) return NextResponse.json({ ok: true, content_sid: c.sid, aprobacion: null, detalle: `La plantilla se creó pero Twilio no aceptó el pedido de aprobación (${aprobar.status}): ${a?.message ?? 'sin detalle'}` });
    return NextResponse.json({ ok: true, content_sid: c.sid, aprobacion: a?.whatsapp?.status ?? a?.status ?? 'received', categoria, nombre });
  } catch (e) {
    console.error('[demo-providus] crear plantilla de WhatsApp', e instanceof Error ? e.message : e);
    return falla('servidor', 503, e instanceof Error ? e.message : 'No se pudo hablar con Twilio.');
  }
}
