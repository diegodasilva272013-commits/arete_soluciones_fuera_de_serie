'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PantallaPregunta } from '../_pantalla-pregunta';
import { LineaTransmision, inicioDeFrase, tieneRespuesta } from '../_linea-transmision';
import { guardarIdentidad } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import type { OnboardingCopy } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';
import { BotonAtras } from '../_boton-atras';

const CAMPO_POR_KEY: Record<string, 'quienCreiaSer' | 'quienSoy' | 'comoMeVen' | 'quienQuieroSer'> = {
  quien_creia_ser: 'quienCreiaSer',
  quien_soy: 'quienSoy',
  como_me_ven: 'comoMeVen',
  quien_quiero_ser: 'quienQuieroSer',
};

export function PasoIdentidad({
  pantallas,
  valoresIniciales,
  paso,
}: {
  pantallas: OnboardingCopy['pasos']['identidad'];
  valoresIniciales: Record<string, string>;
  paso: { actual: number; total: number };
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  // Cada campo arranca con el comienzo de frase de onboarding_copy
  // (salvo que ya haya una respuesta guardada).
  const [respuestas, setRespuestas] = useState<Record<string, string>>(() =>
    Object.fromEntries(pantallas.map((p) => [p.key, valoresIniciales[p.key] || inicioDeFrase(p.placeholder)]))
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actual = pantallas[indice];
  const esUltima = indice === pantallas.length - 1;
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
    const payload = Object.fromEntries(Object.entries(respuestas).map(([key, val]) => [CAMPO_POR_KEY[key], val.trim()]));
    const r = await guardarIdentidad(payload);
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('identidad'));
  }

  return (
    <>
      <PantallaPregunta
        claveAnimacion={actual.key}
        kicker={actual.kicker}
        gancho={actual.gancho}
        razon={actual.razon}
        pregunta={actual.pregunta}
        ejemplo={actual.ejemplo}
        paso={paso}
        subPaso={{ actual: indice + 1, total: pantallas.length }}
        marca={String(paso.actual).padStart(2, '0')}
      >
        <LineaTransmision
          key={actual.key}
          valor={valorActual}
          onCambiar={(v) => setRespuestas((prev) => ({ ...prev, [actual.key]: v }))}
          etiqueta={actual.pregunta}
          autoFocus
        />
        {error && <p className={s.error} role="alert">{error}</p>}
      </PantallaPregunta>

      <BarraPasos>
        <BotonAtras paso="identidad" indice={indice} onAnterior={() => { setError(null); setIndice((i) => i - 1); }} />
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.continuar : copy.botones.siguiente}
        </button>
      </BarraPasos>
    </>
  );
}
