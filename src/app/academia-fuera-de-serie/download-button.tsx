'use client';

import { useState } from 'react';
import s from './academia.module.css';

export function DownloadButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [clicked, setClicked] = useState(false);

  return (
    <div className={s.downloadBlock}>
      <a
        href="/api/academia-fuera-de-serie/descargar"
        className={s.btn}
        onClick={() => {
          if (clicked) return;
          setClicked(true);
          setCount((c) => c + 1);
        }}
      >
        Descargar el manual (PDF)
      </a>
      <p className={s.counter}>
        Descargado {count.toLocaleString('es-AR')} {count === 1 ? 'vez' : 'veces'}
      </p>
    </div>
  );
}
