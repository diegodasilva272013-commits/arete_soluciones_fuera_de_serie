'use client';

import s from '@/app/empresa/corp.module.css';

// Encabezado de sección: número/label + título de 2 renglones (el segundo en
// azul, <em>) + bajada itálica opcional. Mismo patrón que cada sección
// numerada de la propuesta de Providus (sectionLockup + kickerLabel +
// sectionTitle + sectionSub).
export function SectionHead({
  eyebrow,
  titulo1,
  titulo2Em,
  sub,
  center = false,
  style,
}: {
  eyebrow: string;
  titulo1: string;
  titulo2Em: string;
  sub?: string;
  center?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`${s.sectionLockup} ${s.reveal}`}
      data-reveal=""
      style={{ marginBottom: 48, ...(center ? { textAlign: 'center' } : {}), ...style }}
    >
      <p className={s.kickerLabel} style={{ marginBottom: 14, ...(center ? { justifyContent: 'center' } : {}) }}>{eyebrow}</p>
      <h2 className={s.sectionTitle}>{titulo1}<br /><em>{titulo2Em}</em></h2>
      {sub && <p className={s.sectionSub}>{sub}</p>}
    </div>
  );
}
