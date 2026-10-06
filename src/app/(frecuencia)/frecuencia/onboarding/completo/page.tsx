import Link from 'next/link';
import { getOnboardingCopy } from '@/lib/frecuencia-kb';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import { BarraPasos } from '../../_barra-pasos';
import { DialAutomatico } from '../_dial-automatico';

/**
 * Cierre del onboarding (onboarding_copy.pasos.cierre): la estación queda
 * sintonizada — el Dial sube solo hasta arriba — y el cta lleva al Dial.
 */
export default async function OnboardingCompletoPage() {
  const textos = await getOnboardingCopy();
  const cierre = textos?.pasos?.cierre;

  return (
    <>
      <div className={s.pantalla}>
        <div className={s.cabecera}>
          <span className={`${base.kickerLine} ${base.on}`} />
          {cierre?.kicker && <span className={base.kickerLabel}>{cierre.kicker}</span>}
        </div>
        <div className={s.cuerpo}>
          {cierre?.gancho && <h1 className={`${s.gancho} ${s.etapa}`}>{cierre.gancho}</h1>}
          {cierre?.razon && <p className={`${s.razon} ${s.etapa}`}>{cierre.razon}</p>}
          <div className={`${s.introDial} ${s.etapa}`}>
            <DialAutomatico modo="sintonizar" />
          </div>
        </div>
      </div>
      <BarraPasos>
        <Link href="/frecuencia/dial" className={base.btn}>
          {cierre?.cta ?? copy.dock.dial}
        </Link>
      </BarraPasos>
    </>
  );
}
