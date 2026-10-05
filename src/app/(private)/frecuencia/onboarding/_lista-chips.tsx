'use client';

import { useState } from 'react';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';

export function ListaChips({ valores, onCambiar }: { valores: string[]; onCambiar: (valores: string[]) => void }) {
  const [borrador, setBorrador] = useState('');

  function agregar() {
    const v = borrador.trim();
    if (!v) return;
    onCambiar([...valores, v]);
    setBorrador('');
  }

  return (
    <div>
      <input
        className={base.input}
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            agregar();
          }
        }}
        placeholder={copy.noNegociables.placeholderItem}
      />
      {valores.length > 0 && (
        <div className={base.chipsFila}>
          {valores.map((v, i) => (
            <span key={`${v}-${i}`} className={base.chip}>
              {v}
              <button
                type="button"
                className={base.chipQuitar}
                onClick={() => onCambiar(valores.filter((_, idx) => idx !== i))}
                aria-label={copy.botones.quitar}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
