'use client';

import { useEffect, useState } from 'react';

// Lunes 14/09/2026, 12:00 (hora Argentina, UTC-3) — fecha pedida
// explícitamente para el cierre de esta convocatoria.
const DEADLINE = new Date('2026-09-14T12:00:00-03:00').getTime();

function split(msLeft: number) {
  const clamped = Math.max(0, msLeft);
  const days = Math.floor(clamped / 86_400_000);
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

const UNITS: { key: keyof ReturnType<typeof split>; label: string }[] = [
  { key: 'days', label: 'Días' },
  { key: 'hours', label: 'Hs' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Seg' },
];

export function Countdown() {
  // Se calcula recién en el cliente (evita mismatch de hidratación
  // contra la hora del servidor) — arranca en null y se llena al
  // montar.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  const closed = now >= DEADLINE;
  const parts = split(DEADLINE - now);

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
        {closed ? 'Convocatoria cerrada' : 'La convocatoria cierra en'}
      </p>
      {!closed && (
        <div className="flex items-stretch gap-2 sm:gap-3">
          {UNITS.map(({ key, label }) => (
            <div
              key={key}
              className="flex w-[64px] flex-col items-center rounded-xl border border-brand-gold/25 bg-brand-surface/70 py-3 backdrop-blur"
            >
              <span className="font-mono text-2xl font-bold tabular-nums text-brand-text sm:text-3xl">
                {String(parts[key]).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[9px] uppercase tracking-widest text-brand-muted">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
