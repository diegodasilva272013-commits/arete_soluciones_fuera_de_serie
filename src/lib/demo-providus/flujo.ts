/**
 * DEMO PROVIDUS — qué pasa cuando entra un lead: se asigna al vendedor de la zona y, si
 * corresponde, el agente de IA llama al CLIENTE. Corre DESPUÉS de guardar el registro y
 * nunca puede romper el alta: cualquier error se registra y el lead queda guardado igual
 * (sin asignar, o asignado sin llamada). Si todavía no se corrió la migración 0089, no hace nada.
 */

import { elegirVendedor, type VendedorZona } from './asignacion';
import { iniciarLlamada } from './llamada-ia';
import { tablaFaltante } from './errores-base';

export interface LeadNuevo {
  id: string;
  nombre: string;
  apellido: string;
  telefono_e164: string;
  provincia: string;
  localidad: string | null;
  promotora: string | null;
  evento: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function asignarYAvisar(admin: any, lead: LeadNuevo): Promise<{ vendedor: string | null; llamada: string }> {
  try {
    const { data, error } = await admin
      .from('demo_providus_vendedores')
      .select('id, nombre, apellido, telefono_e164, provincias, recibe_resto, llamar_ia, activo, ultima_asignacion')
      .eq('activo', true);
    if (error) {
      if (!tablaFaltante(error)) console.error('[demo-providus] vendedores', error.code, error.message);
      return { vendedor: null, llamada: 'omitida' };
    }
    const vendedor = elegirVendedor((data ?? []) as VendedorZona[], lead.provincia);
    if (!vendedor) return { vendedor: null, llamada: 'omitida' };

    const ahora = new Date().toISOString();
    const { error: ea } = await admin
      .from('demo_providus_registros')
      .update({ vendedor_id: vendedor.id, vendedor_nombre: `${vendedor.nombre} ${vendedor.apellido}`.trim(), asignado_en: ahora })
      .eq('id', lead.id);
    if (ea) {
      console.error('[demo-providus] no se pudo asignar', ea.code, ea.message);
      return { vendedor: null, llamada: 'omitida' };
    }
    await admin.from('demo_providus_vendedores').update({ ultima_asignacion: ahora }).eq('id', vendedor.id);

    if (!vendedor.llamar_ia) return { vendedor: vendedor.id, llamada: 'omitida' };

    // Reserva la llamada: solo una vez por lead (si dos pedidos corren a la vez, gana uno).
    const { data: reservado } = await admin
      .from('demo_providus_registros')
      .update({ llamada_estado: 'llamando', llamada_en: ahora })
      .eq('id', lead.id)
      .eq('llamada_estado', 'pendiente')
      .select('id')
      .maybeSingle();
    if (!reservado) return { vendedor: vendedor.id, llamada: 'ya_pedida' };

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
    return { vendedor: vendedor.id, llamada: r.estado };
  } catch (e) {
    console.error('[demo-providus] asignación falló', e instanceof Error ? e.message : e);
    return { vendedor: null, llamada: 'error' };
  }
}
