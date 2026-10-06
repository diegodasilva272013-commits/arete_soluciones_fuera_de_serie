'use client';

/**
 * Header mínimo propio de Frecuencia (dentro de /frecuencia no se muestra
 * la barra ni el sidebar de la plataforma). A la izquierda la marca, que
 * lleva a la entrada de la app; a la derecha, la única salida: volver a
 * /dashboard.
 */

import Link from 'next/link';
import { copy } from './_copy';
import s from './_shell.module.css';

export function HeaderFrecuencia() {
  return (
    <header className={s.header}>
      <Link href="/frecuencia" className={s.marca} aria-label={copy.shell.irAlInicio}>
        <span className={s.marcaSenal} aria-hidden>
          <i /><i /><i />
        </span>
        <span className={s.marcaNombre}>{copy.shell.marca}</span>
      </Link>
      <Link href="/dashboard" className={s.salir}>
        <span>{copy.shell.salir}</span>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
          <path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </Link>
    </header>
  );
}
