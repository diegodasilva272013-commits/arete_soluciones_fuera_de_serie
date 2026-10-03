import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { enviarZoomMasivo, enviarAnuncioMasivo, zoomUrl } from '@/lib/fds-temporada-email';
import { TEMPORADA_SLUG } from '@/app/fuera-de-serie/temporada-1/_data';

/**
 * Manda el link de Zoom a todos los inscriptos de la Temporada 1 que
 * todavía no lo recibieron y los marca como enviados.
 * Lo usan el cron diario y el botón de /admin/temporada-1.
 */
export async function enviarZoomPendientes(url: string = zoomUrl()) {
  const admin = createSupabaseAdminClient() as any;

  const { data: filas, error } = await admin
    .from('fds_temporada_registros')
    .select('id, nombre, email')
    .eq('temporada', TEMPORADA_SLUG)
    .is('zoom_enviado_at', null)
    .order('created_at', { ascending: true })
    .limit(1000);
  if (error) throw new Error(error.message);

  const pendientes = (filas ?? []) as { id: string; nombre: string; email: string }[];
  if (pendientes.length === 0) return { enviados: 0, fallidos: 0, pendientes: 0 };

  const ok = new Set(await enviarZoomMasivo(pendientes, url));
  const ids = pendientes.filter((p) => ok.has(p.email)).map((p) => p.id);
  if (ids.length) {
    await admin
      .from('fds_temporada_registros')
      .update({ zoom_enviado_at: new Date().toISOString() })
      .in('id', ids);
  }

  return {
    enviados: ids.length,
    fallidos: pendientes.length - ids.length,
    pendientes: pendientes.length - ids.length,
  };
}

/**
 * Manda un anuncio con un link (el de la próxima clase, por ejemplo) a
 * TODOS los inscriptos de la temporada, ya hayan recibido algo antes o
 * no — a diferencia de enviarZoomPendientes, que solo manda a los que
 * nunca recibieron nada. Pensado para usarlo día a día según vayan
 * cambiando los links de las clases.
 */
export async function enviarAnuncioATodos(opts: { asunto: string; intro: string; url: string }) {
  const admin = createSupabaseAdminClient() as any;

  const { data: filas, error } = await admin
    .from('fds_temporada_registros')
    .select('id, nombre, email')
    .eq('temporada', TEMPORADA_SLUG)
    .order('created_at', { ascending: true })
    .limit(2000);
  if (error) throw new Error(error.message);

  const inscriptos = (filas ?? []) as { id: string; nombre: string; email: string }[];
  if (inscriptos.length === 0) return { enviados: 0, fallidos: 0, total: 0 };

  const ok = new Set(await enviarAnuncioMasivo(inscriptos, opts));

  return {
    enviados: ok.size,
    fallidos: inscriptos.length - ok.size,
    total: inscriptos.length,
  };
}
