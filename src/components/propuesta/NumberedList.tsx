'use client';

import { useState } from 'react';

export type NumberedItem = { n: string; t: string; d: string };

// Lista numerada en fila (56px | resto). Dos variantes que en Providus
// están implementadas por separado con el mismo array-shape {n,t,d}:
// "accordion" (ElasticRoadmap: la descripción se expande al hover) y
// "static" (NECESITAMOS: siempre visible, sin estado).
export function NumberedList({ items, variant = 'static' }: { items: NumberedItem[]; variant?: 'accordion' | 'static' }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (variant === 'accordion') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((item, i) => {
          const isActive = activeIdx === i;
          return (
            <div key={item.n} onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', background: isActive ? 'rgba(47,123,246,0.05)' : '#050505', borderLeft: `2px solid ${isActive ? 'var(--azul)' : 'transparent'}`, transition: 'background 0.25s, border-color 0.25s', cursor: 'default' }}>
              <div style={{ padding: '24px 16px', borderRight: '1px solid var(--linea)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.18em', color: isActive ? 'var(--azul-luz)' : 'var(--azul)', transition: 'color 0.25s' }}>{item.n}</span>
              </div>
              <div style={{ padding: '24px 32px' }}>
                <p style={{ margin: '0 0 8px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: isActive ? 'var(--hueso)' : 'rgba(242,239,233,0.7)', letterSpacing: '-0.01em', transition: 'color 0.25s' }}>{item.t}</p>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.7, color: 'var(--ceniza)', maxHeight: isActive ? 160 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,0.84,0.28,1)' }}>{item.d}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
      {items.map((item) => (
        <div key={item.n} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', background: '#050505' }}>
          <div style={{ padding: '22px 16px', borderRight: '1px solid var(--linea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, color: 'var(--azul)', letterSpacing: '0.16em' }}>{item.n}</span>
          </div>
          <div className="propNecPad" style={{ padding: '22px 32px' }}>
            <p style={{ margin: '0 0 4px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--hueso)' }}>{item.t}</p>
            <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13, lineHeight: 1.7, color: 'var(--ceniza)' }}>{item.d}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
