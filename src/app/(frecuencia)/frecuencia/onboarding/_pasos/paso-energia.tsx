'use client';

/**
 * Tu mejor horario: una pregunta por pantalla. La primera trae el gancho
 * y la razón del paso; las siguientes ponen la pregunta como título. La
 * nota "si no lo sabés" (sin_saber) acompaña las preguntas de franjas.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PantallaPregunta } from '../_pantalla-pregunta';
import { LineaTransmision } from '../_linea-transmision';
import { BotonAtras } from '../_boton-atras';
import { guardarEnergia } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import type { OnboardingCopy } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

export function PasoEnergia({
  c,
  horaDespertarInicial,
  franjasIniciales,
  paso,
}: {
  c: OnboardingCopy['pasos']['energia'];
  horaDespertarInicial: string;
  franjasIniciales: Record<string, string>;
  paso: { actual: number; total: number };
}) {
  const router = useRouter();
  const preguntas = c.preguntas;
  const [indice, setIndice] = useState(0);
  const [horaDespertar, setHoraDespertar] = useState(horaDespertarInicial);
  const [franjas, setFranjas] = useState<Record<string, string>>(franjasIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actual = preguntas[indice];
  const esHora = actual.key === 'hora_despertar';
  const esUltima = indice === preguntas.length - 1;
  const valorActual = esHora ? horaDespertar : franjas[actual.key] ?? '';

  async function siguiente() {
    if (!valorActual.trim()) {
      setError(copy.estados.campoRequerido);
      return;
    }
    setError(null);

    if (!esUltima) {
      setIndice((i) => i + 1);
      return;
    }

    setGuardando(true);
    const r = await guardarEnergia({
      horaDespertar,
      franjas: preguntas
        .filter((p) => p.key !== 'hora_despertar')
        .map((p) => ({ tipo: p.key as 'profundo' | 'decision' | 'creativo', respuesta: (franjas[p.key] ?? '').trim() })),
    });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('energia'));
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
        notas={[actual.ayuda, esHora ? undefined : c.sin_saber]}
        paso={paso}
        subPaso={{ actual: indice + 1, total: preguntas.length }}
        marca={String(paso.actual).padStart(2, '0')}
      >
        {esHora ? (
          <LineaTransmision key="hora" tipo="hora" valor={horaDespertar} onCambiar={setHoraDespertar} etiqueta={actual.pregunta} autoFocus />
        ) : (
          <LineaTransmision
            key={actual.key}
            valor={franjas[actual.key] ?? ''}
            onCambiar={(v) => setFranjas((prev) => ({ ...prev, [actual.key]: v }))}
            etiqueta={actual.pregunta}
            autoFocus
          />
        )}
        {error && <p className={s.error}>{error}</p>}
      </PantallaPregunta>

      <BarraPasos>
        <BotonAtras paso="energia" indice={indice} onAnterior={() => { setError(null); setIndice((i) => i - 1); }} />
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.continuar : copy.botones.siguiente}
        </button>
      </BarraPasos>
    </>
  );
}
