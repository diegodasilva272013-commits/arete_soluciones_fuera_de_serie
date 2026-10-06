'use client';

/**
 * Tu objetivo: imagen mental → fecha → área → identidad. Si la persona no
 * tiene un objetivo claro, la rama "sin propósito" (onboarding_copy) la
 * lleva a hacer excelente lo que ya hace. Las áreas se eligen como
 * frecuencias numeradas del dial (01…10), no como chips sueltos.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PantallaPregunta } from '../_pantalla-pregunta';
import { LineaTransmision, inicioDeFrase, tieneRespuesta } from '../_linea-transmision';
import { BotonAtras } from '../_boton-atras';
import { guardarObjetivo } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import type { AreaVida, OnboardingCopy, PantallaCopy } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

export function PasoObjetivo({
  c,
  sinPropositoCopy,
  areas,
  paso,
}: {
  c: OnboardingCopy['pasos']['objetivo'];
  sinPropositoCopy: PantallaCopy;
  areas: AreaVida[];
  paso: { actual: number; total: number };
}) {
  const router = useRouter();
  const preguntas = c.preguntas;
  const placeholderDe = (key: string) => preguntas.find((p) => p.key === key)?.placeholder;

  const [sinProposito, setSinProposito] = useState(false);
  const [indice, setIndice] = useState(0);
  const [imagenMental, setImagenMental] = useState(() => inicioDeFrase(placeholderDe('imagen_mental')));
  const [fechaLimite, setFechaLimite] = useState('');
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [identidadQueExpresa, setIdentidadQueExpresa] = useState(() => inicioDeFrase(placeholderDe('identidad_que_expresa')));
  const [respuestaSinProposito, setRespuestaSinProposito] = useState(() => inicioDeFrase(sinPropositoCopy.placeholder));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const marca = String(paso.actual).padStart(2, '0');

  async function guardarYContinuar(input: Parameters<typeof guardarObjetivo>[0]) {
    setGuardando(true);
    setError(null);
    const r = await guardarObjetivo(input);
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('objetivo'));
  }

  if (sinProposito) {
    return (
      <>
        <PantallaPregunta
          claveAnimacion="sin_proposito"
          kicker={sinPropositoCopy.kicker}
          gancho={sinPropositoCopy.gancho}
          razon={sinPropositoCopy.razon}
          pregunta={sinPropositoCopy.pregunta}
          ejemplo={sinPropositoCopy.ejemplo}
          paso={paso}
          marca={marca}
        >
          <LineaTransmision key="sin_proposito" valor={respuestaSinProposito} onCambiar={setRespuestaSinProposito} etiqueta={sinPropositoCopy.pregunta} autoFocus />
          {error && <p className={s.error}>{error}</p>}
        </PantallaPregunta>

        <BarraPasos>
          <button type="button" className={base.btnSec} onClick={() => { setError(null); setSinProposito(false); }}>
            {copy.botones.volverAlObjetivo}
          </button>
          <button
            type="button"
            className={base.btn}
            disabled={guardando}
            onClick={() => {
              if (!tieneRespuesta(respuestaSinProposito, sinPropositoCopy.placeholder)) {
                setError(copy.estados.campoRequerido);
                return;
              }
              guardarYContinuar({ imagenMental: respuestaSinProposito.trim(), fechaLimite: null, areaKey: null, identidadQueExpresa: null });
            }}
          >
            {guardando ? copy.botones.guardando : copy.botones.continuar}
          </button>
        </BarraPasos>
      </>
    );
  }

  const actual = preguntas[indice];
  const esUltima = indice === preguntas.length - 1;
  const primera = indice === 0;

  function validarPasoActual(): boolean {
    if (actual.key === 'imagen_mental') return tieneRespuesta(imagenMental, actual.placeholder);
    if (actual.key === 'fecha_limite') return fechaLimite.trim().length > 0;
    if (actual.key === 'area_key') return !!areaKey;
    if (actual.key === 'identidad_que_expresa') return tieneRespuesta(identidadQueExpresa, actual.placeholder);
    return true;
  }

  async function siguiente() {
    if (!validarPasoActual()) {
      setError(copy.estados.campoRequerido);
      return;
    }
    setError(null);

    if (!esUltima) {
      setIndice((i) => i + 1);
      return;
    }

    await guardarYContinuar({
      imagenMental: imagenMental.trim(),
      fechaLimite: fechaLimite || null,
      areaKey,
      identidadQueExpresa: tieneRespuesta(identidadQueExpresa, placeholderDe('identidad_que_expresa')) ? identidadQueExpresa.trim() : null,
    });
  }

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
        marca={marca}
      >
        {actual.key === 'imagen_mental' && (
          <LineaTransmision key="imagen_mental" valor={imagenMental} onCambiar={setImagenMental} etiqueta={actual.pregunta} autoFocus />
        )}
        {actual.key === 'fecha_limite' && (
          <LineaTransmision key="fecha" tipo="fecha" valor={fechaLimite} onCambiar={setFechaLimite} etiqueta={actual.pregunta} autoFocus />
        )}
        {actual.key === 'area_key' && (
          <div className={s.frecuencias} role="radiogroup" aria-label={actual.pregunta}>
            {areas.map((a, i) => (
              <button
                key={a.key}
                type="button"
                role="radio"
                aria-checked={areaKey === a.key}
                className={`${s.frecuencia} ${areaKey === a.key ? s.frecuenciaElegida : ''}`}
                onClick={() => setAreaKey(a.key)}
              >
                <span className={s.frecuenciaNumero}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.frecuenciaNombre}>{a.nombre}</span>
              </button>
            ))}
          </div>
        )}
        {actual.key === 'identidad_que_expresa' && (
          <LineaTransmision key="identidad" valor={identidadQueExpresa} onCambiar={setIdentidadQueExpresa} etiqueta={actual.pregunta} autoFocus />
        )}
        {error && <p className={s.error}>{error}</p>}
        {primera && (
          <button type="button" className={base.btnGhost} style={{ marginTop: 28 }} onClick={() => { setError(null); setSinProposito(true); }}>
            {copy.botones.noTengoObjetivoClaro}
          </button>
        )}
      </PantallaPregunta>

      <BarraPasos>
        <BotonAtras paso="objetivo" indice={indice} onAnterior={() => { setError(null); setIndice((i) => i - 1); }} />
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.terminar : copy.botones.siguiente}
        </button>
      </BarraPasos>
    </>
  );
}
