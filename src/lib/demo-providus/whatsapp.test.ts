import { describe, expect, it } from 'vitest';
import { elegirInstancia, enviarTexto, numeroParaWhatsapp, PLANTILLA_POR_DEFECTO, renderPlantilla, validarPlantilla, type InstanciaEvolution } from './whatsapp';

const inst = (id: string, status: string): InstanciaEvolution => ({ id, name: id, instance_key: `k-${id}`, api_url: 'https://evo.example.com/', api_token: 'tok', status, phone_number: null });

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

describe('envío por Evolution', () => {
  it('manda el texto al WhatsApp elegido con solo los dígitos del número', async () => {
    let llamado: { url: string; init: RequestInit } | null = null;
    const fetchFn = (async (url: string, init: RequestInit) => { llamado = { url, init }; return new Response('{}', { status: 201 }); }) as unknown as typeof fetch;
    const r = await enviarTexto(inst('a', 'open'), '+5493415551234', 'Hola', { fetchFn });
    expect(r).toEqual({ estado: 'enviado' });
    expect(llamado!.url).toBe('https://evo.example.com/message/sendText/k-a');
    expect((llamado!.init.headers as Record<string, string>).apikey).toBe('tok');
    expect(JSON.parse(llamado!.init.body as string)).toEqual({ number: '5493415551234', text: 'Hola' });
  });
  it('si Evolution responde error, queda fallido con el motivo y no lanza', async () => {
    const fetchFn = (async () => new Response('instance not connected', { status: 400 })) as unknown as typeof fetch;
    const r = await enviarTexto(inst('a', 'close'), '+5493415551234', 'Hola', { fetchFn });
    expect(r.estado).toBe('fallido');
    expect(r.estado === 'fallido' && r.error).toContain('instance not connected');
  });
  it('si la red falla o tarda, devuelve fallido', async () => {
    expect((await enviarTexto(inst('a', 'open'), '+5493415551234', 'Hola', { fetchFn: (async () => { throw new Error('ECONNRESET'); }) as unknown as typeof fetch })).estado).toBe('fallido');
    const lento = ((_u: string, init?: RequestInit) => new Promise((_ok, mal) => { init?.signal?.addEventListener('abort', () => { const e = new Error('abort'); e.name = 'AbortError'; mal(e); }); })) as unknown as typeof fetch;
    expect(await enviarTexto(inst('a', 'open'), '+5493415551234', 'Hola', { fetchFn: lento, timeoutMs: 20 })).toEqual({ estado: 'fallido', error: 'El WhatsApp no respondió a tiempo.' });
  });
  it('numeroParaWhatsapp deja solo dígitos', () => {
    expect(numeroParaWhatsapp('+54 9 341 555-1234')).toBe('5493415551234');
  });
});

describe('instancia de WhatsApp', () => {
  it('usa la elegida, y si no hay elegida, la primera conectada', () => {
    const lista = [inst('a', 'close'), inst('b', 'open'), inst('c', 'connected')];
    expect(elegirInstancia(lista, 'c')?.id).toBe('c');
    expect(elegirInstancia(lista, null)?.id).toBe('b');
    expect(elegirInstancia([inst('a', 'close')], null)).toBeNull();
    expect(elegirInstancia(lista, 'inexistente')).toBeNull();
  });
});
