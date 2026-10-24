/**
 * DEMO PROVIDUS — qué pasa cuando entra un lead: se asigna al vendedor de la zona y, si
 * corresponde, el agente de IA llama al CLIENTE y se le manda la plantilla de WhatsApp. Las dos cosas
 * corren a la vez. Corre DESPUÉS de guardar el registro y nunca puede romper el alta: cualquier error se
 * registra y el lead queda guardado igual (sin asignar, o asignado sin llamada ni mensaje).
 * Si todavía no se corrieron las migraciones 0089 / 0091, esa parte no hace nada.
 */

import { elegirVendedor, type VendedorZona } from './asignacion';
import { iniciarLlamada } from './llamada-ia';
import { columnaFaltante, tablaFaltante } from './errores-base';
import { CONFIG_POR_DEFECTO, elegirInstancia, enviarTexto, renderPlantilla, type ConfigWhatsapp, type InstanciaEvolution } from './whatsapp';

export interface LeadNuevo {
  id: string;
  nombre: string;
  apellido: string;
  telefono_e164: string;
  provincia: string;
  localidad: string | null;
  promotora: string | null;
  evento: string | null;
  /** El cliente autorizó en el stand que lo contacten por teléfono y WhatsApp. Sin esto no se llama ni se escribe. */
  consentimiento: boolean;
}

export interface ResultadoFlujo {
  vendedor: string | null;
  llamada: string;
  whatsapp: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Elige al vendedor de la zona y deja el lead asignado. Devuelve null si no hay (o si todavía no existe la tabla). */
async function asignar(admin: any, lead: LeadNuevo): Promise<VendedorZona | null> {
  const { data, error } = await admin
    .from('demo_providus_vendedores')
    .select('id, nombre, apellido, telefono_e164, provincias, recibe_resto, llamar_ia, activo, ultima_asignacion')
    .eq('activo', true);
  if (error) {
    if (!tablaFaltante(error)) console.error('[demo-providus] vendedores', error.code, error.message);
    return null;
  }
  const vendedor = elegirVendedor((data ?? []) as VendedorZona[], lead.provincia);
  if (!vendedor) return null;

  const ahora = new Date().toISOString();
  const { error: ea } = await admin
    .from('demo_providus_registros')
    .update({ vendedor_id: vendedor.id, vendedor_nombre: `${vendedor.nombre} ${vendedor.apellido}`.trim(), asignado_en: ahora })
    .eq('id', lead.id);
  if (ea) {
    console.error('[demo-providus] no se pudo asignar', ea.code, ea.message);
    return null;
  }
  await admin.from('demo_providus_vendedores').update({ ultima_asignacion: ahora }).eq('id', vendedor.id);
  return vendedor;
}

/** El asistente de voz llama al cliente. */
async function llamarAlCliente(admin: any, lead: LeadNuevo, vendedor: VendedorZona): Promise<string> {
  if (!vendedor.llamar_ia) return 'omitida';
  if (!lead.consentimiento) return 'sin_consentimiento';

  // Reserva la llamada: solo una vez por lead (si dos pedidos corren a la vez, gana uno).
  const ahora = new Date().toISOString();
  const { data: reservado } = await admin
    .from('demo_providus_registros')
    .update({ llamada_estado: 'llamando', llamada_en: ahora })
    .eq('id', lead.id)
    .eq('llamada_estado', 'pendiente')
    .select('id')
    .maybeSingle();
  if (!reservado) return 'ya_pedida';

  const r = await iniciarLlamada({
    vendedor: { nombre: vendedor.nombre },
    cliente: { nombre: lead.nombre, apellido: lead.apellido, telefono_e164: lead.telefono_e164, provincia: lead.provincia, localidad: lead.localidad },
    promotora: lead.promotora,
    evento: lead.evento,
  });
  await admin
    .from('demo_providus_registros')
    .update({
      llamada_estado: r.estado,
      llamada_ref: r.estado === 'llamando' ? r.ref : null,
      llamada_error: r.estado === 'llamando' ? null : r.error,
    })
    .eq('id', lead.id);
  if (r.estado === 'fallida') console.error('[demo-providus] llamada de IA fallida:', r.error);
  return r.estado;
}

/** Le manda al cliente la plantilla de WhatsApp (si está activada y hay un WhatsApp conectado). */
async function whatsappAlCliente(admin: any, lead: LeadNuevo, vendedorNombre: string | null): Promise<string> {
  if (!lead.consentimiento) return 'sin_consentimiento';
  const { data: fila, error: ec } = await admin.from('demo_providus_config').select('valor').eq('clave', 'whatsapp_plantilla').maybeSingle();
  if (ec) {
    if (!tablaFaltante(ec)) console.error('[demo-providus] config de WhatsApp', ec.code, ec.message);
    return 'omitido';
  }
  const cfg: ConfigWhatsapp = { ...CONFIG_POR_DEFECTO, ...((fila?.valor as Partial<ConfigWhatsapp> | undefined) ?? {}) };
  if (!cfg.activa) return 'omitido';

  const { data: instancias, error: ei } = await admin.from('evolution_instances').select('id, name, instance_key, api_url, api_token, status, phone_number');
  if (ei) {
    console.error('[demo-providus] instancias de WhatsApp', ei.code, ei.message);
    return 'omitido';
  }
  const instancia = elegirInstancia((instancias ?? []) as InstanciaEvolution[], cfg.instancia_id);
  const marcar = (cambios: Record<string, unknown>) => admin.from('demo_providus_registros').update(cambios).eq('id', lead.id);
  if (!instancia) {
    await marcar({ whatsapp_estado: 'omitido', whatsapp_error: 'No hay un WhatsApp conectado para enviar.', whatsapp_en: new Date().toISOString() });
    return 'omitido';
  }

  // Reserva el envío: un solo mensaje por lead.
  const { data: reservado, error: er } = await admin
    .from('demo_providus_registros')
    .update({ whatsapp_estado: 'enviando', whatsapp_en: new Date().toISOString() })
    .eq('id', lead.id)
    .is('whatsapp_estado', null)
    .select('id')
    .maybeSingle();
  if (er) {
    if (!columnaFaltante(er)) console.error('[demo-providus] reserva de WhatsApp', er.code, er.message);
    return 'omitido';
  }
  if (!reservado) return 'ya_enviado';

  const texto = renderPlantilla(cfg.texto, { nombre: lead.nombre, apellido: lead.apellido, vendedor: vendedorNombre ?? 'nuestro equipo', promotora: lead.promotora, evento: lead.evento });
  const r = await enviarTexto(instancia, lead.telefono_e164, texto);
  await marcar({ whatsapp_estado: r.estado, whatsapp_error: r.estado === 'enviado' ? null : r.error });
  if (r.estado === 'fallido') console.error('[demo-providus] WhatsApp fallido:', r.error);
  return r.estado;
}

export async function asignarYAvisar(admin: any, lead: LeadNuevo): Promise<ResultadoFlujo> {
  try {
    const vendedor = await asignar(admin, lead);
    const [llamada, whatsapp] = await Promise.all([
      vendedor ? llamarAlCliente(admin, lead, vendedor).catch((e) => { console.error('[demo-providus] llamada falló', e instanceof Error ? e.message : e); return 'error'; }) : Promise.resolve('omitida'),
      whatsappAlCliente(admin, lead, vendedor ? vendedor.nombre : null).catch((e) => { console.error('[demo-providus] WhatsApp falló', e instanceof Error ? e.message : e); return 'error'; }),
    ]);
    return { vendedor: vendedor?.id ?? null, llamada, whatsapp };
  } catch (e) {
    console.error('[demo-providus] asignación falló', e instanceof Error ? e.message : e);
    return { vendedor: null, llamada: 'error', whatsapp: 'error' };
  }
}
