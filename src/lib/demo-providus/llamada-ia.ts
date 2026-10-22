/**
 * DEMO PROVIDUS — llamada del agente de IA al celular del vendedor.
 *
 * Usa la llamada saliente de ElevenLabs sobre un número de Twilio importado en ElevenLabs
 * (integración nativa: no hay código propio de Twilio):
 *   POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
 *   body: { agent_id, agent_phone_number_id, to_number, conversation_initiation_client_data: { dynamic_variables } }
 * El agente le dice al vendedor quién es el lead y le pide que lo llame ya. Los datos del lead
 * viajan como variables dinámicas (se usan en el prompt y en el primer mensaje con {{variable}}).
 *
 * Variables de entorno del servidor (las tres son necesarias; si falta alguna la llamada se
 * omite sin romper nada: el lead igual queda asignado y visible para el vendedor):
 *   ELEVENLABS_API_KEY · ELEVENLABS_PROVIDUS_AGENT_ID · ELEVENLABS_PHONE_NUMBER_ID
 */

export interface DatosLlamada {
  vendedor: { nombre: string; telefono_e164: string };
  cliente: { nombre: string; apellido: string; telefono_e164: string; provincia: string; localidad: string | null };
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
    // Nombres que usa el agente creado en ElevenLabs (prospecto = el lead que cargó la promotora). Si el agente
    // pide una variable y no se la mandamos, ElevenLabs rechaza la llamada: por eso van las dos familias de nombres.
    prospecto_nombre: d.cliente.nombre,
    telefono_e164: d.cliente.telefono_e164,
    // Nombres propios de esta integración.
    vendedor_nombre: d.vendedor.nombre,
    cliente_nombre: d.cliente.nombre,
    cliente_apellido: d.cliente.apellido,
    cliente_nombre_completo: `${d.cliente.nombre} ${d.cliente.apellido}`.trim(),
    cliente_telefono: d.cliente.telefono_e164,
    cliente_telefono_dictado: telefonoDictado(d.cliente.telefono_e164),
    cliente_provincia: d.cliente.provincia,
    cliente_localidad: d.cliente.localidad ?? '',
    promotora_nombre: d.promotora ?? '',
    evento: d.evento ?? '',
  };
}

/** "+5493415551234" → "3 4 1, 5 5 5, 1 2 3 4": dígito por dígito y con pausas, para que se entienda al dictarlo. */
export function telefonoConPausas(e164: string): string {
  const d = e164.replace(/\D/g, '');
  const nac = d.startsWith('549') ? d.slice(3) : d.startsWith('54') ? d.slice(2) : d;
  const trozos: string[] = [];
  for (let i = 0; i < nac.length; i += 3) trozos.push(nac.slice(i, i + 3));
  if (trozos.length > 1 && trozos[trozos.length - 1].length === 1) trozos.splice(-2, 2, trozos[trozos.length - 2] + trozos[trozos.length - 1]);
  return trozos.map((t) => t.split('').join(' ')).join(', ');
}

/**
 * Lo que dice el agente en cada aviso. Se manda en cada llamada (override del primer mensaje y del prompt) con los datos
 * ya escritos, así el aviso es siempre este y no el guion de atención entrante del agente. Requiere que el agente tenga
 * activados los overrides (botón "Activar" de la pestaña Probar agente).
 */
export function guionDelAviso(d: DatosLlamada): { primerMensaje: string; prompt: string } {
  const lugar = [d.cliente.localidad, d.cliente.provincia].filter(Boolean).join(', ');
  const cliente = `${d.cliente.nombre} ${d.cliente.apellido}`.trim();
  const tel = telefonoConPausas(d.cliente.telefono_e164);
  const origen = [d.promotora ? `Lo cargó ${d.promotora}` : '', d.evento ? `en ${d.evento}` : ''].filter(Boolean).join(' ');
  const primerMensaje = `Hola ${d.vendedor.nombre}, te habla Sofía, de Providus. Te aviso que acaba de entrar un dato nuevo de tu zona: ${cliente}, de ${lugar}. Su teléfono es ${tel}.${origen ? ` ${origen}.` : ''} Ya lo tenés en tu pantalla: llamalo ahora. ¿Me confirmás que lo recibiste?`;
  const prompt = [
    'Sos Sofía, la asistente de voz de Providus. Estás llamando por teléfono a un VENDEDOR de la empresa para avisarle que entró un dato nuevo de su zona. No hablás con un cliente: hablás con un compañero de trabajo.',
    `Vendedor: ${d.vendedor.nombre}.`,
    `Dato nuevo: ${cliente}. Teléfono: ${tel}. Lugar: ${lugar}.${d.promotora ? ` Lo cargó ${d.promotora}.` : ''}${d.evento ? ` Evento: ${d.evento}.` : ''}`,
    'Tu objetivo es que el vendedor anote el teléfono y llame al dato enseguida.',
    'Hablá en español rioplatense, cordial, directa y con frases cortas. Si te pide repetir el teléfono, repetilo despacio, dígito por dígito. Si te pregunta algo que no sabés, decile que lo mire en su pantalla de vendedor. No inventes datos ni ofrezcas productos.',
    'Cuando el vendedor confirme que lo recibió, despedite brevemente y terminá la llamada.',
  ].join('\n');
  return { primerMensaje, prompt };
}

/** ¿El agente permite que cada llamada traiga su propio primer mensaje, prompt e idioma? */
export function overridesActivos(agente: unknown): { primer_mensaje: boolean; prompt: boolean; idioma: boolean } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (agente as any)?.platform_settings?.overrides?.conversation_config_override?.agent;
  return { primer_mensaje: a?.first_message === true, prompt: a?.prompt?.prompt === true, idioma: a?.language === true };
}

/** Los overrides actuales del agente más los tres que necesitamos activados (se conserva todo lo demás). */
export function overridesParaActivar(agente: unknown): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = (agente as any)?.platform_settings?.overrides ?? {};
  const conv = base.conversation_config_override ?? {};
  const ag = conv.agent ?? {};
  return { ...base, conversation_config_override: { ...conv, agent: { ...ag, first_message: true, language: true, prompt: { ...(ag.prompt ?? {}), prompt: true } } } };
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
        to_number: d.vendedor.telefono_e164,
        conversation_initiation_client_data: {
          dynamic_variables: variablesDelAgente(d),
          conversation_config_override: { agent: { first_message: guionDelAviso(d).primerMensaje, prompt: { prompt: guionDelAviso(d).prompt }, language: 'es' } },
        },
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
