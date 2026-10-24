/**
 * DEMO PROVIDUS — envía UN WhatsApp de prueba con la plantilla al número que se indique. Solo administración.
 * Usa el texto que viene en el pedido (lo que se está editando en pantalla) o, si no viene, el guardado; y el
 * WhatsApp elegido o la primera instancia conectada. Con datos de ejemplo para las variables.
 */
import { NextResponse } from 'next/server';
import { esAdmin, permitirIntento, sesionActual } from '@/lib/demo-providus/sesion';
import { db, falla, ipDe } from '@/lib/demo-providus/datos';
import { normalizarTelefono } from '@/lib/demo-providus/telefono';
import { CONFIG_POR_DEFECTO, elegirInstancia, enviarTexto, renderPlantilla, validarPlantilla, type ConfigWhatsapp, type InstanciaEvolution } from '@/lib/demo-providus/whatsapp';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const txt = (v: unknown, max = 80): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: Request) {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  if (!permitirIntento(ipDe(req), 6)) return falla('limite', 429, 'Demasiados envíos de prueba seguidos. Esperá un minuto.');
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }

  const numero = normalizarTelefono(txt(b.numero, 40));
  if (!numero) return falla('numero', 422, 'El número no es válido. Escribilo con código de área, por ejemplo 345 4100816.');

  try {
    const admin = db();
    const [cfg, ins] = await Promise.all([
      admin.from('demo_providus_config').select('valor').eq('clave', 'whatsapp_plantilla').maybeSingle(),
      admin.from('evolution_instances').select('id, name, instance_key, api_url, api_token, status, phone_number'),
    ]);
    const guardada: ConfigWhatsapp = { ...CONFIG_POR_DEFECTO, ...((cfg.data?.valor as Partial<ConfigWhatsapp> | undefined) ?? {}) };
    const texto = typeof b.texto === 'string' && b.texto.trim() ? b.texto : guardada.texto;
    const errorTexto = validarPlantilla(texto);
    if (errorTexto) return falla('texto', 422, errorTexto);
    const instanciaId = typeof b.instancia_id === 'string' && b.instancia_id ? b.instancia_id : guardada.instancia_id;
    const instancia = elegirInstancia((ins.data ?? []) as InstanciaEvolution[], instanciaId);
    if (!instancia) return falla('instancia', 422, 'No hay ningún WhatsApp conectado para enviar. Conectá uno (con el QR) o elegí uno de la lista.');

    const mensaje = renderPlantilla(texto, { nombre: txt(b.nombre) || 'Carlos', apellido: 'Gómez', vendedor: txt(b.vendedor) || 'Paola', promotora: 'Laura Pérez', evento: 'Prueba de la plantilla' });
    const r = await enviarTexto(instancia, numero, mensaje);
    if (r.estado === 'fallido') console.error('[demo-providus] WhatsApp de prueba fallido:', r.error);
    return NextResponse.json({ ok: r.estado === 'enviado', estado: r.estado, detalle: r.estado === 'enviado' ? null : r.error, enviado_a: numero, desde: instancia.phone_number ?? instancia.name, texto: mensaje });
  } catch (e) {
    console.error('[demo-providus] whatsapp probar', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'No se pudo enviar el mensaje de prueba.');
  }
}
