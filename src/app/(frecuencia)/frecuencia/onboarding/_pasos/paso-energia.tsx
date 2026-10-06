'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PreguntaUnica } from '../_pregunta-unica';
import { guardarEnergia } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import type { PreguntaConClave } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

export function PasoEnergia({
  preguntas,
  reglaSugerida,
  horaDespertarInicial,
  franjasIniciales,
}: {
  preguntas: PreguntaConClave[]; // hora_despertar, profundo, decision, creativo
  reglaSugerida: string;
  horaDespertarInicial: string;
  franjasIniciales: Record<string, string>;
}) {
  const router = useRouter();
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
        .map((p) => ({ tipo: p.key as 'profundo' | 'decision' | 'creativo', respuesta: franjas[p.key] ?? '' })),
    });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('energia'));
  }

  return (
    <div>
      <PreguntaUnica
        claveAnimacion={actual.key}
        pregunta={actual.pregunta}
        ayuda={actual.key === 'profundo' ? reglaSugerida : undefined}
      >
        {esHora ? (
          <input
            type="time"
            className={base.input}
            value={horaDespertar}
            onChange={(e) => setHoraDespertar(e.target.value)}
            autoFocus
          />
        ) : (
          <textarea
            className={base.textarea}
            value={franjas[actual.key] ?? ''}
            onChange={(e) => setFranjas((prev) => ({ ...prev, [actual.key]: e.target.value }))}
            autoFocus
          />
        )}
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
