'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PreguntaUnica } from '../_pregunta-unica';
import { ListaChips } from '../_lista-chips';
import { guardarIdentidad } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import { BarraPasos } from '../../_barra-pasos';

export function PasoNoNegociables({
  preguntaNoNegociables,
  ayudaNoNegociables,
  preguntaEstandarMinimo,
  ayudaEstandarMinimo,
  noNegociablesIniciales,
  estandarMinimoInicial,
}: {
  preguntaNoNegociables: string;
  ayudaNoNegociables: string;
  preguntaEstandarMinimo: string;
  ayudaEstandarMinimo: string;
  noNegociablesIniciales: string[];
  estandarMinimoInicial: string[];
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [noNegociables, setNoNegociables] = useState(noNegociablesIniciales);
  const [estandarMinimo, setEstandarMinimo] = useState(estandarMinimoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esUltima = indice === 1;

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
    <div>
      {indice === 0 ? (
        <PreguntaUnica claveAnimacion="no_negociables" pregunta={preguntaNoNegociables} ayuda={ayudaNoNegociables}>
          <ListaChips valores={noNegociables} onCambiar={setNoNegociables} />
        </PreguntaUnica>
      ) : (
        <PreguntaUnica claveAnimacion="estandar_minimo" pregunta={preguntaEstandarMinimo} ayuda={ayudaEstandarMinimo}>
          <ListaChips valores={estandarMinimo} onCambiar={setEstandarMinimo} />
        </PreguntaUnica>
      )}

      {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <BarraPasos>
        {indice > 0 && (
          <button type="button" className={base.btnSec} onClick={() => setIndice(0)}>
            {copy.botones.atras}
          </button>
        )}
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.continuar : copy.botones.siguiente}
        </button>
      </BarraPasos>
    </div>
  );
}
