'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PantallaPregunta } from '../_pantalla-pregunta';
import { LineaTransmision, inicioDeFrase, tieneRespuesta } from '../_linea-transmision';
import { BotonAtras } from '../_boton-atras';
import { guardarEspejo } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import type { OnboardingCopy } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

export function PasoEspejo({ c, paso }: { c: OnboardingCopy['pasos']['espejo']; paso: { actual: number; total: number } }) {
  const router = useRouter();
  const preguntas = c.preguntas;
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>(() =>
    Object.fromEntries(preguntas.map((p) => [p.key, inicioDeFrase(p.placeholder)]))
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actual = preguntas[indice];
  const esUltima = indice === preguntas.length - 1;
  const valorActual = respuestas[actual.key] ?? '';

  async function siguiente() {
    if (!tieneRespuesta(valorActual, actual.placeholder)) {
      setError(copy.estados.campoRequerido);
      return;
    }
    setError(null);

    if (!esUltima) {
      setIndice((i) => i + 1);
      return;
    }

    setGuardando(true);
    const r = await guardarEspejo({
      comoMeVeo: (respuestas['como_me_veo'] ?? '').trim(),
      comoMePercibo: (respuestas['como_me_percibo'] ?? '').trim(),
      comoMeSiento: (respuestas['como_me_siento'] ?? '').trim(),
    });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('espejo'));
  }

  const primera = indice === 0;

  return (
    <>
      <PantallaPregunta
        claveAnimacion={actual.key}
        kicker={c.kicker}
        gancho={primera ? c.gancho : actual.pregunta}
        razon={primera ? c.razon : undefined}
        pregunta={primera ? actual.pregunta : undefined}
        ejemplo={actual.ejemplo}
        notas={[actual.ayuda]}
        paso={paso}
        subPaso={{ actual: indice + 1, total: preguntas.length }}
        marca={String(paso.actual).padStart(2, '0')}
      >
        <LineaTransmision
          key={actual.key}
          valor={valorActual}
          onCambiar={(v) => setRespuestas((prev) => ({ ...prev, [actual.key]: v }))}
          etiqueta={actual.pregunta}
          autoFocus
        />
        {error && <p className={s.error}>{error}</p>}
      </PantallaPregunta>

      <BarraPasos>
        <BotonAtras paso="espejo" indice={indice} onAnterior={() => { setError(null); setIndice((i) => i - 1); }} />
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.continuar : copy.botones.siguiente}
        </button>
      </BarraPasos>
    </>
  );
}
