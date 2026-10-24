import { describe, expect, it } from 'vitest';
import { esFinal, interpretarConversacion } from './resultado-llamada';

const conv = (status: string, extra: Record<string, unknown> = {}, resultado?: string) => ({
  status,
  metadata: { call_duration_secs: 42, phone_call: resultado ? { type: 'twilio', call_result: resultado } : { type: 'twilio' }, ...extra },
  analysis: { transcript_summary: 'El cliente quiere saber el precio.' },
  transcript: [{ role: 'agent', message: 'Hola Diego' }, { role: 'user', message: 'Hola, sí' }],
});

describe('resultado de la llamada del asistente', () => {
  it('mientras la conversación está en curso, sigue "llamando"', () => {
    expect(interpretarConversacion(conv('initiated')).estado).toBe('llamando');
    expect(interpretarConversacion(conv('in-progress')).estado).toBe('llamando');
    expect(interpretarConversacion(conv('processing')).estado).toBe('llamando'); // sin call_result todavía
  });
  it('atendida: trae la duración y el resumen', () => {
    const r = interpretarConversacion(conv('done', {}, 'answered'));
    expect(r).toEqual({ estado: 'atendida', segundos: 42, resumen: 'El cliente quiere saber el precio.', detalle: null });
  });
  it('si ya cortó pero falta el análisis, usa el resultado que ya se sabe', () => {
    expect(interpretarConversacion(conv('processing', {}, 'no_answer')).estado).toBe('no_atendio');
  });
  it('buzón, ocupado y no atendió se distinguen, y no llevan resumen', () => {
    expect(interpretarConversacion(conv('done', {}, 'voicemail'))).toMatchObject({ estado: 'buzon', resumen: null });
    expect(interpretarConversacion(conv('done', {}, 'busy')).estado).toBe('ocupado');
    expect(interpretarConversacion(conv('done', {}, 'no_answer')).estado).toBe('no_atendio');
  });
  it('failed: queda fallida con el motivo', () => {
    const r = interpretarConversacion(conv('failed', { error: { code: 1, reason: 'número inválido' }, termination_reason: 'twilio' }));
    expect(r.estado).toBe('fallida');
    expect(r.detalle).toContain('número inválido');
  });
  it('sin call_result se deduce por lo que dijo el cliente', () => {
    expect(interpretarConversacion(conv('done')).estado).toBe('atendida');
    const mudo = { status: 'done', metadata: { call_duration_secs: 6, phone_call: { type: 'twilio' } }, transcript: [{ role: 'agent', message: 'Hola' }] };
    expect(interpretarConversacion(mudo).estado).toBe('no_atendio');
  });
  it('no se rompe con respuestas raras', () => {
    expect(interpretarConversacion(null).estado).toBe('no_atendio');
    expect(interpretarConversacion({}).estado).toBe('no_atendio');
  });
  it('esFinal distingue lo que ya terminó', () => {
    expect(esFinal('llamando')).toBe(false);
    expect(esFinal('pendiente')).toBe(false);
    expect(esFinal(null)).toBe(false);
    expect(esFinal('atendida')).toBe(true);
    expect(esFinal('omitida')).toBe(true);
  });
});
