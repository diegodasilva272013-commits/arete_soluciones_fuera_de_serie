/**
 * DEMO PROVIDUS — llamada del agente de IA al CLIENTE que dejó sus datos en el stand.
 *
 * Usa la llamada saliente de ElevenLabs sobre un número de Twilio importado en ElevenLabs
 * (integración nativa: no hay código propio de Twilio):
 *   POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
 *   body: { agent_id, agent_phone_number_id, to_number, conversation_initiation_client_data: { dynamic_variables } }
 * `to_number` es el celular del cliente. El agente habla con su propio guion (el que tiene configurado en
 * ElevenLabs) y completa el saludo con las variables: prospecto_nombre (el cliente), vendedor_nombre (el
 * vendedor que lo va a atender) y telefono_e164 (el número del cliente).
 *
 * Variables de entorno del servidor (las tres son necesarias; si falta alguna la llamada se
 * omite sin romper nada: el lead igual queda asignado y visible para el vendedor):
 *   ELEVENLABS_API_KEY (o eleben_labs_api) · ELEVENLABS_PROVIDUS_AGENT_ID · ELEVENLABS_PHONE_NUMBER_ID
 */

export interface DatosLlamada {
  cliente: { nombre: string; apellido: string; telefono_e164: string; provincia: string; localidad: string | null };
  /** El vendedor asignado: es quien lo va a contactar, y el agente lo nombra en el saludo. */
  vendedor: { nombre: string };
  promotora: string | null;
  evento: string | null;
}

export type ResultadoLlamada =
  | { estado: 'llamando'; ref: string | null }
  | { estado: 'fallida'; error: string }
  | { estado: 'omitida'; error: string };

export interface ConfigIA {
  apiKey: string;
  agentId: string;
  phoneNumberId: string;
}

export function configIA(env: Record<string, string | undefined> = process.env): ConfigIA | null {
  // Nombre estándar o los que se cargaron a mano en Vercel (nunca la clave de otro proyecto, como noa_eleven_labs_api).
  const apiKey = (env.ELEVENLABS_API_KEY || env.eleben_labs_api || env.eleven_labs_api)?.trim();
  const agentId = env.ELEVENLABS_PROVIDUS_AGENT_ID?.trim();
  const phoneNumberId = env.ELEVENLABS_PHONE_NUMBER_ID?.trim();
  return apiKey && agentId && phoneNumberId ? { apiKey, agentId, phoneNumberId } : null;
}

/** "+5493455001234" → "3 4 5 5 0 0 1 2 3 4": los dígitos sueltos para que la voz los dicte de a uno. */
export function telefonoDictado(e164: string): string {
  const digitos = e164.replace(/\D/g, '');
  const nacional = digitos.startsWith('549') ? digitos.slice(3) : digitos.startsWith('54') ? digitos.slice(2) : digitos;
  return nacional.split('').join(' ');
}

export function variablesDelAgente(d: DatosLlamada): Record<string, string> {
  return {
    // Las que usa el guion del agente en ElevenLabs. Si el agente pide una variable y no se la mandamos,
    // ElevenLabs rechaza la llamada.
    prospecto_nombre: d.cliente.nombre,
    vendedor_nombre: d.vendedor.nombre,
    telefono_e164: d.cliente.telefono_e164,
    // Datos extra por si el guion los quiere usar más adelante.
    cliente_apellido: d.cliente.apellido,
    cliente_nombre_completo: `${d.cliente.nombre} ${d.cliente.apellido}`.trim(),
    cliente_telefono_dictado: telefonoDictado(d.cliente.telefono_e164),
    cliente_provincia: d.cliente.provincia,
    cliente_localidad: d.cliente.localidad ?? '',
    promotora_nombre: d.promotora ?? '',
    evento: d.evento ?? '',
  };
}

export function armarPedido(cfg: ConfigIA, d: DatosLlamada) {
  return {
    url: 'https://api.elevenlabs.io/v1/convai/twilio/outbound-call',
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': cfg.apiKey },
      body: JSON.stringify({
        agent_id: cfg.agentId,
        agent_phone_number_id: cfg.phoneNumberId,
        to_number: d.cliente.telefono_e164,
        conversation_initiation_client_data: { dynamic_variables: variablesDelAgente(d) },
        telephony_call_config: { ringing_timeout_secs: 30 },
      }),
    },
  };
}

/** Pide la llamada. Nunca lanza: devuelve el estado para guardarlo en el registro. */
export async function iniciarLlamada(d: DatosLlamada, opciones: { cfg?: ConfigIA | null; fetchFn?: typeof fetch; timeoutMs?: number } = {}): Promise<ResultadoLlamada> {
  const cfg = opciones.cfg === undefined ? configIA() : opciones.cfg;
  if (!cfg) return { estado: 'omitida', error: 'La llamada de IA no está configurada en el servidor.' };
  const { url, init } = armarPedido(cfg, d);
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), opciones.timeoutMs ?? 5000);
  try {
    const r = await (opciones.fetchFn ?? fetch)(url, { ...init, signal: control.signal });
    const cuerpo = (await r.json().catch(() => null)) as { success?: boolean; message?: string; conversation_id?: string | null; callSid?: string | null; detail?: unknown } | null;
    if (!r.ok || cuerpo?.success === false) {
      const det = cuerpo?.detail as { message?: string } | string | undefined;
      const detalle = cuerpo?.message || (typeof det === 'string' ? det : det?.message) || `ElevenLabs respondió ${r.status}.`;
      return { estado: 'fallida', error: String(detalle).slice(0, 300) };
    }
    return { estado: 'llamando', ref: cuerpo?.conversation_id ?? cuerpo?.callSid ?? null };
  } catch (e) {
    const abortada = e instanceof Error && e.name === 'AbortError';
    return { estado: 'fallida', error: abortada ? 'ElevenLabs no respondió a tiempo.' : e instanceof Error ? e.message.slice(0, 300) : 'No se pudo pedir la llamada.' };
  } finally {
    clearTimeout(corte);
  }
}
