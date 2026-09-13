'use client';

import { Fragment, useEffect, useState } from 'react';
import s from './recl.module.css';

// Viernes 18/09/2026, 00:00 (hora Argentina, UTC-3)
const DEADLINE = new Date('2026-09-19T03:00:00Z').getTime();

function split(msLeft: number) {
  const clamped = Math.max(0, msLeft);
  const days    = Math.floor(clamped / 86_400_000);
  const hours   = Math.floor((clamped % 86_400_000) / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

const UNITS: { key: keyof ReturnType<typeof split>; label: string }[] = [
  { key: 'days',    label: 'Días' },
  { key: 'hours',   label: 'Hs'   },
  { key: 'minutes', label: 'Min'  },
  { key: 'seconds', label: 'Seg'  },
];

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;

  const closed = now >= DEADLINE;
  const parts  = split(DEADLINE - now);

  return (
    <div className={s.countdownWrap}>
      <p className={s.countdownLabel}>
        {closed ? 'Convocatoria cerrada' : 'La convocatoria cierra en'}
      </p>
      {!closed && (
        <div className={s.countdownGrid}>
          {UNITS.map(({ key, label }, i) => (
            <Fragment key={key}>
              <div className={s.countdownCell}>
                <span className={s.countdownNum}>
                  {String(parts[key]).padStart(2, '0')}
                </span>
                <span className={s.countdownUnit}>{label}</span>
              </div>
              {i < UNITS.length - 1 && (
                <span className={s.countdownSep} aria-hidden>:</span>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
