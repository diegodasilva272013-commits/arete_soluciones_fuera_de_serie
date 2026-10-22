import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asignarYAvisar, type LeadNuevo } from './flujo';

// Base falsa en memoria: solo lo que usa flujo.ts (select / update / eq / maybeSingle).
/* eslint-disable @typescript-eslint/no-explicit-any */
function baseFalsa(estado: { vendedores: any[]; registros: any[] }, errorVendedores?: { code: string; message: string }) {
  return {
    from(tabla: string) {
      const filas = tabla === 'demo_providus_vendedores' ? estado.vendedores : estado.registros;
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
const lead: LeadNuevo = { id: 'r1', nombre: 'Marcos', apellido: 'Aguirre', telefono_e164: '+5493415001234', provincia: 'Santa Fe', localidad: 'Rosario', promotora: 'Laura Pérez', evento: 'Expo' };
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
  it('asigna al vendedor de la zona y le pide la llamada al asistente', async () => {
    configurar();
    const est = { vendedores: [vendedor()], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toEqual({ vendedor: 'v1', llamada: 'llamando' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', vendedor_nombre: 'Diego Da Silva', llamada_estado: 'llamando', llamada_ref: 'conv_1', llamada_error: null });
    expect(est.vendedores[0].ultima_asignacion).toBeTruthy();
    expect(fetchFalso).toHaveBeenCalledTimes(1);
    const cuerpo = JSON.parse((fetchFalso.mock.calls[0][1] as RequestInit).body as string);
    expect(cuerpo.to_number).toBe('+5493454100816'); // llama al VENDEDOR, no al cliente
    expect(cuerpo.conversation_initiation_client_data.dynamic_variables.cliente_nombre).toBe('Marcos');
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
    expect(r).toEqual({ vendedor: 'v1', llamada: 'omitida' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'omitida' });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('si ElevenLabs falla, el lead queda asignado, la llamada fallida y no se lanza ningún error', async () => {
    configurar();
    fetchFalso.mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'sin saldo' }), { status: 402 }));
    const est = { vendedores: [vendedor()], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toEqual({ vendedor: 'v1', llamada: 'fallida' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'fallida' });
    expect(String(est.registros[0].llamada_error)).toContain('sin saldo');
  });

  it('si el vendedor tiene la llamada de IA apagada, no llama', async () => {
    configurar();
    const est = { vendedores: [vendedor({ llamar_ia: false })], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toEqual({ vendedor: 'v1', llamada: 'omitida' });
    expect(est.registros[0]).toMatchObject({ vendedor_id: 'v1', llamada_estado: 'pendiente' });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('si no hay vendedor para la provincia, el lead queda sin asignar y no llama a nadie', async () => {
    configurar();
    const est = { vendedores: [vendedor({ provincias: ['Córdoba'] })], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est), lead);
    expect(r).toEqual({ vendedor: null, llamada: 'omitida' });
    expect(est.registros[0]).not.toHaveProperty('vendedor_id');
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('antes de correr la migración 0089 no hace nada ni rompe el alta', async () => {
    configurar();
    const est = { vendedores: [], registros: [registro()] };
    const r = await asignarYAvisar(baseFalsa(est, { code: '42P01', message: 'relation "demo_providus_vendedores" does not exist' }), lead);
    expect(r).toEqual({ vendedor: null, llamada: 'omitida' });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('un error inesperado de la base se traga y devuelve sin asignar', async () => {
    const rota = { from: () => { throw new Error('se cayó la base'); } };
    await expect(asignarYAvisar(rota, lead)).resolves.toEqual({ vendedor: null, llamada: 'error' });
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
