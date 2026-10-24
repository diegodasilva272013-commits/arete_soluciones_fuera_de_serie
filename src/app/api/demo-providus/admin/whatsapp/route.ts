/**
 * DEMO PROVIDUS — plantilla de WhatsApp al cliente (por Twilio). Solo administración.
 *  GET  la plantilla guardada, el estado de la conexión con Twilio (credenciales, tipo de cuenta, plantilla aprobada).
 *  PUT  guarda el texto y si se envía sola. Conserva la plantilla de Twilio ya creada.
 * Nunca devuelve credenciales.
 */
import { NextResponse } from 'next/server';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { falla } from '@/lib/demo-providus/datos';
import { FALTA_SQL_WA, guardarConfig, leerConfig } from '@/lib/demo-providus/whatsapp-config';
import { DESCRIPCION_VARIABLES, VARIABLES_WHATSAPP, autenticacion, configTwilio, validarPlantilla, type ConfigWhatsapp } from '@/lib/demo-providus/whatsapp';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function pedir(url: string, auth: string) {
  try {
    const r = await fetch(url, { headers: { Authorization: auth }, cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    return { status: r.status, cuerpo: await r.json().catch(() => null) };
  } catch (e) {
    return { status: 0, cuerpo: { message: e instanceof Error ? e.message : 'sin respuesta' } };
  }
}

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  try {
    const { config, guardable, error } = await leerConfig();
    const tw = configTwilio();
    let cuenta: { ok: true; nombre: string | null; tipo: string | null; estado: string | null } | { ok: false; detalle: string } | null = null;
    let aprobacion: { estado: string | null; detalle?: string } | null = null;
    if (tw) {
      const auth = autenticacion(tw);
      const [c, a] = await Promise.all([
        pedir(`https://api.twilio.com/2010-04-01/Accounts/${tw.accountSid}.json`, auth),
        config.content_sid ? pedir(`https://content.twilio.com/v1/Content/${encodeURIComponent(config.content_sid)}/ApprovalRequests`, auth) : Promise.resolve(null),
      ]);
      cuenta = c.status === 200 ? { ok: true, nombre: c.cuerpo?.friendly_name ?? null, tipo: c.cuerpo?.type ?? null, estado: c.cuerpo?.status ?? null } : { ok: false, detalle: `Twilio respondió ${c.status}: ${c.cuerpo?.message ?? 'sin detalle'}` };
      if (a) aprobacion = a.status === 200 ? { estado: a.cuerpo?.whatsapp?.status ?? null } : { estado: null, detalle: `Twilio respondió ${a.status}: ${a.cuerpo?.message ?? 'sin detalle'}` };
    }
    return NextResponse.json({
      ok: true,
      guardable,
      config,
      twilio: { configurado: !!tw, remitente: tw?.from ?? null, cuenta },
      plantilla_twilio: config.content_sid ? { content_sid: config.content_sid, aprobacion, desactualizada: config.texto_contenido !== null && config.texto_contenido.trim() !== config.texto.trim() } : null,
      variables: VARIABLES_WHATSAPP.map((v) => ({ nombre: v, descripcion: DESCRIPCION_VARIABLES[v] })),
      detalle: guardable ? error : FALTA_SQL_WA,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[demo-providus] whatsapp GET', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'No se pudo leer la configuración de WhatsApp.');
  }
}

export async function PUT(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  let b: { texto?: unknown; activa?: unknown };
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  const errorTexto = validarPlantilla(b.texto);
  if (errorTexto) return falla('texto', 422, errorTexto);
  try {
    const { config, guardable } = await leerConfig();
    if (!guardable) return falla('tabla', 503, FALTA_SQL_WA);
    const activa = b.activa === true;
    if (activa && !configTwilio()) return falla('twilio', 422, 'Para activar el envío automático hay que cargar las credenciales de Twilio en Vercel (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM).');
    const valor: ConfigWhatsapp = { ...config, texto: (b.texto as string).trim(), activa };
    const g = await guardarConfig(valor);
    if (!g.ok) return g.tabla ? falla('tabla', 503, FALTA_SQL_WA) : falla('base', 502, `No se pudo guardar: ${g.mensaje}`);
    return NextResponse.json({ ok: true, config: valor });
  } catch (e) {
    console.error('[demo-providus] whatsapp PUT', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'No se pudo guardar la plantilla.');
  }
}
