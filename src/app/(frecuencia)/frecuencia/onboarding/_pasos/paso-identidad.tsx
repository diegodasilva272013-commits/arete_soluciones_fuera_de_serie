'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PreguntaUnica } from '../_pregunta-unica';
import { guardarIdentidad } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import type { PreguntaConClave } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

const CAMPO_POR_KEY: Record<string, 'quienCreiaSer' | 'quienSoy' | 'comoMeVen' | 'quienQuieroSer'> = {
  quien_creia_ser: 'quienCreiaSer',
  quien_soy: 'quienSoy',
  como_me_ven: 'comoMeVen',
  quien_quiero_ser: 'quienQuieroSer',
};

export function PasoIdentidad({
  preguntas,
  valoresIniciales,
}: {
  preguntas: PreguntaConClave[];
  valoresIniciales: Record<string, string>;
}) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>(valoresIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actual = preguntas[indice];
  const esUltima = indice === preguntas.length - 1;
  const valorActual = respuestas[actual.key] ?? '';

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
    const payload = Object.fromEntries(
      Object.entries(respuestas).map(([key, val]) => [CAMPO_POR_KEY[key], val])
    );
    const r = await guardarIdentidad(payload);
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('identidad'));
  }

  return (
    <div>
      <PreguntaUnica claveAnimacion={actual.key} pregunta={actual.pregunta}>
        <textarea
          className={base.textarea}
          value={valorActual}
          onChange={(e) => setRespuestas((prev) => ({ ...prev, [actual.key]: e.target.value }))}
          autoFocus
        />
      </PreguntaUnica>

      {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 12 }}>{error}</p>}

      <BarraPasos>
        {indice > 0 && (
          <button type="button" className={base.btnSec} onClick={() => setIndice((i) => i - 1)}>
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
