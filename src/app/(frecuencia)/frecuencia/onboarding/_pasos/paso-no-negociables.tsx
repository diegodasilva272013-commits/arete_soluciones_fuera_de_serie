'use client';

/**
 * Dos pantallas: no negociables y estándar mínimo. Cada ítem se escribe
 * en la línea de transmisión y entra a un registro numerado (01, 02…).
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PantallaPregunta } from '../_pantalla-pregunta';
import { LineaTransmision } from '../_linea-transmision';
import { BotonAtras } from '../_boton-atras';
import { guardarIdentidad } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_onboarding.module.css';
import type { PantallaCopy } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

function Registro({ valores, onCambiar, sugerencia, etiqueta }: { valores: string[]; onCambiar: (v: string[]) => void; sugerencia?: string; etiqueta?: string }) {
  const [borrador, setBorrador] = useState('');

  function agregar() {
    const v = borrador.trim();
    if (!v) return;
    onCambiar([...valores, v]);
    setBorrador('');
  }

  return (
    <div>
      <LineaTransmision tipo="linea" valor={borrador} onCambiar={setBorrador} onEnter={agregar} onSalir={agregar} sugerencia={sugerencia} etiqueta={etiqueta} autoFocus />
      <p className={s.registroAyuda}>{copy.onboarding.sumarItem}</p>
      {valores.length > 0 && (
        <ol className={s.registro}>
          {valores.map((v, i) => (
            <li key={`${v}-${i}`} className={s.registroItem}>
              <span className={s.registroNumero}>{String(i + 1).padStart(2, '0')}</span>
              <span className={s.registroTexto}>{v}</span>
              <button type="button" className={s.registroQuitar} onClick={() => onCambiar(valores.filter((_, idx) => idx !== i))} aria-label={`${copy.botones.quitar}: ${v}`}>
                        ×
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function PasoNoNegociables({
  noNegociablesCopy,
  estandarMinimoCopy,
  noNegociablesIniciales,
  estandarMinimoInicial,
  paso,
}: {
  noNegociablesCopy: PantallaCopy;
  estandarMinimoCopy: PantallaCopy;
  noNegociablesIniciales: string[];
  estandarMinimoInicial: string[];
  paso: { actual: number; total: number };
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [noNegociables, setNoNegociables] = useState(noNegociablesIniciales);
  const [estandarMinimo, setEstandarMinimo] = useState(estandarMinimoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esUltima = indice === 1;
  const c = indice === 0 ? noNegociablesCopy : estandarMinimoCopy;

  async function siguiente() {
    const listaActual = indice === 0 ? noNegociables : estandarMinimo;
    if (listaActual.length === 0) {
      setError(copy.estados.campoRequerido);
      return;
    }
    setError(null);

    if (!esUltima) {
      setIndice(1);
      return;
    }

    setGuardando(true);
    const r = await guardarIdentidad({ noNegociables, estandarMinimo });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('no_negociables'));
  }

  return (
    <>
      <PantallaPregunta
        claveAnimacion={indice === 0 ? 'no_negociables' : 'estandar_minimo'}
        kicker={c.kicker}
        gancho={c.gancho}
        razon={c.razon}
        pregunta={c.pregunta}
        ejemplo={c.ejemplo}
        paso={paso}
        subPaso={{ actual: indice + 1, total: 2 }}
        marca={String(paso.actual).padStart(2, '0')}
      >
        {indice === 0 ? (
          <Registro key="nn" valores={noNegociables} onCambiar={setNoNegociables} sugerencia={c.placeholder} etiqueta={c.pregunta} />
        ) : (
          <Registro key="em" valores={estandarMinimo} onCambiar={setEstandarMinimo} sugerencia={c.placeholder} etiqueta={c.pregunta} />
        )}
        {error && <p className={s.error} role="alert">{error}</p>}
      </PantallaPregunta>

      <BarraPasos>
        <BotonAtras paso="no_negociables" indice={indice} onAnterior={() => { setError(null); setIndice(0); }} />
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.continuar : copy.botones.siguiente}
        </button>
      </BarraPasos>
    </>
  );
}
