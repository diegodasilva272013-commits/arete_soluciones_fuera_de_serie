'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PreguntaUnica } from '../_pregunta-unica';
import { guardarEspejo } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import type { PreguntaConClave } from '@/types/frecuencia';

export function PasoEspejo({ preguntas }: { preguntas: PreguntaConClave[] }) {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
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
    const r = await guardarEspejo({
      comoMeVeo: respuestas['como_me_veo'] ?? '',
      comoMePercibo: respuestas['como_me_percibo'] ?? '',
      comoMeSiento: respuestas['como_me_siento'] ?? '',
    });
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    router.push(siguienteRuta('espejo'));
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

      <div className={base.filaBotones}>
        {indice > 0 && (
          <button type="button" className={base.btnSec} onClick={() => setIndice((i) => i - 1)}>
            {copy.botones.atras}
          </button>
        )}
        <button type="button" className={base.btn} onClick={siguiente} disabled={guardando}>
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.continuar : copy.botones.siguiente}
        </button>
      </div>
    </div>
  );
}
