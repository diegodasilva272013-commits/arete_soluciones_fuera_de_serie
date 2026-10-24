import { describe, expect, it } from 'vitest';
import { PLANTILLA_POR_DEFECTO, armarEnvio, aWhatsapp, configTwilio, enviarWhatsApp, remitente, renderPlantilla, textoNumerado, validarPlantilla, variablesDeContenido, variablesDelTexto, type ConfigTwilio } from './whatsapp';

const cfg: ConfigTwilio = { accountSid: 'AC123', usuario: 'AC123', clave: 'tok', from: '+14155238886' };

describe('plantilla de WhatsApp', () => {
  it('reemplaza las variables con los datos del lead', () => {
    expect(renderPlantilla('Hola {{nombre}} {{apellido}}, te escribe {{vendedor}}.', { nombre: 'Marcos', apellido: 'Aguirre', vendedor: 'Paola' })).toBe('Hola Marcos Aguirre, te escribe Paola.');
  });
  it('acepta espacios y mayúsculas dentro de las llaves', () => {
    expect(renderPlantilla('Hola {{ Nombre }}!', { nombre: 'Marcos' })).toBe('Hola Marcos!');
  });
  it('un dato que falta no deja el texto roto', () => {
    expect(renderPlantilla('Hola {{nombre}}, soy {{vendedor}} del {{evento}}.', { nombre: 'Marcos', vendedor: 'Paola' })).toBe('Hola Marcos, soy Paola del.');
    expect(renderPlantilla('Gracias {{nombre}} !', { nombre: null })).toBe('Gracias!');
  });
  it('la plantilla por defecto es válida y queda completa', () => {
    expect(validarPlantilla(PLANTILLA_POR_DEFECTO)).toBeNull();
    const t = renderPlantilla(PLANTILLA_POR_DEFECTO, { nombre: 'Marcos', vendedor: 'Paola' });
    expect(t).toContain('Hola Marcos');
    expect(t).toContain('Soy Paola');
    expect(t).not.toContain('{{');
  });
  it('rechaza textos vacíos, muy cortos, muy largos y variables inventadas', () => {
    expect(validarPlantilla('')).toMatch(/corta/);
    expect(validarPlantilla(undefined)).toMatch(/Escribí/);
    expect(validarPlantilla('x'.repeat(1001))).toMatch(/larga/);
    expect(validarPlantilla('Hola {{nombre}} {{telefono}}, te escribo desde Providus')).toMatch(/\{\{telefono\}\}/);
    expect(validarPlantilla('Hola {{nombre}}, te escribo desde Providus')).toBeNull();
  });
});

describe('plantilla numerada para WhatsApp (Twilio)', () => {
  it('detecta las variables en orden y sin repetir', () => {
    expect(variablesDelTexto('Hola {{nombre}}, soy {{vendedor}}. Chau {{nombre}} ({{ evento }}).')).toEqual(['nombre', 'vendedor', 'evento']);
    expect(variablesDelTexto('Sin variables')).toEqual([]);
  });
  it('convierte {{nombre}} en {{1}}, {{vendedor}} en {{2}}…', () => {
    expect(textoNumerado('Hola {{nombre}}, soy {{vendedor}}. Chau {{nombre}}.', ['nombre', 'vendedor'])).toBe('Hola {{1}}, soy {{2}}. Chau {{1}}.');
  });
  it('arma las variables de la plantilla con los datos del lead, y nunca vacías', () => {
    expect(variablesDeContenido(['nombre', 'vendedor'], { nombre: 'Marcos', vendedor: 'Paola' })).toEqual({ '1': 'Marcos', '2': 'Paola' });
    expect(variablesDeContenido(['nombre', 'evento'], { nombre: 'Marcos' })).toEqual({ '1': 'Marcos', '2': '-' });
  });
});

describe('Twilio: configuración y pedido', () => {
  it('toma la cuenta, el token y el número de WhatsApp del entorno', () => {
    expect(configTwilio({ TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 't', TWILIO_WHATSAPP_FROM: '+1415' })).toEqual({ accountSid: 'AC1', usuario: 'AC1', clave: 't', from: '+1415' });
    expect(configTwilio({ TWILIO_ACCOUNT_SID: 'AC1', TWILIO_API_KEY: 'SK1', TWILIO_API_SECRET: 's', TWILIO_WHATSAPP_FROM: '+1415' })).toEqual({ accountSid: 'AC1', usuario: 'SK1', clave: 's', from: '+1415' });
  });
  it('si falta algo, no hay configuración', () => {
    expect(configTwilio({ TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 't' })).toBeNull();
    expect(configTwilio({ TWILIO_ACCOUNT_SID: 'AC1', TWILIO_WHATSAPP_FROM: '+1415' })).toBeNull();
    expect(configTwilio({})).toBeNull();
  });
  it('el remitente es un número con prefijo whatsapp: o un Messaging Service', () => {
    expect(remitente('+14155238886')).toEqual({ From: 'whatsapp:+14155238886' });
    expect(remitente('whatsapp:+14155238886')).toEqual({ From: 'whatsapp:+14155238886' });
    expect(remitente('MG' + 'a'.repeat(32))).toEqual({ MessagingServiceSid: 'MG' + 'a'.repeat(32) });
    expect(aWhatsapp('+5493415551234')).toBe('whatsapp:+5493415551234');
  });
  it('arma el pedido con el texto directo', () => {
    const { url, init } = armarEnvio(cfg, '+5493415551234', { texto: 'Hola Marcos' });
    expect(url).toBe('https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json');
    const p = new URLSearchParams(init.body);
    expect(p.get('To')).toBe('whatsapp:+5493415551234');
    expect(p.get('From')).toBe('whatsapp:+14155238886');
    expect(p.get('Body')).toBe('Hola Marcos');
    expect(p.get('ContentSid')).toBeNull();
    expect((init.headers as Record<string, string>).Authorization).toBe(`Basic ${Buffer.from('AC123:tok').toString('base64')}`);
  });
  it('arma el pedido con la plantilla aprobada y sus variables', () => {
    const { init } = armarEnvio(cfg, '+5493415551234', { contentSid: 'HX1', variables: { '1': 'Marcos', '2': 'Paola' } });
    const p = new URLSearchParams(init.body);
    expect(p.get('ContentSid')).toBe('HX1');
    expect(JSON.parse(p.get('ContentVariables')!)).toEqual({ '1': 'Marcos', '2': 'Paola' });
    expect(p.get('Body')).toBeNull();
  });
});

describe('Twilio: envío', () => {
  const resp = (cuerpo: unknown, status = 200) => (async () => new Response(JSON.stringify(cuerpo), { status })) as unknown as typeof fetch;
  it('éxito: queda enviado con el SID del mensaje', async () => {
    expect(await enviarWhatsApp(cfg, '+5493415551234', { texto: 'Hola' }, { fetchFn: resp({ sid: 'SM1', status: 'queued' }, 201) })).toEqual({ estado: 'enviado', sid: 'SM1' });
  });
  it('error de Twilio: queda fallido con el código y el motivo', async () => {
    const r = await enviarWhatsApp(cfg, '+5493415551234', { texto: 'Hola' }, { fetchFn: resp({ code: 63016, message: 'Fuera de la ventana de 24 horas: hace falta una plantilla' }, 400) });
    expect(r.estado).toBe('fallido');
    expect(r.estado === 'fallido' && r.error).toContain('63016');
    expect(r.estado === 'fallido' && r.error).toContain('plantilla');
  });
  it('un mensaje que Twilio acepta pero marca fallido también cuenta como fallido', async () => {
    expect((await enviarWhatsApp(cfg, '+5493415551234', { texto: 'Hola' }, { fetchFn: resp({ sid: 'SM1', status: 'failed', error_code: 63015, error_message: 'no unido al sandbox' }, 201) })).estado).toBe('fallido');
  });
  it('sin configuración se omite, y si la red falla o tarda devuelve fallido sin lanzar', async () => {
    expect((await enviarWhatsApp(null, '+5493415551234', { texto: 'Hola' })).estado).toBe('omitido');
    expect((await enviarWhatsApp(cfg, '+5493415551234', { texto: 'Hola' }, { fetchFn: (async () => { throw new Error('ECONNRESET'); }) as unknown as typeof fetch })).estado).toBe('fallido');
    const lento = ((_u: string, init?: RequestInit) => new Promise((_ok, mal) => { init?.signal?.addEventListener('abort', () => { const e = new Error('abort'); e.name = 'AbortError'; mal(e); }); })) as unknown as typeof fetch;
    expect(await enviarWhatsApp(cfg, '+5493415551234', { texto: 'Hola' }, { fetchFn: lento, timeoutMs: 20 })).toEqual({ estado: 'fallido', error: 'Twilio no respondió a tiempo.' });
  });
});
