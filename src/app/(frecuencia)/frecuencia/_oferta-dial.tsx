'use client';

/**
 * Lenguaje de escasez (7.6): si en un texto libre aparecen palabras de las
 * energías de escasez (lista en frecuencia_knowledge_blocks), se OFRECE
 * cambiar de dial. Sin juicio y sin bloquear nada. Si la lista no está
 * cargada, no se muestra nada.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { detectarEscasez, type PalabrasEscasez } from '@/lib/frecuencia/escasez';
import type { EnergiaEscasez } from '@/types/frecuencia';
import { copy } from './_copy';
import s from './_oferta-dial.module.css';

export function OfertaDial({ texto, palabras, energias }: { texto: string; palabras: PalabrasEscasez | null; energias: EnergiaEscasez[] }) {
  const nombres = useMemo(() => {
    const claves = detectarEscasez(texto, palabras);
    return claves.map((k) => energias.find((e) => e.key === k)?.nombre ?? '').filter(Boolean);
  }, [texto, palabras, energias]);

  if (!nombres.length) return null;
  return (
    <p className={s.oferta} role="status">
      <span>{copy.escasez.oferta(nombres)}</span>{' '}
      <Link href="/frecuencia/dial" className={s.enlace}>
        {copy.escasez.cta}
      </Link>
    </p>
  );
}
