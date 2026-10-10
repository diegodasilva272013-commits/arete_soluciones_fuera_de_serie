/**
 * Capa ÚNICA de herramientas — ejecución (5.2). Nada de lógica propia: cada
 * herramienta llama a las MISMAS acciones de servidor que usa la interfaz
 * (cliente de sesión de la persona, RLS real; nunca service role). Las usan
 * el chat de texto y el agente de voz; no existe otra puerta de entrada.
 */

import { lunesDeLaSemana, horaEnTimezoneAUtc, fechaMasDias } from '@/lib/frecuencia-fecha';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { agregarEvidenciaManual, confirmarSemana, crearObjetivoNuevo, crearTarea, guardarCriterio, proponerSemana, salirAlAire } from '../actions';
import {
  parsearArgumentos,
  validarArmarSemana,
  validarCrearObjetivo,
  validarCrearTarea,
  validarEscribirCriterio,
  validarIniciarBloque,
  validarRegistrarEvidencia,
  NOMBRES_HERRAMIENTAS,
} from '@/lib/frecuencia/ia/herramientas-def';

export type ResultadoHerramienta = { ok: true; [clave: string]: unknown } | { ok: false; error: string };

export interface ContextoHerramientas {
  /** ¿En esta conversación ya se le MOSTRÓ a la persona una propuesta de semana? Sin eso no se puede confirmar. */
  semanaPropuestaEnConversacion: boolean;
}

const sinAcceso = (msg = 'No se pudo hacer eso. Probá de nuevo.'): ResultadoHerramienta => ({ ok: false, error: msg });

export async function ejecutarHerramienta(nombre: string, argumentosCrudos: string | undefined | null, ctx: ContextoHerramientas): Promise<ResultadoHerramienta> {
  if (!(NOMBRES_HERRAMIENTAS as readonly string[]).includes(nombre)) return { ok: false, error: `Herramienta desconocida: ${nombre}.` };
  const args = parsearArgumentos(argumentosCrudos);
  if (args === null) return { ok: false, error: 'Los argumentos no son un JSON válido.' };

  switch (nombre) {
    case 'crear_objetivo': {
      const v = validarCrearObjetivo(args);
      if (!v.ok) return v;
      const r = await crearObjetivoNuevo(v.datos);
      return r.error ? sinAcceso() : { ok: true, objetivo_id: r.id, titulo: v.datos.titulo };
    }
    case 'crear_tarea': {
      const v = validarCrearTarea(args);
      if (!v.ok) return v;
      const supabase = createSupabaseServerClient();
      // La tarea tiene que colgar de un objetivo de ESTA persona (RLS lo garantiza; acá se da un error claro).
      const { data: obj } = await (supabase as any).from('frecuencia_objetivos').select('id').eq('id', v.datos.objetivoId).maybeSingle();
      if (!obj) return { ok: false, error: 'Ese objetivo no existe.' };
      const r = await crearTarea({
        objetivoId: v.datos.objetivoId,
        titulo: v.datos.titulo,
        protocolo: v.datos.protocolo,
        tipoEnergia: v.datos.tipoEnergia,
        duracionMin: v.datos.duracionMin,
        dosisActual: 1,
        dosisObjetivo: v.datos.dosisObjetivo,
        desbloquea: [],
      });
      return r.error ? sinAcceso() : { ok: true, tarea_id: r.id, titulo: v.datos.titulo };
    }
    case 'armar_semana': {
      const v = validarArmarSemana(args);
      if (!v.ok) return v;
      const propuesta = await proponerSemana();
      if (propuesta.error) return { ok: false, error: propuesta.error };
      if (!v.datos.confirmar) {
        return { ok: true, estado: 'propuesta', bloques: propuesta.bloques, mensaje: 'Mostrale esta propuesta a la persona y esperá su sí antes de guardar.' };
      }
      if (!ctx.semanaPropuestaEnConversacion) return { ok: false, error: 'Primero hay que proponerle la semana a la persona y esperar su sí.' };
      // Idempotente: si la semana ya tiene bloques de tareas, no se duplican.
      const supabase = createSupabaseServerClient();
      const { data: pref } = await (supabase as any).from('frecuencia_preferencias').select('timezone').maybeSingle();
      const tz = (pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';
      const lunes = lunesDeLaSemana(tz);
      const { count } = await (supabase as any)
        .from('frecuencia_bloques')
        .select('id', { count: 'exact', head: true })
        .not('tarea_id', 'is', null)
        .gte('inicio', horaEnTimezoneAUtc(lunes, '00:00', tz).toISOString())
        .lt('inicio', horaEnTimezoneAUtc(fechaMasDias(lunes, 7), '00:00', tz).toISOString());
      if ((count ?? 0) > 0) return { ok: false, error: 'Esta semana ya está armada.' };
      const r = await confirmarSemana(propuesta.bloques);
      return r.error ? sinAcceso() : { ok: true, estado: 'guardada', bloques: propuesta.bloques.length };
    }
    case 'iniciar_bloque': {
      const v = validarIniciarBloque(args);
      if (!v.ok) return v;
      const r = await salirAlAire(v.datos.bloqueId);
      if (r.ok) return { ok: true, estado: 'al_aire', titulo: r.titulo };
      if ('conflicto' in r && r.conflicto) return { ok: false, error: `Ya hay un bloque al aire: "${r.bloqueEnCursoTitulo}". Hay que terminarlo primero.` };
      return { ok: false, error: 'error' in r ? r.error : 'No se pudo empezar el bloque.' };
    }
    case 'registrar_evidencia': {
      const v = validarRegistrarEvidencia(args);
      if (!v.ok) return v;
      const r = await agregarEvidenciaManual(v.datos.texto);
      return r.error ? sinAcceso() : { ok: true };
    }
    case 'escribir_criterio': {
      const v = validarEscribirCriterio(args);
      if (!v.ok) return v;
      const r = await guardarCriterio({ ambito: 'personal', ...v.datos });
      return r.error ? { ok: false, error: r.error } : { ok: true, criterio_id: r.id };
    }
  }
  return { ok: false, error: 'Herramienta no implementada.' };
}
