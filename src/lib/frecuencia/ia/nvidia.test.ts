import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chatCompletion, ErrorIA, LIMITE_PEDIDOS_POR_MINUTO, reiniciarLimitesParaPruebas, reservarPedido } from './nvidia';

const respuesta = (cuerpo: unknown, status = 200) => ({ ok: status < 400, status, json: async () => cuerpo }) as unknown as Response;

beforeEach(() => {
  reiniciarLimitesParaPruebas();
  process.env.NVIDIA_API_KEY = 'clave-de-prueba';
  delete process.env.NVIDIA_CHAT_BASE_URL;
});
afterEach(() => vi.unstubAllGlobals());

describe('reservarPedido (40 por minuto por modelo)', () => {
  it('deja pasar 40 y corta el 41; otro modelo tiene su propio cupo; pasado el minuto se libera', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LIMITE_PEDIDOS_POR_MINUTO; i++) expect(reservarPedido('m1', t0 + i)).toBe(true);
    expect(reservarPedido('m1', t0 + 100)).toBe(false);
    expect(reservarPedido('m2', t0 + 100)).toBe(true);
    expect(reservarPedido('m1', t0 + 61_000)).toBe(true);
  });
});

describe('chatCompletion', () => {
  it('manda el pedido con la clave en el header (no en el cuerpo) y devuelve el mensaje', async () => {
    const f = vi.fn().mockResolvedValue(respuesta({ choices: [{ message: { role: 'assistant', content: 'Hola' } }] }));
    vi.stubGlobal('fetch', f);
    const r = await chatCompletion({ modelo: 'meta/llama', mensajes: [{ role: 'user', content: 'hola' }] });
    expect(r.content).toBe('Hola');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer clave-de-prueba');
    expect(String(init.body)).not.toContain('clave-de-prueba');
  });

  it('devuelve las llamadas a herramientas', async () => {
    const tool_calls = [{ id: 'c1', type: 'function', function: { name: 'crear_objetivo', arguments: '{"titulo":"x"}' } }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ choices: [{ message: { role: 'assistant', content: null, tool_calls } }] })));
    const r = await chatCompletion({ modelo: 'm', mensajes: [] });
    expect(r.tool_calls?.[0].function.name).toBe('crear_objetivo');
  });

  it('sin clave falla con un error legible (y no llama a la red)', async () => {
    delete process.env.NVIDIA_API_KEY;
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    await expect(chatCompletion({ modelo: 'm', mensajes: [] })).rejects.toMatchObject({ codigo: 'sin_clave' });
    expect(f).not.toHaveBeenCalled();
  });

  it('acepta la clave cargada como nvidia_key', async () => {
    delete process.env.NVIDIA_API_KEY;
    process.env.nvidia_key = 'clave-alias';
    const f = vi.fn().mockResolvedValue(respuesta({ choices: [{ message: { role: 'assistant', content: 'hola' } }] }));
    vi.stubGlobal('fetch', f);
    await chatCompletion({ modelo: 'm', mensajes: [] });
    expect((f.mock.calls[0][1] as { headers: Record<string, string> }).headers.Authorization).toBe('Bearer clave-alias');
    delete process.env.nvidia_key;
    process.env.NVIDIA_API_KEY = 'clave-de-prueba';
  });

  it('traduce 429, 500, red caída y respuestas vacías', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({}, 429)));
    await expect(chatCompletion({ modelo: 'a', mensajes: [] })).rejects.toMatchObject({ codigo: 'limite' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({}, 500)));
    await expect(chatCompletion({ modelo: 'b', mensajes: [] })).rejects.toMatchObject({ codigo: 'proveedor' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')));
    await expect(chatCompletion({ modelo: 'c', mensajes: [] })).rejects.toBeInstanceOf(ErrorIA);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ choices: [] })));
    await expect(chatCompletion({ modelo: 'd', mensajes: [] })).rejects.toMatchObject({ codigo: 'respuesta_invalida' });
  });

  it('ignora NVIDIA_CHAT_BASE_URL fuera del modo de prueba (nunca manda la clave a otro host)', async () => {
    process.env.NVIDIA_CHAT_BASE_URL = 'http://evil.example/v1';
    delete process.env.FRECUENCIA_IA_MODO_PRUEBA;
    const f = vi.fn().mockResolvedValue(respuesta({ choices: [{ message: { role: 'assistant', content: 'ok' } }] }));
    vi.stubGlobal('fetch', f);
    await chatCompletion({ modelo: 'x1', mensajes: [] });
    expect(f.mock.calls[0][0]).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
    expect(f.mock.calls[0][1].redirect).toBe('error');
  });

  it('descarta llamadas a herramientas mal formadas', async () => {
    const tool_calls = [{ id: 'ok', type: 'function', function: { name: 'crear_objetivo', arguments: '{}' } }, { id: 'mal', type: 'function', function: {} }, { type: 'otra' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ choices: [{ message: { role: 'assistant', content: null, tool_calls } }] })));
    const r = await chatCompletion({ modelo: 'x2', mensajes: [] });
    expect(r.tool_calls).toHaveLength(1);
  });

  it('timeout y la clave nunca aparecen en los mensajes de error', async () => {
    const abort = Object.assign(new Error('abort'), { name: 'AbortError' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    const e1 = await chatCompletion({ modelo: 'x3', mensajes: [] }).catch((e) => e);
    expect(e1.codigo).toBe('timeout');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fallo con clave-de-prueba')));
    const e2 = await chatCompletion({ modelo: 'x4', mensajes: [] }).catch((e) => e);
    expect(e2.codigo).toBe('proveedor');
    expect(String(e2.message)).not.toContain('clave-de-prueba');
  });

  it('con FRECUENCIA_IA_MODO_PRUEBA=1 respeta NVIDIA_CHAT_BASE_URL (servidor falso)', async () => {
    process.env.FRECUENCIA_IA_MODO_PRUEBA = '1';
    process.env.NVIDIA_CHAT_BASE_URL = 'http://localhost:9999/v1';
    const f = vi.fn().mockResolvedValue(respuesta({ choices: [{ message: { role: 'assistant', content: 'ok' } }] }));
    vi.stubGlobal('fetch', f);
    await chatCompletion({ modelo: 'e', mensajes: [] });
    expect(f.mock.calls[0][0]).toBe('http://localhost:9999/v1/chat/completions');
  });
});

import { endpointImagenSeguro, generarImagen, tipoDeImagen } from './nvidia';

describe('imágenes', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]).toString('base64');
  beforeEach(() => {
    delete process.env.FRECUENCIA_IA_MODO_PRUEBA;
    delete process.env.NVIDIA_IMAGES_BASE_URL;
  });

  it('solo acepta https y el host de NVIDIA para imágenes (el endpoint viene de la base)', () => {
    expect(endpointImagenSeguro('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell')).toContain('ai.api.nvidia.com');
    expect(endpointImagenSeguro('http://ai.api.nvidia.com/x')).toBeNull();
    expect(endpointImagenSeguro('https://evil.example/x')).toBeNull();
    expect(endpointImagenSeguro('https://ai.api.nvidia.com.evil.example/x')).toBeNull();
    expect(endpointImagenSeguro('no es url')).toBeNull();
  });

  it('reconoce el tipo por la cabecera real', () => {
    expect(tipoDeImagen(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0]))?.ext).toBe('png');
    expect(tipoDeImagen(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.ext).toBe('jpg');
    expect(tipoDeImagen(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))).toBeNull();
  });

  it('devuelve los bytes de la imagen y rechaza respuestas que no son imagen', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ artifacts: [{ base64: png, finishReason: 'SUCCESS' }] })));
    const r = await generarImagen({ endpoint: 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell', prompt: 'una mesa', modeloId: 'i1' });
    expect(r.ext).toBe('png');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ artifacts: [{ base64: Buffer.from('texto plano').toString('base64'), finishReason: 'SUCCESS' }] })));
    await expect(generarImagen({ endpoint: 'https://ai.api.nvidia.com/v1/x', prompt: 'p', modeloId: 'i2' })).rejects.toMatchObject({ codigo: 'respuesta_invalida' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta({ artifacts: [{ base64: png, finishReason: 'CONTENT_FILTERED' }] })));
    await expect(generarImagen({ endpoint: 'https://ai.api.nvidia.com/v1/x', prompt: 'p', modeloId: 'i3' })).rejects.toMatchObject({ codigo: 'respuesta_invalida' });
  });

  it('con endpoint inválido no llama a la red', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    await expect(generarImagen({ endpoint: 'https://evil.example/x', prompt: 'p', modeloId: 'i4' })).rejects.toMatchObject({ codigo: 'proveedor' });
    expect(f).not.toHaveBeenCalled();
  });
});
