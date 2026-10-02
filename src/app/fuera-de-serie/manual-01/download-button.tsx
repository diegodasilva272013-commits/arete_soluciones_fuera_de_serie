'use client';

import { useState } from 'react';
import s from '@/app/empresa/corp.module.css';

export function DownloadButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <a
        href="/api/fuera-de-serie/manual-01/descargar"
        className={s.btn}
        onClick={() => {
          if (clicked) return;
          setClicked(true);
          setCount((c) => c + 1);
        }}
      >
        Descargar el manual (PDF)
      </a>
      <p
        style={{
          marginTop: 14,
          fontFamily: 'var(--f-mono), ui-monospace, monospace',
          fontSize: 12,
          letterSpacing: '0.04em',
          color: 'var(--texto-sutil, #8A8A8A)',
        }}
      >
        Descargado {count.toLocaleString('es-AR')} {count === 1 ? 'vez' : 'veces'}
      </p>
    </div>
  );
}
