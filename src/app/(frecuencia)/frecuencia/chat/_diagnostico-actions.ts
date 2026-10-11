'use server';

import { getCurrentUserContext } from '@/lib/current-user';
import { getModelosIA } from '@/lib/frecuencia-kb';
import { chatCompletion, ErrorIA } from '@/lib/frecuencia/ia/nvidia';

/** Prueba real contra NVIDIA con un pedido mínimo. Solo admin. Devuelve el motivo exacto si falla (sin datos sensibles). */
export async function probarNvidia(): Promise<{ ok: boolean; detalle: string }> {
  const ctx = await getCurrentUserContext();
  if (!ctx?.isAdmin) return { ok: false, detalle: 'Solo para quien administra.' };
  const modelos = await getModelosIA();
  const modelo = modelos.chat.find((m) => m.por_defecto) ?? modelos.chat[0];
  if (!modelo) return { ok: false, detalle: 'No hay modelos de chat cargados en la base (falta el SQL 0082).' };
  try {
    const r = await chatCompletion({ modelo: modelo.id, mensajes: [{ role: 'user', content: 'Respondé solo: ok' }], maxTokens: 10 });
    return { ok: true, detalle: `NVIDIA respondió con ${modelo.nombre}: "${String(r.content ?? '').slice(0, 40)}"` };
  } catch (e) {
    if (e instanceof ErrorIA) return { ok: false, detalle: `${e.codigo}: ${e.message}` };
    return { ok: false, detalle: 'Error inesperado al llamar a NVIDIA.' };
  }
}
