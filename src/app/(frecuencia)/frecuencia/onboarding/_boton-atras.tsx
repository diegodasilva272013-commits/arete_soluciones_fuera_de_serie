'use client';

/**
 * "Atrás" de la barra de pasos del onboarding: dentro de un paso vuelve a
 * la pregunta anterior; en la primera pregunta vuelve al paso anterior
 * (o a la intro, desde el primer paso).
 */

import Link from 'next/link';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { anteriorRuta } from './_navegacion';
import type { PasoOnboarding } from '@/types/frecuencia';

export function BotonAtras({
  paso,
  indice,
  onAnterior,
  disabled,
}: {
  paso: Exclude<PasoOnboarding, 'completo'>;
  indice: number;
  onAnterior: () => void;
  disabled?: boolean;
}) {
  if (indice > 0) {
    return (
      <button type="button" className={base.btnSec} onClick={onAnterior} disabled={disabled}>
        {copy.botones.atras}
      </button>
    );
  }
  return (
    <Link href={anteriorRuta(paso) ?? '/frecuencia/onboarding/intro?desde=fin'} className={base.btnSec}>
      {copy.botones.atras}
    </Link>
  );
}
