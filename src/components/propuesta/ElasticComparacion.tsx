'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

export type ComparacionItem = { antes: string; despues: string };

// Tabla "antes / después" con hover elástico. Igual a la de Providus, con
// los labels de cabecera genericizados por props (ahí estaban fijos en el
// JSX: "Hoy, con vouchers" / "Con la plataforma").
export function ElasticComparacion({
  items,
  labelAntes = 'Hoy',
  labelDespues = 'Con la plataforma',
}: {
  items: ComparacionItem[];
  labelAntes?: string;
  labelDespues?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div>
      <div className="p-cmp-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', marginBottom: 1 }}>
        <div style={{ padding: '12px 28px', background: '#050505', borderBottom: '2px solid rgba(239,68,68,0.3)' }}>
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.55)', display: 'flex', alignItems: 'center', gap: 8 }}><X size={9} /> {labelAntes}</span>
        </div>
        <div style={{ padding: '12px 28px', background: 'rgba(47,123,246,0.04)', borderBottom: '2px solid var(--azul)' }}>
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--azul-luz)', display: 'flex', alignItems: 'center', gap: 8 }}><Check size={9} /> {labelDespues}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((row, i) => {
          const isHov = hovered === i;
          return (
            <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="p-cmp-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
              <div style={{ padding: isHov ? '28px 28px' : '20px 28px', background: isHov ? 'rgba(239,68,68,0.05)' : '#050505', transition: 'padding 0.3s, background 0.3s', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(239,68,68,0.45)', flexShrink: 0, marginTop: 10 }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.78, color: isHov ? 'rgba(242,239,233,0.45)' : 'rgba(242,239,233,0.3)', fontStyle: 'italic', transition: 'color 0.3s' }}>{row.antes}</p>
              </div>
              <div style={{ padding: isHov ? '28px 28px' : '20px 28px', background: isHov ? 'rgba(47,123,246,0.08)' : 'rgba(47,123,246,0.02)', transition: 'padding 0.3s, background 0.3s', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Check size={12} color={isHov ? 'var(--azul-luz)' : 'var(--azul)'} style={{ flexShrink: 0, marginTop: 5, transition: 'color 0.3s' }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.78, color: isHov ? 'var(--hueso)' : 'rgba(242,239,233,0.6)', transition: 'color 0.3s' }}>{row.despues}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
