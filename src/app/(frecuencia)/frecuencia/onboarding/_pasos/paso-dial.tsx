'use client';

import { useRouter } from 'next/navigation';
import { Dial } from '../../_dial';
import { guardarDial } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import { PantallaPregunta } from '../_pantalla-pregunta';
import type { EnergiaEscasez, PantallaCopy } from '@/types/frecuencia';

export function PasoDial({
  c,
  energiasDisponibles,
  accionesSubida,
  paso,
}: {
  c: PantallaCopy;
  energiasDisponibles: EnergiaEscasez[];
  accionesSubida: string[];
  paso: { actual: number; total: number };
}) {
  const router = useRouter();

  return (
    <PantallaPregunta claveAnimacion="dial" kicker={c.kicker} gancho={c.gancho} razon={c.razon} pregunta={c.pregunta} paso={paso} marca={String(paso.actual).padStart(2, '0')}>
      <Dial
        energiasDisponibles={energiasDisponibles}
        accionesSubida={accionesSubida}
        textoCta={copy.botones.siguiente}
        onGuardar={guardarDial}
        onDespuesDeGuardar={() => router.push(siguienteRuta('dial'))}
        onAtras={() => router.push('/frecuencia/onboarding/intro?desde=fin')}
      />
    </PantallaPregunta>
  );
}
