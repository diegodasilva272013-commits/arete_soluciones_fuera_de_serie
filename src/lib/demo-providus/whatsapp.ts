/**
 * DEMO PROVIDUS — WhatsApp al cliente que dejó sus datos en el stand, enviado por Twilio.
 *
 * La plantilla es un texto con variables ({{nombre}}, {{vendedor}}…) que se edita desde el panel. Para escribirle
 * por primera vez a alguien que nunca nos escribió, WhatsApp exige una plantilla APROBADA: el panel la crea en
 * Twilio (Content API) y la manda a aprobar; mientras tanto, o dentro de la ventana de 24 h, se envía el texto
 * directo. Solo se escribe a clientes que autorizaron el contacto y solo si el envío automático está activado.
 *
 * Variables de entorno del servidor:
 *   TWILIO_ACCOUNT_SID · TWILIO_AUTH_TOKEN · TWILIO_WHATSAPP_FROM (el número de WhatsApp, "+14155238886", o el SID "MG…"
 *   de un Messaging Service). En lugar del token se puede usar una API Key: TWILIO_API_KEY + TWILIO_API_SECRET.
 */

export const VARIABLES_WHATSAPP = ['nombre', 'apellido', 'vendedor', 'promotora', 'evento'] as const;
export type VariableWhatsapp = (typeof VARIABLES_WHATSAPP)[number];

export const DESCRIPCION_VARIABLES: Record<VariableWhatsapp, string> = {
  nombre: 'Nombre del cliente',
  apellido: 'Apellido del cliente',
  vendedor: 'Vendedor que lo va a atender',
  promotora: 'Promotora que lo cargó',
  evento: 'Evento donde dejó sus datos',
};

export const PLANTILLA_POR_DEFECTO =
  'Hola {{nombre}}, ¡gracias por pasar por el stand de Providus! Soy {{vendedor}} y en breve te voy a contactar para contarte cómo podemos ayudarte. Si preferís que hablemos por acá, respondeme este mensaje.';

export interface ConfigWhatsapp {
  texto: string;
  /** Si está en true, se envía solo cuando entra un lead. */
  activa: boolean;
  /** Plantilla creada en Twilio (HX…). Si hay, se envía con ella; si no, se manda el texto directo. */
  content_sid: string | null;
  /** Qué variable va en cada hueco de la plantilla de Twilio ({{1}}, {{2}}…), en orden. */
  variables_orden: VariableWhatsapp[];
  /** El texto con el que se creó la plantilla de Twilio (para avisar si después se editó). */
  texto_contenido: string | null;
}

export const CONFIG_POR_DEFECTO: ConfigWhatsapp = { texto: PLANTILLA_POR_DEFECTO, activa: false, content_sid: null, variables_orden: [], texto_contenido: null };

export type DatosPlantilla = Partial<Record<VariableWhatsapp, string | null | undefined>>;

/** Reemplaza cada {{variable}} por su valor. Lo que no se conoce queda vacío y se limpian los espacios sobrantes. */
export function renderPlantilla(texto: string, datos: DatosPlantilla): string {
  return texto
    .replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, k: string) => (datos[k.toLowerCase() as VariableWhatsapp] ?? '').toString().trim())
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/** Devuelve el error para mostrar, o null si la plantilla es válida. */
export function validarPlantilla(texto: unknown): string | null {
  if (typeof texto !== 'string') return 'Escribí el texto de la plantilla.';
  const t = texto.trim();
  if (t.length < 10) return 'La plantilla es muy corta (mínimo 10 caracteres).';
  if (t.length > 1000) return 'La plantilla es muy larga (máximo 1000 caracteres).';
  const desconocidas = Array.from(new Set(Array.from(t.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)).map((m) => m[1].toLowerCase()))).filter((v) => !(VARIABLES_WHATSAPP as readonly string[]).includes(v));
  if (desconocidas.length) return `Hay variables que no existen: ${desconocidas.map((v) => `{{${v}}}`).join(', ')}. Las válidas son ${VARIABLES_WHATSAPP.map((v) => `{{${v}}}`).join(', ')}.`;
  return null;
}

/** Las variables que usa el texto, sin repetir y en orden de aparición. */
export function variablesDelTexto(texto: string): VariableWhatsapp[] {
  const vistas: VariableWhatsapp[] = [];
  for (const m of texto.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gi)) {
    const v = m[1].toLowerCase() as VariableWhatsapp;
    if ((VARIABLES_WHATSAPP as readonly string[]).includes(v) && !vistas.includes(v)) vistas.push(v);
  }
  return vistas;
}

/** "Hola {{nombre}}, soy {{vendedor}}" con orden [nombre, vendedor] → "Hola {{1}}, soy {{2}}" (el formato que pide WhatsApp). */
export function textoNumerado(texto: string, orden: VariableWhatsapp[]): string {
  return texto.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (m, k: string) => {
    const i = orden.indexOf(k.toLowerCase() as VariableWhatsapp);
    return i >= 0 ? `{{${i + 1}}}` : m;
  });
}

/** {"1": "Marcos", "2": "Paola"} según el orden de variables de la plantilla de Twilio. */
export function variablesDeContenido(orden: VariableWhatsapp[], datos: DatosPlantilla): Record<string, string> {
  return Object.fromEntries(orden.map((v, i) => [String(i + 1), (datos[v] ?? '').toString().trim() || '-']));
}

// ── Twilio ──────────────────────────────────────────────────────────────

export interface ConfigTwilio {
  accountSid: string;
  /** Usuario y clave para la autenticación básica (SID + token, o API key + secret). */
  usuario: string;
  clave: string;
  from: string;
}

export function configTwilio(env: Record<string, string | undefined> = process.env): ConfigTwilio | null {
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const from = env.TWILIO_WHATSAPP_FROM?.trim();
  const token = env.TWILIO_AUTH_TOKEN?.trim();
  const apiKey = env.TWILIO_API_KEY?.trim();
  const apiSecret = env.TWILIO_API_SECRET?.trim();
  if (!accountSid || !from) return null;
  if (apiKey && apiSecret) return { accountSid, usuario: apiKey, clave: apiSecret, from };
  if (token) return { accountSid, usuario: accountSid, clave: token, from };
  return null;
}

export const autenticacion = (c: ConfigTwilio): string => `Basic ${Buffer.from(`${c.usuario}:${c.clave}`).toString('base64')}`;

/** "+5493415551234" → "whatsapp:+5493415551234" */
export const aWhatsapp = (e164: string): string => `whatsapp:+${e164.replace(/\D/g, '')}`;

/** El remitente: un Messaging Service ("MG…") o un número ("+14155238886" → "whatsapp:+14155238886"). */
export function remitente(from: string): { MessagingServiceSid: string } | { From: string } {
  const f = from.trim();
  if (/^MG[0-9a-f]{32}$/i.test(f)) return { MessagingServiceSid: f };
  return { From: f.startsWith('whatsapp:') ? f : `whatsapp:+${f.replace(/\D/g, '')}` };
}

export type ContenidoWhatsapp = { texto: string } | { contentSid: string; variables: Record<string, string> };

export type ResultadoWhatsapp = { estado: 'enviado'; sid: string | null } | { estado: 'fallido'; error: string } | { estado: 'omitido'; error: string };

export function armarEnvio(cfg: ConfigTwilio, e164: string, contenido: ContenidoWhatsapp) {
  const cuerpo = new URLSearchParams({ To: aWhatsapp(e164) });
  for (const [k, v] of Object.entries(remitente(cfg.from))) cuerpo.set(k, v);
  if ('contentSid' in contenido) {
    cuerpo.set('ContentSid', contenido.contentSid);
    cuerpo.set('ContentVariables', JSON.stringify(contenido.variables));
  } else {
    cuerpo.set('Body', contenido.texto);
  }
  return {
    url: `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`,
    init: { method: 'POST', headers: { Authorization: autenticacion(cfg), 'Content-Type': 'application/x-www-form-urlencoded' }, body: cuerpo.toString() },
  };
}

/** Envía el WhatsApp. Nunca lanza: devuelve el estado para guardarlo en el lead. */
export async function enviarWhatsApp(cfg: ConfigTwilio | null, e164: string, contenido: ContenidoWhatsapp, opciones: { fetchFn?: typeof fetch; timeoutMs?: number } = {}): Promise<ResultadoWhatsapp> {
  if (!cfg) return { estado: 'omitido', error: 'Twilio no está configurado en el servidor.' };
  const { url, init } = armarEnvio(cfg, e164, contenido);
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), opciones.timeoutMs ?? 8000);
  try {
    const r = await (opciones.fetchFn ?? fetch)(url, { ...init, signal: control.signal });
    const cuerpo = (await r.json().catch(() => null)) as { sid?: string; status?: string; code?: number; message?: string; error_code?: number | null; error_message?: string | null } | null;
    if (!r.ok || cuerpo?.error_code || cuerpo?.status === 'failed' || cuerpo?.status === 'undelivered') {
      const detalle = cuerpo?.message || cuerpo?.error_message || `Twilio respondió ${r.status}.`;
      const codigo = cuerpo?.code ?? cuerpo?.error_code;
      return { estado: 'fallido', error: `${codigo ? `(${codigo}) ` : ''}${detalle}`.slice(0, 300) };
    }
    return { estado: 'enviado', sid: cuerpo?.sid ?? null };
  } catch (e) {
    const abortada = e instanceof Error && e.name === 'AbortError';
    return { estado: 'fallido', error: abortada ? 'Twilio no respondió a tiempo.' : e instanceof Error ? e.message.slice(0, 240) : 'No se pudo enviar el WhatsApp.' };
  } finally {
    clearTimeout(corte);
  }
}
