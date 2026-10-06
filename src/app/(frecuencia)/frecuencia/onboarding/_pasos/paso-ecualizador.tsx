'use client';

import { useRouter } from 'next/navigation';
import { Ecualizador } from '../../_ecualizador';
import { guardarAreas } from '../../actions';
import { siguienteRuta, anteriorRuta } from '../_navegacion';
import { copy } from '../../_copy';
import { PantallaPregunta } from '../_pantalla-pregunta';
import type { AreaVida, AreasReglas, OnboardingCopy } from '@/types/frecuencia';

export function PasoEcualizador({
  c,
  areas,
  reglas,
  paso,
  nivelesIniciales,
  palancaInicial,
  manzanaInicial,
}: {
  c: OnboardingCopy['pasos']['ecualizador'];
  areas: AreaVida[];
  reglas: AreasReglas | null;
  paso: { actual: number; total: number };
  nivelesIniciales: Record<string, number>;
  palancaInicial: string | null;
  manzanaInicial: string | null;
}) {
  const router = useRouter();
  const atras = anteriorRuta('ecualizador');

  return (
    <PantallaPregunta claveAnimacion="ecualizador" kicker={c.kicker} gancho={c.gancho} razon={c.razon} pregunta={c.pregunta} paso={paso} marca={String(paso.actual).padStart(2, '0')}>
      <Ecualizador
        areas={areas}
        reglas={reglas}
        textoCta={copy.botones.siguiente}
        onGuardar={guardarAreas}
        onDespuesDeGuardar={() => router.push(siguienteRuta('ecualizador'))}
        onAtras={atras ? () => router.push(atras) : undefined}
        preguntaPalanca={c.palanca}
        preguntaManzana={c.manzana_podrida}
        nivelesIniciales={nivelesIniciales}
        palancaInicial={palancaInicial}
        manzanaInicial={manzanaInicial}
        exigirSeleccion
      />
    </PantallaPregunta>
  );
}
