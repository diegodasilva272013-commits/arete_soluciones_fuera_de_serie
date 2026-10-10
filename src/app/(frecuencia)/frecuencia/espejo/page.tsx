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

  // Íntimo: solo el dueño lo lee (RLS). Se piden las últimas 40 entradas.
  const { data: filas } = await (supabase as any)
    .from('frecuencia_espejo')
    .select('id, fecha, momento, como_me_veo, como_me_percibo, como_me_siento, foto_storage_path, vestimenta_manana, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .limit(40);

  const todas = (filas ?? []) as any[];
  // La ropa que se dejó elegida anoche (Cierre del día) o la de hoy.
  const ropa = todas.find((f) => f.vestimenta_manana && (f.fecha === ayer || f.fecha === hoy))?.vestimenta_manana ?? null;

  const conTexto = todas.filter((f) => f.como_me_veo || f.como_me_percibo || f.como_me_siento);
  const entradas: EntradaEspejo[] = await Promise.all(
    conTexto.map(async (f) => {
      let fotoUrl: string | null = null;
      if (f.foto_storage_path) {
        const { data } = await supabase.storage.from('frecuencia-imagenes').createSignedUrl(f.foto_storage_path, 3600);
        fotoUrl = data?.signedUrl ?? null;
      }
      return {
        id: f.id,
        fecha: f.fecha,
        momento: f.momento,
        comoMeVeo: f.como_me_veo,
        comoMePercibo: f.como_me_percibo,
        comoMeSiento: f.como_me_siento,
        fotoUrl,
      };
    })
  );

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
