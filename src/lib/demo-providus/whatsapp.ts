/**
 * DEMO PROVIDUS — plantilla de WhatsApp para el cliente que dejó sus datos en el stand.
 *
 * La plantilla es un texto con variables ({{nombre}}, {{vendedor}}…) que se edita desde el panel de
 * administración. Se envía por la integración Evolution API del proyecto (un WhatsApp conectado por QR),
 * solo a clientes que autorizaron el contacto y solo si la plantilla está activada y tiene un número elegido.
 * No es una plantilla "oficial" de Meta: eso necesita la API oficial de WhatsApp Business con su aprobación.
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
  /** Instancia de Evolution (el WhatsApp) desde la que se envía. */
  instancia_id: string | null;
}

export const CONFIG_POR_DEFECTO: ConfigWhatsapp = { texto: PLANTILLA_POR_DEFECTO, activa: false, instancia_id: null };

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

export interface InstanciaEvolution {
  id: string;
  name: string;
  instance_key: string;
  api_url: string;
  api_token: string;
  status: string;
  phone_number: string | null;
}

/** "+5493415551234" → "5493415551234" (Evolution recibe solo dígitos). */
export const numeroParaWhatsapp = (e164: string): string => e164.replace(/\D/g, '');

export type ResultadoWhatsapp = { estado: 'enviado' } | { estado: 'fallido'; error: string } | { estado: 'omitido'; error: string };

/** Envía el texto. Nunca lanza: devuelve el estado para guardarlo en el lead. */
export async function enviarTexto(instancia: InstanciaEvolution, e164: string, texto: string, opciones: { fetchFn?: typeof fetch; timeoutMs?: number } = {}): Promise<ResultadoWhatsapp> {
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), opciones.timeoutMs ?? 8000);
  try {
    const r = await (opciones.fetchFn ?? fetch)(`${instancia.api_url.replace(/\/+$/, '')}/message/sendText/${encodeURIComponent(instancia.instance_key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: instancia.api_token },
      body: JSON.stringify({ number: numeroParaWhatsapp(e164), text: texto }),
      signal: control.signal,
    });
    if (!r.ok) {
      const cuerpo = (await r.text().catch(() => '')).slice(0, 240);
      return { estado: 'fallido', error: `Evolution respondió ${r.status}${cuerpo ? `: ${cuerpo}` : ''}` };
    }
    return { estado: 'enviado' };
  } catch (e) {
    const abortada = e instanceof Error && e.name === 'AbortError';
    return { estado: 'fallido', error: abortada ? 'El WhatsApp no respondió a tiempo.' : e instanceof Error ? e.message.slice(0, 240) : 'No se pudo enviar el WhatsApp.' };
  } finally {
    clearTimeout(corte);
  }
}

/** Una instancia que se pueda usar: la elegida, o si no hay elegida, la primera conectada. */
export function elegirInstancia(instancias: InstanciaEvolution[], idElegido: string | null): InstanciaEvolution | null {
  if (idElegido) return instancias.find((i) => i.id === idElegido) ?? null;
  return instancias.find((i) => /^(open|connected|conectad)/i.test(i.status ?? '')) ?? null;
}
