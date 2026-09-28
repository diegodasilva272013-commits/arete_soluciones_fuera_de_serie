'use client';

import s from '@/app/empresa/corp.module.css';

// Bloque de texto "banda" (número/label azul + párrafo(s) + lista de
// bullets opcional), como el "Núcleo compartido" de Providus. bordered
// agrega el marco azul sutil que usa esa sección; sin bordered queda como
// el bloque de la izquierda de un splitGrid.
export function PanelBand({
  eyebrow,
  body,
  pull,
  items,
  bordered = false,
  style,
}: {
  eyebrow?: string;
  body?: string | string[];
  pull?: string;
  items?: string[];
  bordered?: boolean;
  style?: React.CSSProperties;
}) {
  const paragraphs = Array.isArray(body) ? body : body ? [body] : [];
  return (
    <div
      className={s.reveal}
      data-reveal=""
      style={{ ...(bordered ? { background: '#050505', border: '1px solid rgba(47,123,246,0.2)', padding: '32px 34px' } : {}), ...style }}
    >
      {eyebrow && <p className={s.bandNum} style={{ color: 'var(--azul)' }}>{eyebrow}</p>}
      {paragraphs.map((p, i) => (
        <p key={i} className={s.bandBody} style={i === paragraphs.length - 1 && (pull || items) ? { marginBottom: 20 } : undefined}>{p}</p>
      ))}
      {pull && <p className={s.bandPull}>{pull}</p>}
      {items && (
        <ul className={s.panelList} style={{ padding: 0 }}>
          {items.map((item) => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      )}
    </div>
  );
}
