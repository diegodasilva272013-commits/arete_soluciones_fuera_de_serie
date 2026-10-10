import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { fechaLocal, fechaMasDias } from '@/lib/frecuencia-fecha';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { EspejoCliente, type EntradaEspejo } from './_espejo-cliente';

export default async function EspejoPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();
  const { data: pref } = await (supabase as any).from('frecuencia_preferencias').select('timezone').eq('user_id', ctx.userId).maybeSingle();
  const timezone = (pref?.timezone as string | undefined) ?? 'America/Argentina/Buenos_Aires';
  const hoy = fechaLocal(timezone);
  const ayer = fechaMasDias(hoy, -1);

  // Íntimo: solo el dueño lo lee (RLS). Las últimas 40 entradas con algún texto.
  const { data: filas } = await (supabase as any)
    .from('frecuencia_espejo')
    .select('id, fecha, momento, como_me_veo, como_me_percibo, como_me_siento, foto_storage_path, created_at')
    .eq('user_id', ctx.userId)
    .or('como_me_veo.not.is.null,como_me_percibo.not.is.null,como_me_siento.not.is.null')
    .order('created_at', { ascending: false })
    .limit(40);

  const todas = (filas ?? []) as any[];
  // La ropa que se dejó elegida anoche (Cierre del día) o la de hoy.
  const { data: filaRopa } = await (supabase as any)
    .from('frecuencia_espejo')
    .select('vestimenta_manana')
    .eq('user_id', ctx.userId)
    .not('vestimenta_manana', 'is', null)
    .in('fecha', [ayer, hoy])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const ropa: string | null = filaRopa?.vestimenta_manana ?? null;

  const conTexto = todas.filter((f) => f.como_me_veo || f.como_me_percibo || f.como_me_siento);
  // Una sola llamada para firmar todas las fotos (válidas 1 h).
  const rutas = conTexto.map((f) => f.foto_storage_path).filter(Boolean) as string[];
  const firmadas = new Map<string, string>();
  if (rutas.length) {
    const { data } = await supabase.storage.from('frecuencia-imagenes').createSignedUrls(rutas, 3600);
    for (const f of data ?? []) if (f.path && f.signedUrl) firmadas.set(f.path, f.signedUrl);
  }
  const entradas: EntradaEspejo[] = conTexto.map((f) => ({
    id: f.id,
    fecha: f.fecha,
    momento: f.momento,
    comoMeVeo: f.como_me_veo,
    comoMePercibo: f.como_me_percibo,
    comoMeSiento: f.como_me_siento,
    fotoUrl: f.foto_storage_path ? firmadas.get(f.foto_storage_path) ?? null : null,
  }));

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.espejo.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.espejo.titulo}</h1>
      <p className={base.subtitulo}>{copy.espejo.subtitulo}</p>

      <EspejoCliente ropa={ropa} entradas={entradas} />
    </div>
  );
}
