'use client';

import { Countdown } from './_countdown';
import s from './recl.module.css';

export function Hero() {
  return (
    <section className={s.hero}>
      {/* Línea superior dorada — identidad de marca inmediata */}
      <div className={s.heroTopBar} />

      <div className={`${s.heroInner} ${s.inner}`}>

        <p className={s.eyebrow}>Areté Fuera de Serie</p>

        <h1 className={s.heroH1}>
          ¿Podés<br />
          <em>sostener</em><br />
          el proceso?
        </h1>

        <p className={s.heroLead}>
          Buscamos setters y cold callers que ejecuten todos los días, sin excusas.
          Compromiso real — no un currículum perfecto.
        </p>

        <div className={s.heroDivider} />

        <a href="#postularme" className={s.btnPrimary}>
          Postularme
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <Countdown />
      </div>
    </section>
  );
}
