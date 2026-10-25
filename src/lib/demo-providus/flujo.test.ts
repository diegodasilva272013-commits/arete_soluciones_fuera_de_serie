import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asignarYAvisar, type LeadNuevo } from './flujo';

// Base falsa en memoria: solo lo que usa flujo.ts (select / update / eq / maybeSingle).
/* eslint-disable @typescript-eslint/no-explicit-any */
function baseFalsa(estado: { vendedores: any[]; registros: any[]; config?: any[]; instancias?: any[] }, errorVendedores?: { code: string; message: string }) {
  return {
    from(tabla: string) {
      const filas = tabla === 'demo_providus_vendedores' ? estado.vendedores : tabla === 'demo_providus_config' ? (estado.config ?? []) : tabla === 'evolution_instances' ? (estado.instancias ?? []) : estado.registros;
      const filtros: ((r: any) => boolean)[] = [];
      let cambios: any = null;
      const correr = (uno: boolean) => {
        if (tabla === 'demo_providus_vendedores' && errorVendedores) return { data: null, error: errorVendedores };
        const m = filas.filter((r) => filtros.every((f) => f(r)));
        if (cambios) m.forEach((r) => Object.assign(r, cambios));
        return { data: uno ? (m[0] ?? null) : m, error: null };
      };
      const b: any = {
        select: () => b,
        update: (p: any) => { cambios = p; return b; },
        eq: (c: string, v: any) => { filtros.push((r) => r[c] === v); return b; },
        is: (c: string, v: any) => { filtros.push((r) => (r[c] ?? null) === v); return b; },
        maybeSingle: async () => correr(true),
        then: (ok: any, mal: any) => Promise.resolve(correr(false)).then(ok, mal),
      };
      return b;
    },
  };
}

const vendedor = (extra: Record<string, unknown> = {}) => ({
  id: 'v1', nombre: 'Diego', apellido: 'Da Silva', telefono_e164: '+5493454100816', provincias: ['Santa Fe'],
  recibe_resto: false, llamar_ia: true, activo: true, ultima_asignacion: null, ...extra,
});
const lead: LeadNuevo = { id: 'r1', nombre: 'Marcos', apellido: 'Aguirre', telefono_e164: '+5493415001234', provincia: 'Santa Fe', localidad: 'Rosario', promotora: 'Laura Pérez', evento: 'Expo', consentimiento: true };
const registro = (): any => ({ id: 'r1', llamada_estado: 'pendiente' });

const ENV = ['ELEVENLABS_API_KEY', 'ELEVENLABS_PROVIDUS_AGENT_ID', 'ELEVENLABS_PHONE_NUMBER_ID'] as const;
let fetchFalso: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchFalso = vi.fn(async () => new Response(JSON.stringify({ success: true, message: 'ok', conversation_id: 'conv_1', callSid: 'CA1' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchFalso);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const k of ENV) delete process.env[k];
});
const configurar = () => { process.env.ELEVENLABS_API_KEY = 'k'; process.env.ELEVENLABS_PROVIDUS_AGENT_ID = 'ag'; process.env.ELEVENLABS_PHONE_NUMBER_ID = 'ph'; };

describe('asignar y avisar', () => {
  it('asigna al vendedor de la zona y el asistente llama al cliente', async () => {
    configurar();
    const est = { vendedores: [vendedor()], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'llamando', whatsapp: 'omitido' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', vendedor_nombre: 'Diego Da Silva', llamada_estado: 'llamando', llamada_ref: 'conv_1', llamada_error: null });
    expect(est.vendedores[0].ultima_asignacion).toBeTruthy();
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const cuerpo = JSON.parse((fetchFalso.mock.calls[0][1] as RequestInit).body as string);
    expect(cuerpo.to_number).toBe('+5493415001234'); // llama al CLIENTE, no al vendedor
    expect(cuerpo.conversation_initiation_client_data.dynamic_variables).toMatchObject({ prospecto_nombre: 'Marcos', vendedor_nombre: 'Diego', telefono_e164: '+5493415001234' });
  });

  it('no llama dos veces por el mismo lead', async () => {
    configurar();
    const est = { vendedores: [vendedor()], registros: [registro()] };
    await asignarYAvisar(baseFalsa(est), lead);
    const segunda = await asignarYAvisar(baseFalsa(est), lead);
    expect(segunda.llamada).toBe('ya_pedida');
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it('sin la llamada de IA configurada igual asigna, y deja la llamada como omitida', async () => {
    const est = { vendedores: [vendedor()], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'omitida' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'omitida' });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('si ElevenLabs falla, el lead queda asignado, la llamada fallida y no se lanza ningún error', async () => {
    configurar();
    fetchFalso.mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'sin saldo' }), { status: 402 }));
    const est = { vendedores: [vendedor()], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'fallida' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'fallida' });
    expect(String(est.registros[0].llamada_error)).toContain('sin saldo');
  });

  it('si el cliente no autorizó que lo contacten, no se lo llama aunque haya vendedor con IA activada', async () => {
    configurar();
    const est = { vendedores: [vendedor()], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), { ...lead, consentimiento: false });
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'sin_consentimiento', whatsapp: 'sin_consentimiento' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'pendiente' });
    expect(fetchFalso).not.toHaveBeenCalled();
  });
  it('si el vendedor tiene la llamada de IA apagada, no llama', async () => {
    configurar();
    const est = { vendedores: [vendedor({ llamar_ia: false })], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'omitida' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'pendiente' });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('si no hay vendedor para la provincia, el lead queda sin asignar pero igual se llama al cliente', async () => {
    configurar();
    const est = { vendedores: [vendedor({ provincias: ['Córdoba'] })], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r.vendedor).toBeNull();
    expect(r.llamada).not.toBe('omitida');
    expect(est.registros[0]).not.toHaveProperty('vendedor_id');
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body).to_number).toBe(lead.telefono_e164);
  });

  it('antes de correr la migración 0089 no hace nada ni rompe el alta', async () => {
    configurar();
    const est = { vendedores: [], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est, { code: '42P01', message: 'relation "demo_providus_vendedores" does not exist' }), lead);
    expect(r.vendedor).toBeNull();
    expect(r.llamada).not.toBe('error');
  });

  it('un error inesperado de la base se traga y devuelve sin asignar', async () => {
    const rota = { from: () => { throw new Error('se cayó la base'); } };
    await expect(asignarYAvisar(rota, lead)).resolves.toMatchObject({ vendedor: null, llamada: 'error', whatsapp: 'error' });
  });

  it('rota entre los vendedores de la misma zona', async () => {
    const est = {
      vendedores: [vendedor({ id: 'a', ultima_asignacion: '2026-10-22T10:00:00Z' }), vendedor({ id: 'b', ultima_asignacion: '2026-10-22T09:00:00Z', nombre: 'Ana' })],
      registros: [registro(), { id: 'r2', llamada_estado: 'pendiente' }],
    };
    expect((await asignarYAvisar(baseFalsa(est), lead)).vendedor).toBe('b'); // b era el que más tiempo llevaba sin recibir
    expect((await asignarYAvisar(baseFalsa(est), { ...lead, id: 'r2' })).vendedor).toBe('a'); // ahora le toca a a
  });
});

describe('plantilla de WhatsApp al cliente (Twilio)', () => {
  const config = (valor: Record<string, unknown>) => [{ clave: 'whatsapp_plantilla', valor }];
  const aTwilio = () => fetchFalso.mock.calls.filter((c) => String(c[0]).startsWith('https://api.twilio.com'));
  const parametros = (i = 0) => new URLSearchParams((aTwilio()[i][1] as RequestInit).body as string);
  const conTwilio = () => { process.env.TWILIO_ACCOUNT_SID = 'AC123'; process.env.TWILIO_AUTH_TOKEN = 'tok'; process.env.TWILIO_WHATSAPP_FROM = '+14155238886'; };
  const respuestasTwilio = (status = 201, cuerpo: unknown = { sid: 'SM1', status: 'queued' }) =>
    fetchFalso.mockImplementation(async (url: string) => (String(url).startsWith('https://api.twilio.com') ? new Response(JSON.stringify(cuerpo), { status }) : new Response(JSON.stringify({ success: true, conversation_id: 'conv_1' }), { status: 200 })));
  beforeEach(() => { conTwilio(); respuestasTwilio(); });
  afterEach(() => { for (const k of ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM']) delete process.env[k]; });

  it('envía el texto con los datos del lead al cliente y deja registrado que se envió', async () => {
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, te escribe {{vendedor}} de Providus.', activa: true }) };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r.whatsapp).toBe('enviado');
    expect(aTwilio()).toHaveLength(1);
    expect(String(aTwilio()[0][0])).toBe('https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json');
    expect(parametros().get('To')).toBe('whatsapp:+5493415001234'); // al CLIENTE
    expect(parametros().get('From')).toBe('whatsapp:+14155238886');
    expect(parametros().get('Body')).toBe('Hola Marcos, te escribe Diego de Providus.');
    expect(est.registros[0]).toMatchObject({ whatsapp_estado: 'enviado', whatsapp_error: null });
  });

  it('con una plantilla aprobada de Twilio se envía con ella y sus variables en orden', async () => {
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, soy {{vendedor}}.', activa: true, content_sid: 'HX1', variables_orden: ['nombre', 'vendedor'] }) };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r.whatsapp).toBe('enviado');
    expect(parametros().get('ContentSid')).toBe('HX1');
    expect(JSON.parse(parametros().get('ContentVariables')!)).toEqual({ '1': 'Marcos', '2': 'Diego' });
    expect(parametros().get('Body')).toBeNull();
  });

  it('el WhatsApp y la llamada del asistente salen los dos', async () => {
    configurar();
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, gracias por pasar por Providus.', activa: true }) };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'llamando', whatsapp: 'enviado' });
    expect(fetchFalso.mock.calls.some((c) => String(c[0]).includes('elevenlabs.io'))).toBe(true);
    expect(aTwilio()).toHaveLength(1);
  });

  it('con la plantilla desactivada o sin configurar no se manda nada', async () => {
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, gracias por venir.', activa: false }) };
    expect((await asignarYAvisar(baseFalsa(est), lead)).whatsapp).toBe('omitido');
    const sinConfig = { vendedores: [vendedor()], registros: [registro()], config: [] };
    expect((await asignarYAvisar(baseFalsa(sinConfig), lead)).whatsapp).toBe('omitido');
    expect(aTwilio()).toHaveLength(0);
  });

  it('sin Twilio configurado en el servidor no se manda nada ni se rompe el alta', async () => {
    delete process.env.TWILIO_AUTH_TOKEN;
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, gracias por venir.', activa: true }) };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', whatsapp: 'omitido' });
    expect(aTwilio()).toHaveLength(0);
  });

  it('sin la autorización del cliente no se le escribe', async () => {
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, gracias por venir.', activa: true }) };
    expect((await asignarYAvisar(baseFalsa(est), { ...lead, consentimiento: false })).whatsapp).toBe('sin_consentimiento');
    expect(aTwilio()).toHaveLength(0);
  });

  it('un solo mensaje por lead aunque el alta se procese dos veces', async () => {
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, gracias por venir.', activa: true }) };
    await asignarYAvisar(baseFalsa(est), lead);
    const segunda = await asignarYAvisar(baseFalsa(est), lead);
    expect(segunda.whatsapp).toBe('ya_enviado');
    expect(aTwilio()).toHaveLength(1);
  });

  it('si Twilio rechaza el mensaje, el lead queda asignado, el mensaje fallido con el motivo y la llamada sigue', async () => {
    configurar();
    respuestasTwilio(400, { code: 63016, message: 'Fuera de la ventana de 24 horas: hace falta una plantilla' });
    const est = { vendedores: [vendedor()], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, gracias por venir.', activa: true }) };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: 'v1', llamada: 'llamando', whatsapp: 'fallido' });
    expect(est.registros[0]).toMatchObject({ whatsapp_estado: 'fallido', llamada_estado: 'llamando' });
    expect(String(est.registros[0].whatsapp_error)).toContain('63016');
  });

  it('manda el WhatsApp aunque el lead no tenga vendedor de zona', async () => {
    const est = { vendedores: [vendedor({ provincias: ['Córdoba'] })], registros: [registro()], config: config({ texto: 'Hola {{nombre}}, te escribe {{vendedor}}.', activa: true }) };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toMatchObject({ vendedor: null, whatsapp: 'enviado' });
    expect(parametros().get('Body')).toBe('Hola Marcos, te escribe nuestro equipo.');
  });
});
