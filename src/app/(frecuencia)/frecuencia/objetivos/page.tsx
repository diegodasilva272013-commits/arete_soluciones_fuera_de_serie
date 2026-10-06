import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getAreasVida } from '@/lib/frecuencia-kb';
import type { FrecuenciaObjetivo } from '@/types/frecuencia';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';

export default async function ObjetivosPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();
  const areas = (await getAreasVida()) ?? [];
  const nombrePorArea = new Map(areas.map((a) => [a.key, a.nombre]));

  const { data: objetivos } = await (supabase as any)
    .from('frecuencia_objetivos')
    .select('id, titulo, area_key, fecha_limite, created_at')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: true });

  const lista = (objetivos ?? []) as Pick<FrecuenciaObjetivo, 'id' | 'titulo' | 'area_key' | 'fecha_limite' | 'created_at'>[];

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.objetivos.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.objetivos.titulo}</h1>
      <p className={base.subtitulo}>{copy.objetivos.subtitulo}</p>

      {lista.length === 0 ? (
        <p className={base.ayuda} style={{ marginTop: 28 }}>
          {copy.objetivos.vacio}
        </p>
      ) : (
        <div className={base.chipsFila} style={{ flexDirection: 'column', marginTop: 28, gap: 12 }}>
          {lista.map((obj) => (
            <Link key={obj.id} href={`/frecuencia/objetivos/${obj.id}`} className={base.panel} style={{ display: 'block', textDecoration: 'none' }}>
              <p style={{ fontFamily: 'var(--f-texto)', fontSize: 16, color: 'var(--hueso)', marginBottom: 6 }}>{obj.titulo}</p>
              <p className={base.ayuda} style={{ margin: 0 }}>
                {obj.area_key ? nombrePorArea.get(obj.area_key) ?? obj.area_key : ''}
                {obj.fecha_limite ? ` · ${obj.fecha_limite}` : ''}
                {' · '}
                {copy.objetivos.verTareas}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
