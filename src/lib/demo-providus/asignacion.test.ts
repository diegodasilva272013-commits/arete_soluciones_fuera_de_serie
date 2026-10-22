import { describe, expect, it } from 'vitest';
import { elegirVendedor, type VendedorZona } from './asignacion';
import { armarPedido, configIA, guionDelAviso, iniciarLlamada, overridesActivos, overridesParaActivar, telefonoConPausas, telefonoDictado, variablesDelAgente, type DatosLlamada } from './llamada-ia';

const v = (id: string, extra: Partial<VendedorZona> = {}): VendedorZona => ({
  id, nombre: id, apellido: 'X', telefono_e164: '+5493450000000', provincias: ['Santa Fe'], recibe_resto: false, llamar_ia: true, activo: true, ultima_asignacion: null, ...extra,
});

describe('elegirVendedor', () => {
  it('elige un vendedor de la provincia del lead', () => {
    const r = elegirVendedor([v('a', { provincias: ['Córdoba'] }), v('b', { provincias: ['Santa Fe'] })], 'Santa Fe');
    expect(r?.id).toBe('b');
  });
  it('rota: recibe el que hace más tiempo que no recibe', () => {
    const lista = [v('a', { ultima_asignacion: '2026-10-22T10:00:00Z' }), v('b', { ultima_asignacion: '2026-10-22T09:00:00Z' }), v('c', { ultima_asignacion: '2026-10-22T11:00:00Z' })];
    expect(elegirVendedor(lista, 'Santa Fe')?.id).toBe('b');
  });
  it('el que nunca recibió va primero', () => {
    expect(elegirVendedor([v('a', { ultima_asignacion: '2026-10-22T10:00:00Z' }), v('b')], 'Santa Fe')?.id).toBe('b');
  });
  it('ignora a los vendedores inactivos', () => {
    expect(elegirVendedor([v('a', { activo: false }), v('b')], 'Santa Fe')?.id).toBe('b');
    expect(elegirVendedor([v('a', { activo: false })], 'Santa Fe')).toBeNull();
  });
  it('si nadie atiende la provincia, va a los que reciben el resto', () => {
    const lista = [v('a', { provincias: ['Córdoba'] }), v('b', { provincias: [], recibe_resto: true })];
    expect(elegirVendedor(lista, 'Salta')?.id).toBe('b');
  });
  it('un vendedor de la zona gana sobre el que recibe el resto', () => {
    const lista = [v('a', { provincias: [], recibe_resto: true }), v('b', { provincias: ['Salta'] })];
    expect(elegirVendedor(lista, 'Salta')?.id).toBe('b');
  });
  it('sin vendedor posible devuelve null (queda sin asignar)', () => {
    expect(elegirVendedor([v('a', { provincias: ['Córdoba'] })], 'Salta')).toBeNull();
    expect(elegirVendedor([], 'Salta')).toBeNull();
  });
  it('el empate es estable (mismo resultado siempre)', () => {
    expect(elegirVendedor([v('b'), v('a')], 'Santa Fe')?.id).toBe('a');
  });
});

const datos: DatosLlamada = {
  vendedor: { nombre: 'Diego', telefono_e164: '+5493454100816' },
  cliente: { nombre: 'Marcos', apellido: 'Aguirre', telefono_e164: '+5493415001234', provincia: 'Santa Fe', localidad: 'Rosario' },
  promotora: 'Laura Pérez',
  evento: 'Expo Rosario',
};
const cfg = { apiKey: 'k', agentId: 'agent_1', phoneNumberId: 'phnum_1' };

describe('llamada de IA', () => {
  it('dicta el teléfono dígito por dígito sin el 54 9', () => {
    expect(telefonoDictado('+5493415001234')).toBe('3 4 1 5 0 0 1 2 3 4');
  });
  it('detecta si el agente permite personalizar cada llamada', () => {
    expect(overridesActivos({})).toEqual({ primer_mensaje: false, prompt: false, idioma: false });
    const agente = { platform_settings: { overrides: { conversation_config_override: { agent: { first_message: true, language: true, prompt: { prompt: true } } } } } };
    expect(overridesActivos(agente)).toEqual({ primer_mensaje: true, prompt: true, idioma: true });
  });
  it('al activar la personalización se conserva todo lo que el agente ya tenía', () => {
    const agente = { platform_settings: { overrides: { enable_conversation_initiation_client_data_from_webhook: true, conversation_config_override: { tts: { voice_id: true }, agent: { prompt: { llm: true } } } } } };
    const nuevo = overridesParaActivar(agente) as { enable_conversation_initiation_client_data_from_webhook: boolean; conversation_config_override: { tts: unknown; agent: { first_message: boolean; language: boolean; prompt: { llm: boolean; prompt: boolean } } } };
    expect(nuevo.enable_conversation_initiation_client_data_from_webhook).toBe(true);
    expect(nuevo.conversation_config_override.tts).toEqual({ voice_id: true });
    expect(nuevo.conversation_config_override.agent).toEqual({ first_message: true, language: true, prompt: { llm: true, prompt: true } });
    expect(overridesParaActivar({})).toEqual({ conversation_config_override: { agent: { first_message: true, language: true, prompt: { prompt: true } } } });
  });
  it('el guion del aviso trae los datos reales y no deja marcadores sin completar', () => {
    const g = guionDelAviso(datos);
    expect(telefonoConPausas('+5493415001234')).toBe('3 4 1, 5 0 0, 1 2 3 4');
    expect(g.primerMensaje).toContain('Diego');
    expect(g.primerMensaje).toContain('Marcos Aguirre');
    expect(g.primerMensaje).toContain('Rosario, Santa Fe');
    expect(g.primerMensaje).toContain('3 4 1, 5 0 0, 1 2 3 4');
    expect(g.primerMensaje).toContain('Laura Pérez');
    expect(g.primerMensaje + g.prompt).not.toMatch(/\{\{|undefined|null/);
    // si faltan datos opcionales, no queda texto roto
    const sin = guionDelAviso({ ...datos, promotora: null, evento: null, cliente: { ...datos.cliente, localidad: null } });
    expect(sin.primerMensaje).toContain('de Santa Fe.');
    expect(sin.primerMensaje).not.toContain('Lo cargó');
  });
  it('arma el pedido de ElevenLabs con las variables anidadas', () => {
    const { url, init } = armarPedido(cfg, datos);
    expect(url).toBe('https://api.elevenlabs.io/v1/convai/twilio/outbound-call');
    expect((init.headers as Record<string, string>)['xi-api-key']).toBe('k');
    const b = JSON.parse(init.body);
    expect(b.agent_id).toBe('agent_1');
    expect(b.agent_phone_number_id).toBe('phnum_1');
    expect(b.to_number).toBe('+5493454100816');
    expect(b.conversation_initiation_client_data.dynamic_variables).toEqual(variablesDelAgente(datos));
    expect(b.conversation_initiation_client_data.dynamic_variables.cliente_nombre).toBe('Marcos');
    // los nombres del agente de ElevenLabs también viajan
    const v = b.conversation_initiation_client_data.dynamic_variables;
    expect(v.prospecto_nombre).toBe('Marcos');
    expect(v.vendedor_nombre).toBe('Diego');
    expect(v.telefono_e164).toBe('+5493415001234');
    // el guion de este aviso viaja en cada llamada (override), así no se usa el de atención entrante del agente
    const ov = b.conversation_initiation_client_data.conversation_config_override.agent;
    expect(ov.first_message).toContain('Marcos Aguirre');
    expect(ov.prompt.prompt).toContain('VENDEDOR');
    expect(ov.language).toBe('es');
  });
  it('sin configuración se omite y no llama a nadie', async () => {
    let llamados = 0;
    const r = await iniciarLlamada(datos, { cfg: null, fetchFn: (async () => { llamados++; return new Response('{}'); }) as typeof fetch });
    expect(r.estado).toBe('omitida');
    expect(llamados).toBe(0);
  });
  it('configIA acepta la clave con el nombre que se cargó en Vercel, y nunca usa la de otro proyecto', () => {
    const base = { ELEVENLABS_PROVIDUS_AGENT_ID: 'b', ELEVENLABS_PHONE_NUMBER_ID: 'c' };
    expect(configIA({ ...base, eleben_labs_api: ' sk_x ' })?.apiKey).toBe('sk_x');
    expect(configIA({ ...base, noa_eleven_labs_api: 'sk_ajena' })).toBeNull();
  });
  it('configIA exige las tres variables', () => {
    expect(configIA({ ELEVENLABS_API_KEY: 'a', ELEVENLABS_PROVIDUS_AGENT_ID: 'b' })).toBeNull();
    expect(configIA({ ELEVENLABS_API_KEY: 'a', ELEVENLABS_PROVIDUS_AGENT_ID: 'b', ELEVENLABS_PHONE_NUMBER_ID: 'c' })).toEqual({ apiKey: 'a', agentId: 'b', phoneNumberId: 'c' });
  });
  it('éxito: queda llamando con la referencia de la conversación', async () => {
    const fetchFn = (async () => new Response(JSON.stringify({ success: true, message: 'ok', conversation_id: 'conv_9', callSid: 'CA1' }), { status: 200 })) as typeof fetch;
    expect(await iniciarLlamada(datos, { cfg, fetchFn })).toEqual({ estado: 'llamando', ref: 'conv_9' });
  });
  it('error de ElevenLabs: queda fallida con el mensaje', async () => {
    const fetchFn = (async () => new Response(JSON.stringify({ detail: 'Número no válido' }), { status: 422 })) as typeof fetch;
    const r = await iniciarLlamada(datos, { cfg, fetchFn });
    expect(r.estado).toBe('fallida');
    expect(r.estado === 'fallida' && r.error).toContain('Número no válido');
  });
  it('success:false cuenta como fallida aunque el HTTP sea 200', async () => {
    const fetchFn = (async () => new Response(JSON.stringify({ success: false, message: 'sin saldo' }), { status: 200 })) as typeof fetch;
    const r = await iniciarLlamada(datos, { cfg, fetchFn });
    expect(r).toEqual({ estado: 'fallida', error: 'sin saldo' });
  });
  it('si la red falla no lanza: devuelve fallida', async () => {
    const fetchFn = (async () => { throw new Error('ECONNRESET'); }) as typeof fetch;
    const r = await iniciarLlamada(datos, { cfg, fetchFn });
    expect(r.estado).toBe('fallida');
  });
  it('si ElevenLabs tarda demasiado corta por tiempo', async () => {
    const fetchFn = ((_u: string, init?: RequestInit) => new Promise((_ok, mal) => { init?.signal?.addEventListener('abort', () => { const e = new Error('abort'); e.name = 'AbortError'; mal(e); }); })) as unknown as typeof fetch;
    const r = await iniciarLlamada(datos, { cfg, fetchFn, timeoutMs: 20 });
    expect(r).toEqual({ estado: 'fallida', error: 'ElevenLabs no respondió a tiempo.' });
  });
});
