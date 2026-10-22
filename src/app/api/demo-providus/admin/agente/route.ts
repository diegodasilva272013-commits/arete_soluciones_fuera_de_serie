/**
 * DEMO PROVIDUS — prueba del agente de voz (ElevenLabs + Twilio). Solo administración.
 *  GET   diagnóstico: ¿hay clave, agente y número cargados? ¿ElevenLabs los reconoce? Muestra el primer
 *        mensaje del agente y las variables que usa, para ver qué va a escuchar quien atienda.
 *  POST  hace UNA llamada real al número que se indique (como si fuera el cliente que dejó sus datos), con el
 *        nombre del cliente y del vendedor que se escriban, usando el mismo código que usa el sistema cuando entra un lead.
 * La clave nunca sale del servidor.
 */
import { NextResponse } from 'next/server';
import { esAdmin, permitirIntento, sesionActual } from '@/lib/demo-providus/sesion';
import { falla, ipDe } from '@/lib/demo-providus/datos';
import { normalizarTelefono } from '@/lib/demo-providus/telefono';
import { configIA, iniciarLlamada, variablesDelAgente, type DatosLlamada } from '@/lib/demo-providus/llamada-ia';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const txt = (v: unknown, max = 80): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function leer(path: string, apiKey: string) {
  try {
    const r = await fetch(`https://api.elevenlabs.io${path}`, { headers: { 'xi-api-key': apiKey }, cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    const cuerpo = await r.json().catch(() => null);
    return { status: r.status, cuerpo };
  } catch (e) {
    return { status: 0, cuerpo: { detail: e instanceof Error ? e.message : 'sin respuesta' } };
  }
}

const motivo = (c: { detail?: { message?: string } | string } | null) => (typeof c?.detail === 'string' ? c.detail : c?.detail?.message ?? 'sin detalle');

export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  const cfg = configIA();
  const hay = { clave: !!cfg, agente: !!process.env.ELEVENLABS_PROVIDUS_AGENT_ID, numero: !!process.env.ELEVENLABS_PHONE_NUMBER_ID };
  if (!cfg) {
    const faltan = [!hay.clave && 'la clave de ElevenLabs (ELEVENLABS_API_KEY)', !hay.agente && 'el ID del agente', !hay.numero && 'el ID del número'].filter(Boolean).join(', ');
    return NextResponse.json({ ok: true, listo: false, hay, detalle: `Falta cargar en Vercel: ${faltan}.` }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const [ag, num] = await Promise.all([leer(`/v1/convai/agents/${encodeURIComponent(cfg.agentId)}`, cfg.apiKey), leer(`/v1/convai/phone-numbers/${encodeURIComponent(cfg.phoneNumberId)}`, cfg.apiKey)]);
  const a = ag.cuerpo as { name?: string; conversation_config?: { agent?: { first_message?: string; language?: string } } } | null;
  const n = num.cuerpo as { phone_number?: string; label?: string; supports_outbound?: boolean; assigned_agent?: { agent_id?: string } } | null;
  const variables = ag.status === 200 ? Array.from(new Set(Array.from(JSON.stringify(ag.cuerpo).matchAll(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g)).map((m) => m[1]))).filter((v) => !v.startsWith('system__')) : [];
  const enviadas = Object.keys(variablesDelAgente({ vendedor: { nombre: '' }, cliente: { nombre: '', apellido: '', telefono_e164: '', provincia: '', localidad: null }, promotora: null, evento: null }));
  return NextResponse.json({
    ok: true,
    listo: ag.status === 200 && num.status === 200,
    hay,
    agente: ag.status === 200 ? { ok: true, nombre: a?.name ?? null, idioma: a?.conversation_config?.agent?.language ?? null, primer_mensaje: a?.conversation_config?.agent?.first_message ?? null, variables, sin_enviar: variables.filter((v) => !enviadas.includes(v)) } : { ok: false, status: ag.status, detalle: motivo(ag.cuerpo) },
    numero: num.status === 200 ? { ok: true, numero: n?.phone_number ?? null, etiqueta: n?.label ?? null, saliente: n?.supports_outbound ?? null, agente_asignado: n?.assigned_agent?.agent_id ?? null } : { ok: false, status: num.status, detalle: motivo(num.cuerpo) },
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  if (!permitirIntento(ipDe(req), 6)) return falla('limite', 429, 'Demasiadas llamadas de prueba seguidas. Esperá un minuto.');
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }

  // El número al que se llama es el del "cliente": es quien atiende el agente.
  const numero = normalizarTelefono(txt(b.numero, 40));
  if (!numero) return falla('numero', 422, 'El número no es válido. Escribilo con código de área, por ejemplo 345 4100816.');
  const nombre = txt(b.cliente_nombre);
  if (nombre.length < 2) return falla('cliente_nombre', 422, 'Escribí el nombre del cliente (mínimo 2 letras).');
  const vendedor = txt(b.vendedor_nombre);
  if (vendedor.length < 2) return falla('vendedor_nombre', 422, 'Escribí el nombre del vendedor (mínimo 2 letras).');

  const datos: DatosLlamada = {
    cliente: { nombre, apellido: txt(b.cliente_apellido), telefono_e164: numero, provincia: '', localidad: null },
    vendedor: { nombre: vendedor },
    promotora: null,
    evento: null,
  };
  const r = await iniciarLlamada(datos);
  if (r.estado === 'fallida') console.error('[demo-providus] llamada de prueba fallida:', r.error);
  return NextResponse.json({ ok: r.estado === 'llamando', estado: r.estado, ref: r.estado === 'llamando' ? r.ref : null, detalle: r.estado === 'llamando' ? null : r.error, llamado_a: numero, variables: variablesDelAgente(datos) });
}
