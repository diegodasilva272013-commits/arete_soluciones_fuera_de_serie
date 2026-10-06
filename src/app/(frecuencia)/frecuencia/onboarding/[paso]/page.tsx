import { notFound, redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { primerPasoIncompleto } from '@/lib/frecuencia-progreso';
import {
  getAreasVida,
  getAreasReglas,
  getEnergiasEscasez,
  getAccionesSubida,
  getOnboardingCopy,
} from '@/lib/frecuencia-kb';
import { esPasoValido, indiceDe, PASOS_WIZARD } from '../_navegacion';
import { PasoDial } from '../_pasos/paso-dial';
import { PasoIdentidad } from '../_pasos/paso-identidad';
import { PasoNoNegociables } from '../_pasos/paso-no-negociables';
import { PasoEcualizador } from '../_pasos/paso-ecualizador';
import { PasoEnergia } from '../_pasos/paso-energia';
import { PasoEspejo } from '../_pasos/paso-espejo';
import { PasoObjetivo } from '../_pasos/paso-objetivo';

export default async function PasoOnboardingPage({ params }: { params: { paso: string } }) {
  const { paso } = params;
  if (!esPasoValido(paso)) notFound();

  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const areas = (await getAreasVida()) ?? [];

  // No se puede saltar adelante del primer paso incompleto. Sí se puede
  // volver atrás a revisar/editar un paso ya hecho.
  const pasoActualDelUsuario = await primerPasoIncompleto(ctx.userId, areas.length);
  if (pasoActualDelUsuario !== 'completo' && indiceDe(paso) > indiceDe(pasoActualDelUsuario)) {
    redirect(`/frecuencia/onboarding/${pasoActualDelUsuario}`);
  }
  if (pasoActualDelUsuario === 'completo') {
    redirect('/frecuencia/onboarding/completo');
  }

  const textos = await getOnboardingCopy();
  if (!textos) {
    // Falla cerrada: sin contenido del método no se puede mostrar el
    // onboarding — mejor un error visible que preguntas vacías.
    throw new Error('No se pudo cargar el contenido del onboarding (frecuencia_knowledge_blocks.onboarding_copy).');
  }
  const t = textos.pasos;
  const numero = { actual: indiceDe(paso) + 1, total: PASOS_WIZARD.length };

  const supabase = createSupabaseServerClient();

  let contenido: React.ReactNode;

  switch (paso) {
    case 'dial': {
      const energiasDisponibles = (await getEnergiasEscasez()) ?? [];
      const accionesSubida = (await getAccionesSubida()) ?? [];
      contenido = <PasoDial c={t.dial} energiasDisponibles={energiasDisponibles} accionesSubida={accionesSubida} paso={numero} />;
      break;
    }
    case 'identidad': {
      const { data } = await (supabase as any)
        .from('frecuencia_identidad')
        .select('quien_creia_ser, quien_soy, como_me_ven, quien_quiero_ser')
        .eq('user_id', ctx.userId)
        .maybeSingle();
      const valoresIniciales: Record<string, string> = {
        quien_creia_ser: data?.quien_creia_ser ?? '',
        quien_soy: data?.quien_soy ?? '',
        como_me_ven: data?.como_me_ven ?? '',
        quien_quiero_ser: data?.quien_quiero_ser ?? '',
      };
      // Solo las claves que la app sabe guardar: una clave nueva o
      // distinta en la base no puede dejar el paso imposible de completar.
      const pantallas = t.identidad.filter((x) => x.key in valoresIniciales);
      contenido = <PasoIdentidad pantallas={pantallas} valoresIniciales={valoresIniciales} paso={numero} />;
      break;
    }
    case 'no_negociables': {
      const { data } = await (supabase as any)
        .from('frecuencia_identidad')
        .select('no_negociables, estandar_minimo')
        .eq('user_id', ctx.userId)
        .maybeSingle();
      contenido = (
        <PasoNoNegociables
          noNegociablesCopy={t.no_negociables}
          estandarMinimoCopy={t.estandar_minimo}
          paso={numero}
          noNegociablesIniciales={data?.no_negociables ?? []}
          estandarMinimoInicial={data?.estandar_minimo ?? []}
        />
      );
      break;
    }
    case 'ecualizador': {
      const reglas = await getAreasReglas();
      // Lo ya guardado vuelve a aparecer: volver al paso no lo resetea.
      const { data: filas } = await (supabase as any)
        .from('frecuencia_areas')
        .select('area_key, nivel_actual, es_palanca, es_manzana_podrida')
        .eq('user_id', ctx.userId);
      const niveles: Record<string, number> = {};
      let palanca: string | null = null;
      let manzana: string | null = null;
      for (const f of (filas ?? []) as Array<{ area_key: string; nivel_actual: number; es_palanca: boolean; es_manzana_podrida: boolean }>) {
        niveles[f.area_key] = f.nivel_actual;
        if (f.es_palanca) palanca = f.area_key;
        if (f.es_manzana_podrida) manzana = f.area_key;
      }
      contenido = (
        <PasoEcualizador
          c={t.ecualizador}
          areas={areas}
          reglas={reglas}
          paso={numero}
          nivelesIniciales={niveles}
          palancaInicial={palanca}
          manzanaInicial={manzana}
        />
      );
      break;
    }
    case 'energia': {
      const { data: pref } = await (supabase as any)
        .from('frecuencia_preferencias')
        .select('hora_despertar')
        .eq('user_id', ctx.userId)
        .maybeSingle();
      const { data: mapa } = await (supabase as any)
        .from('frecuencia_mapa_energia')
        .select('franjas')
        .eq('user_id', ctx.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const franjasIniciales: Record<string, string> = {};
      for (const f of mapa?.franjas ?? []) franjasIniciales[f.tipo] = f.respuesta;
      contenido = (
        <PasoEnergia
          c={t.energia}
          paso={numero}
          horaDespertarInicial={pref?.hora_despertar?.slice(0, 5) ?? ''}
          franjasIniciales={franjasIniciales}
        />
      );
      break;
    }
    case 'espejo': {
      contenido = <PasoEspejo c={t.espejo} paso={numero} />;
      break;
    }
    case 'objetivo': {
      const conocidas = ['imagen_mental', 'fecha_limite', 'area_key', 'identidad_que_expresa'];
      const objetivo = { ...t.objetivo, preguntas: t.objetivo.preguntas.filter((x) => conocidas.includes(x.key)) };
      contenido = <PasoObjetivo c={objetivo} sinPropositoCopy={t.sin_proposito} areas={areas} paso={numero} />;
      break;
    }
    default:
      notFound();
  }

  return contenido;
}
