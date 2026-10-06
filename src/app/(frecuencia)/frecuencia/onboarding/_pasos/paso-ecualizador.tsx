'use client';

import { useRouter } from 'next/navigation';
import { Ecualizador } from '../../_ecualizador';
import { guardarAreas } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import type { AreaVida, AreasReglas } from '@/types/frecuencia';

export function PasoEcualizador({
  pregunta,
  areas,
  reglas,
}: {
  pregunta: string;
  areas: AreaVida[];
  reglas: AreasReglas | null;
}) {
  const router = useRouter();

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--f-texto), Spectral, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--ceniza)', marginBottom: 8 }}>
        {pregunta}
      </h2>
      <Ecualizador
        areas={areas}
        reglas={reglas}
        textoCta={copy.botones.siguiente}
        onGuardar={guardarAreas}
        onDespuesDeGuardar={() => router.push(siguienteRuta('ecualizador'))}
      />
    </div>
  );
}
