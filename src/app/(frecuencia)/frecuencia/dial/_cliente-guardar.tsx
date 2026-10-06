'use client';

import { Dial } from '../_dial';
import { guardarDial } from '../actions';
import { copy } from '../_copy';
import type { EnergiaEscasez } from '@/types/frecuencia';

export function DialClienteGuardar({
  valorInicial,
  energiasGuardadasIniciales,
  energiasDisponibles,
  accionesSubida,
}: {
  valorInicial: number;
  energiasGuardadasIniciales: Record<string, number>;
  energiasDisponibles: EnergiaEscasez[];
  accionesSubida: string[];
}) {
  return (
    <Dial
      valorInicial={valorInicial}
      energiasGuardadasIniciales={energiasGuardadasIniciales}
      energiasDisponibles={energiasDisponibles}
      accionesSubida={accionesSubida}
      textoCta={copy.botones.guardar}
      onGuardar={guardarDial}
    />
  );
}
