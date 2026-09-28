'use client';

export type Metric = { val: string; label: string; sub: string };

// Franja de métricas del hero (inversión / entrega / plazo). Mismo diseño
// que Providus, genericizado a partir de un array de items por props.
export function MetricStrip({ items, style }: { items: Metric[]; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: 1, background: 'var(--linea)', marginBottom: 28, flexWrap: 'wrap', maxWidth: 640, margin: '0 auto 28px', ...style }}>
      {items.map(({ val, label, sub }) => (
        <div key={label} style={{ padding: '20px 28px', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(8px)', flex: '1 1 140px' }}>
          <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(18px,2vw,24px)', letterSpacing: '-0.05em', color: 'var(--hueso)' }}>{val}</div>
          <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: '5px 0 3px' }}>{label}</div>
          <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, color: 'var(--ceniza)' }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}
