/**
 * Frecuencia — historial del chat (5.4): cómo se guardan y se reconstruyen
 * los mensajes en frecuencia_mensajes (rol, contenido). Puro: sin base de datos.
 *
 * - Mensajes de la persona y respuestas normales: rol user/assistant, contenido = el texto.
 * - Una respuesta del asistente que llama herramientas: rol assistant, contenido =
 *   "\u0001TOOL_CALLS\u0001" + JSON de { texto, tool_calls }.
 * - El resultado de una herramienta: rol tool, contenido = JSON { tool_call_id, name, resultado }.
 */

import type { LlamadaHerramienta, MensajeChat } from './nvidia';

const MARCA = '\u0001TOOL_CALLS\u0001';

export interface FilaMensaje {
  rol: 'user' | 'assistant' | 'system' | 'tool';
  contenido: string;
  created_at?: string;
}

export function codificarAsistenteConHerramientas(texto: string | null, llamadas: LlamadaHerramienta[]): string {
  return MARCA + JSON.stringify({ texto, tool_calls: llamadas });
}
export function codificarResultado(toolCallId: string, name: string, resultado: unknown): string {
  return JSON.stringify({ tool_call_id: toolCallId, name, resultado });
}

const MAX_RESULTADO = 4000;

function decodificar(f: FilaMensaje): MensajeChat | null {
  if (f.rol === 'user') return { role: 'user', content: f.contenido };
  if (f.rol === 'assistant') {
    if (f.contenido.startsWith(MARCA)) {
      try {
        const d = JSON.parse(f.contenido.slice(MARCA.length)) as { texto: string | null; tool_calls: LlamadaHerramienta[] };
        if (!Array.isArray(d.tool_calls) || !d.tool_calls.length) return null;
        return { role: 'assistant', content: d.texto ?? null, tool_calls: d.tool_calls };
      } catch {
        return null;
      }
    }
    return { role: 'assistant', content: f.contenido };
  }
  if (f.rol === 'tool') {
    try {
      const d = JSON.parse(f.contenido) as { tool_call_id: string; name: string; resultado: unknown };
      if (typeof d.tool_call_id !== 'string') return null;
      return { role: 'tool', tool_call_id: d.tool_call_id, name: d.name, content: JSON.stringify(d.resultado).slice(0, MAX_RESULTADO) };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Arma el historial que se le manda al modelo (los últimos `max` mensajes) cuidando
 * que sea válido: arranca con un mensaje de la persona y cada resultado de herramienta
 * tiene a su llamada justo antes (si el corte dejó huérfanos, se descartan).
 */
export function armarHistorial(filas: FilaMensaje[], max = 30): MensajeChat[] {
  const decod = filas.slice(-max).map(decodificar).filter((m): m is MensajeChat => !!m);
  const res: MensajeChat[] = [];
  // Una llamada a herramientas es válida solo si TODAS sus llamadas tienen su resultado antes del
  // siguiente mensaje que no sea de herramienta. Si un turno quedó a medias (error, corte), se
  // descarta ese grupo entero: un historial inválido haría fallar cada mensaje siguiente.
  let grupo: { llamada: MensajeChat; ids: Set<string>; resultados: MensajeChat[] } | null = null;
  const cerrar = () => {
    if (grupo && grupo.ids.size === 0) res.push(grupo.llamada, ...grupo.resultados);
    grupo = null;
  };
  for (const m of decod) {
    if (m.role === 'tool') {
      if (grupo && m.tool_call_id && grupo.ids.has(m.tool_call_id)) {
        grupo.ids.delete(m.tool_call_id);
        grupo.resultados.push(m);
      }
      continue;
    }
    cerrar();
    if (!res.length && m.role !== 'user') continue; // el corte puede dejar respuestas sueltas al principio
    if (m.role === 'assistant' && m.tool_calls) grupo = { llamada: m, ids: new Set(m.tool_calls.map((c) => c.id)), resultados: [] };
    else res.push(m);
  }
  cerrar();
  return res;
}

/** ¿El mensaje de la persona es un sí claro? (y no un "sí, pero cambiá…" ni un "no"). */
export function esAfirmativo(texto: string): boolean {
  const t = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t || t.length > 60) return false;
  const palabras = t.split(' ');
  if (palabras.some((p) => ['no', 'cambia', 'cambiar', 'cambiemos', 'pero', 'mejor', 'todavia', 'espera', 'esperá'].includes(p))) return false;
  return /^(si|sii|dale|ok|okey|listo|perfecto|confirmo|confirmado|guardala|guardalo|de una|va|vamos|genial|buenisimo)\b/.test(t) || /\bguardala\b/.test(t);
}

/** Hash de la última propuesta de semana que se le mostró a la persona, y si ella respondió después. */
export function estadoPropuestaSemana(filas: FilaMensaje[]): { hashMostrado: string | null; hayRespuestaPosterior: boolean } {
  let indice = -1;
  let hash: string | null = null;
  filas.forEach((f, i) => {
    if (f.rol !== 'tool') return;
    try {
      const d = JSON.parse(f.contenido) as { name?: string; resultado?: { ok?: boolean; estado?: string; propuesta_hash?: string } };
      if (d.name === 'armar_semana' && d.resultado?.ok && d.resultado.estado === 'propuesta' && d.resultado.propuesta_hash) {
        indice = i;
        hash = d.resultado.propuesta_hash;
      }
    } catch {
      /* fila ilegible: se ignora */
    }
  });
  if (indice < 0) return { hashMostrado: null, hayRespuestaPosterior: false };
  // "Su sí": el ÚLTIMO mensaje de la persona después de la propuesta tiene que ser afirmativo.
  const mensajesPosteriores = filas.slice(indice + 1).filter((f) => f.rol === 'user');
  const ultimo = mensajesPosteriores[mensajesPosteriores.length - 1];
  return { hashMostrado: hash, hayRespuestaPosterior: !!ultimo && esAfirmativo(ultimo.contenido) };
}

/** Lo que se le muestra a la persona: solo sus mensajes y las respuestas con texto (sin la mecánica de herramientas). */
export function mensajesVisibles(filas: FilaMensaje[]): { rol: 'user' | 'assistant'; contenido: string }[] {
  const res: { rol: 'user' | 'assistant'; contenido: string }[] = [];
  for (const f of filas) {
    if (f.rol === 'user') res.push({ rol: 'user', contenido: f.contenido });
    else if (f.rol === 'assistant') {
      if (f.contenido.startsWith(MARCA)) {
        try {
          const d = JSON.parse(f.contenido.slice(MARCA.length)) as { texto: string | null };
          if (d.texto?.trim()) res.push({ rol: 'assistant', contenido: d.texto });
        } catch {
          /* ilegible */
        }
      } else res.push({ rol: 'assistant', contenido: f.contenido });
    }
  }
  return res;
}
