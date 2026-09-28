'use client';

import type { LucideIcon } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';

export type FeatureItem = { icon: LucideIcon; t: string; q: string; d: string };

// Grilla de N tarjetas (icono + título + kicker + descripción) sobre fondo
// de líneas, con la clase responsive "p-grid5" de Providus (ya renombrada
// acá a algo neutral vía la prop className) forzando 1 columna en mobile.
export function FeatureGrid({ items, columns = items.length }: { items: FeatureItem[]; columns?: number }) {
  return (
    <div
      className={`${s.reveal} propFeatureGrid`}
      data-reveal=""
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: 1, background: 'var(--linea)', marginBottom: 1 }}
    >
      {items.map(({ icon: Icon, t, q, d }) => (
        <div key={t} style={{ background: '#050505', padding: '32px 28px' }}>
          <Icon size={18} color="var(--azul)" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--hueso)', letterSpacing: '-0.02em' }}>{t}</h3>
          <p style={{ margin: '0 0 10px', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{q}</p>
          <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontWeight: 300, fontSize: 14, lineHeight: 1.65, color: '#B4B1AB' }}>{d}</p>
        </div>
      ))}
    </div>
  );
}
