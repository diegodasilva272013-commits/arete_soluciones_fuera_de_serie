import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getAreasVida, getAreasReglas } from '@/lib/frecuencia-kb';
import { AreasClienteGuardar } from './_cliente-guardar';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';

export default async function AreasPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();
  const areas = (await getAreasVida()) ?? [];
  const reglas = await getAreasReglas();

  const { data: filas } = await (supabase as any)
    .from('frecuencia_areas')
    .select('area_key, nivel_actual, es_palanca, es_manzana_podrida')
    .eq('user_id', ctx.userId);

  const niveles: Record<string, number> = {};
  let palanca: string | null = null;
  let manzana: string | null = null;
  for (const f of filas ?? []) {
    niveles[f.area_key] = f.nivel_actual;
    if (f.es_palanca) palanca = f.area_key;
    if (f.es_manzana_podrida) manzana = f.area_key;
  }

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.areas.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.areas.titulo}</h1>

      <AreasClienteGuardar
        areas={areas}
        reglas={reglas}
        nivelesIniciales={niveles}
        palancaInicial={palanca}
        manzanaInicial={manzana}
      />

      <Link href="/frecuencia/objetivos" className={base.btnGhost} style={{ marginTop: 32, display: 'inline-block' }}>
        {copy.objetivos.titulo} →
      </Link>
    </div>
  );
}
