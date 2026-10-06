'use client';

import { useRouter } from 'next/navigation';
import { Dial } from '../../_dial';
import { guardarDial } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import type { EnergiaEscasez } from '@/types/frecuencia';

export function PasoDial({
  pregunta,
  energiasDisponibles,
  accionesSubida,
}: {
  pregunta: string;
  energiasDisponibles: EnergiaEscasez[];
  accionesSubida: string[];
}) {
  const router = useRouter();

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--f-texto), Spectral, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: 'var(--ceniza)', marginBottom: 8 }}>
        {pregunta}
      </h2>
      <Dial
        energiasDisponibles={energiasDisponibles}
        accionesSubida={accionesSubida}
        textoCta={copy.botones.siguiente}
        onGuardar={guardarDial}
        onDespuesDeGuardar={() => router.push(siguienteRuta('dial'))}
      />
    </div>
  );
}
