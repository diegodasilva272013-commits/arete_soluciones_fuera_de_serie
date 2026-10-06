import Link from 'next/link';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';

export default function OnboardingCompletoPage() {
  return (
    <div className={base.pantalla} style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.onboarding.kicker}</span>
      </div>
      <h1 className={base.titulo}>
        {copy.onboarding.cierre.titulo.split('.')[0]}.{' '}
        <span className={base.tituloAcento}>{copy.onboarding.cierre.subtitulo}</span>
      </h1>
      <div className={base.filaBotones}>
        <Link href="/frecuencia/dial" className={base.btn}>
          {copy.dock.dial}
        </Link>
      </div>
    </div>
  );
}
