'use client';

import { Ecualizador } from '../_ecualizador';
import { guardarAreas } from '../actions';
import { copy } from '../_copy';
import type { AreaVida, AreasReglas } from '@/types/frecuencia';

export function AreasClienteGuardar({
  areas,
  reglas,
  nivelesIniciales,
  palancaInicial,
  manzanaInicial,
}: {
  areas: AreaVida[];
  reglas: AreasReglas | null;
  nivelesIniciales: Record<string, number>;
  palancaInicial: string | null;
  manzanaInicial: string | null;
}) {
  return (
    <Ecualizador
      areas={areas}
      reglas={reglas}
      nivelesIniciales={nivelesIniciales}
      palancaInicial={palancaInicial}
      manzanaInicial={manzanaInicial}
      textoCta={copy.botones.guardar}
      onGuardar={guardarAreas}
    />
  );
}
