import { describe, expect, it } from 'vitest';
import { armarHistorial, esAfirmativo, codificarAsistenteConHerramientas, codificarResultado, estadoPropuestaSemana, mensajesVisibles, type FilaMensaje } from './historial';

const llamada = (id: string) => ({ id, type: 'function' as const, function: { name: 'crear_objetivo', arguments: '{"titulo":"x"}' } });
const user = (t: string): FilaMensaje => ({ rol: 'user', contenido: t });
const asistente = (t: string): FilaMensaje => ({ rol: 'assistant', contenido: t });
const conTools = (id: string, texto: string | null = null): FilaMensaje => ({ rol: 'assistant', contenido: codificarAsistenteConHerramientas(texto, [llamada(id)]) });
const resultado = (id: string, name = 'crear_objetivo', r: unknown = { ok: true }): FilaMensaje => ({ rol: 'tool', contenido: codificarResultado(id, name, r) });

describe('armarHistorial', () => {
  it('reconstruye una conversación con herramientas en el orden correcto', () => {
    const h = armarHistorial([user('hola'), conTools('c1'), resultado('c1'), asistente('Listo')]);
    expect(h.map((m) => m.role)).toEqual(['user', 'assistant', 'tool', 'assistant']);
    expect(h[1].tool_calls?.[0].id).toBe('c1');
    expect(h[2]).toMatchObject({ role: 'tool', tool_call_id: 'c1' });
  });
  it('descarta lo que quedó huérfano al cortar el historial y arranca con un mensaje de la persona', () => {
    const filas = [resultado('c0'), asistente('suelto'), user('hola'), asistente('chau')];
    expect(armarHistorial(filas).map((m) => m.role)).toEqual(['user', 'assistant']);
    // corte de 3: queda [resultado, asistente(tools sin resultado)…]
    const h = armarHistorial([user('a'), conTools('c1'), resultado('c1'), asistente('ok'), user('b')], 3);
    expect(h[0].role).toBe('user');
  });
  it('ignora filas ilegibles y resultados cuyo id no coincide', () => {
    const h = armarHistorial([user('hola'), { rol: 'tool', contenido: 'no es json' }, conTools('c1'), resultado('otro'), resultado('c1')]);
    expect(h.filter((m) => m.role === 'tool')).toHaveLength(1);
  });
  it('descarta un turno a medias: llamadas sin su resultado (error o corte) no pueden romper el historial', () => {
    const h = armarHistorial([user('hola'), conTools('c1'), user('seguimos'), asistente('ok')]);
    expect(h.map((m) => m.role)).toEqual(['user', 'user', 'assistant']);
    const dos: FilaMensaje = { rol: 'assistant', contenido: codificarAsistenteConHerramientas(null, [llamada('a'), llamada('b')]) };
    expect(armarHistorial([user('x'), dos, resultado('a'), user('y')]).map((m) => m.role)).toEqual(['user', 'user']);
    expect(armarHistorial([user('x'), dos, resultado('a'), resultado('b'), user('y')]).map((m) => m.role)).toEqual(['user', 'assistant', 'tool', 'tool', 'user']);
  });
  it('no mezcla: una respuesta normal limpia las llamadas pendientes', () => {
    const h = armarHistorial([user('a'), conTools('c1'), asistente('sin resultado'), resultado('c1')]);
    expect(h.filter((m) => m.role === 'tool')).toHaveLength(0);
  });
});

describe('estadoPropuestaSemana (compuerta de confirmación)', () => {
  const propuesta = (hash: string) => resultado('p1', 'armar_semana', { ok: true, estado: 'propuesta', propuesta_hash: hash });
  it('sin propuesta no hay nada que confirmar', () => {
    expect(estadoPropuestaSemana([user('hola')])).toEqual({ hashMostrado: null, hayRespuestaPosterior: false });
  });
  it('con propuesta pero sin respuesta de la persona después, no hay "sí"', () => {
    expect(estadoPropuestaSemana([user('armá mi semana'), conTools('p1'), propuesta('abc')])).toEqual({ hashMostrado: 'abc', hayRespuestaPosterior: false });
    expect(estadoPropuestaSemana([user('armá mi semana'), conTools('p1'), propuesta('abc'), asistente('¿Te gusta?')]).hayRespuestaPosterior).toBe(false);
  });
  it('con un sí de la persona después de la propuesta, sí', () => {
    expect(estadoPropuestaSemana([user('armá'), conTools('p1'), propuesta('abc'), asistente('¿Te gusta?'), user('sí')])).toEqual({ hashMostrado: 'abc', hayRespuestaPosterior: true });
    expect(estadoPropuestaSemana([user('armá'), conTools('p1'), propuesta('abc'), user('Sí, guardala.')]).hayRespuestaPosterior).toBe(true);
  });
  it('un mensaje que no es un sí (cambiar, no, otra cosa) no habilita guardar', () => {
    for (const t of ['cambiá el lunes', 'no', 'quiero cambiar algo de esa propuesta', 'sí, pero mové el jueves', 'qué hora es']) {
      expect(estadoPropuestaSemana([propuesta('abc'), user(t)]).hayRespuestaPosterior).toBe(false);
    }
  });
  it('vale el ÚLTIMO mensaje: un sí viejo seguido de un cambio no alcanza', () => {
    expect(estadoPropuestaSemana([propuesta('abc'), user('sí'), user('mejor cambiá algo')]).hayRespuestaPosterior).toBe(false);
  });
  it('usa la última propuesta mostrada', () => {
    const r = estadoPropuestaSemana([propuesta('uno'), user('cambiá algo'), propuesta('dos')]);
    expect(r).toEqual({ hashMostrado: 'dos', hayRespuestaPosterior: false });
  });
  it('ignora resultados de error o de otra herramienta', () => {
    expect(estadoPropuestaSemana([resultado('x', 'armar_semana', { ok: false, error: 'x' }), resultado('y', 'crear_objetivo', { ok: true, estado: 'propuesta', propuesta_hash: 'zz' })]).hashMostrado).toBeNull();
  });
});

describe('mensajesVisibles', () => {
  it('muestra solo lo que la persona debe ver', () => {
    const v = mensajesVisibles([user('hola'), conTools('c1', 'Dame un segundo'), resultado('c1'), conTools('c2'), asistente('Listo')]);
    expect(v).toEqual([{ rol: 'user', contenido: 'hola' }, { rol: 'assistant', contenido: 'Dame un segundo' }, { rol: 'assistant', contenido: 'Listo' }]);
  });
});

describe('esAfirmativo', () => {
  it('reconoce sí claros y rechaza dudas', () => {
    for (const x of ['sí', 'Si!', 'dale', 'Sí, guardala.', 'ok', 'perfecto', 'guardala']) expect(esAfirmativo(x)).toBe(true);
    for (const x of ['no', 'no sé', 'sí pero cambiá', '', 'mejor mañana', 'a'.repeat(100)]) expect(esAfirmativo(x)).toBe(false);
  });
});
