import Link from 'next/link';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { indiceDe, anteriorRuta, PASOS_WIZARD } from './_navegacion';
import type { PasoOnboarding } from '@/types/frecuencia';

export function PasoHeader({ paso }: { paso: Exclude<PasoOnboarding, 'completo'> }) {
  const indice = indiceDe(paso);
  const total = PASOS_WIZARD.length;
  const atras = anteriorRuta(paso);

  return (
    <>
      <div className={base.progresoWrap}>
        <div className={base.progresoBarra} style={{ width: `${((indice + 1) / total) * 100}%` }} />
      </div>
      <div className={base.kicker}>
        {atras && (
          <Link
            href={atras}
            aria-label={copy.botones.atras}
            style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 13, color: 'var(--ceniza)', textDecoration: 'none' }}
          >
            ←
          </Link>
        )}
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.onboarding.kicker}</span>
        <span className={base.kickerPaso}>{copy.onboarding.pasoDe(indice + 1, total)}</span>
      </div>
    </>
  );
}
