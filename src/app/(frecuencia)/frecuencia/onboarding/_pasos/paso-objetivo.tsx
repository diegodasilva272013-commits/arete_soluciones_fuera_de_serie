'use client';

/**
 * Nota de reuso: el pedido decía elegir el área "con ArcFlowCarousel,
 * reusar". Ese componente es una galería de imágenes arrastrable (cada
 * item necesita `src`) sin onSelect/activeIndex — no tiene forma de
 * "elegir una opción" y las áreas no tienen imagen. Forzarlo hubiera
 * significado inventarle imágenes a las áreas o reescribir su interior
 * (compartido con /empresa/equipo, no lo quise arriesgar). Se eligió
 * con chips seleccionables, mismo patrón visual que el Ecualizador.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PreguntaUnica } from '../_pregunta-unica';
import { guardarObjetivo } from '../../actions';
import { siguienteRuta } from '../_navegacion';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import type { AreaVida, PreguntaConClave } from '@/types/frecuencia';
import { BarraPasos } from '../../_barra-pasos';

export function PasoObjetivo({
  preguntas,
  preguntaSinProposito,
  areas,
}: {
  preguntas: PreguntaConClave[]; // imagen_mental, fecha_limite, area_key, identidad_que_expresa
  preguntaSinProposito: string;
  areas: AreaVida[];
}) {
  const router = useRouter();
  const [sinProposito, setSinProposito] = useState(false);
  const [indice, setIndice] = useState(0);
  const [imagenMental, setImagenMental] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [areaKey, setAreaKey] = useState<string | null>(null);
  const [identidadQueExpresa, setIdentidadQueExpresa] = useState('');
  const [respuestaSinProposito, setRespuestaSinProposito] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <PreguntaUnica claveAnimacion="sin_proposito" pregunta={preguntaSinProposito}>
          <textarea
            className={base.textarea}
            value={respuestaSinProposito}
            onChange={(e) => setRespuestaSinProposito(e.target.value)}
            autoFocus
          />
        </PreguntaUnica>

        {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 12 }}>{error}</p>}

        <BarraPasos>
          <button type="button" className={base.btnGhost} onClick={() => setSinProposito(false)}>
            {copy.botones.volverAlObjetivo}
          </button>
          <button
            type="button"
            className={base.btn}
            disabled={guardando}
            onClick={() => {
              if (!respuestaSinProposito.trim()) {
                setError(copy.estados.campoRequerido);
                return;
              }
              guardarYContinuar({
                imagenMental: respuestaSinProposito,
                fechaLimite: null,
                areaKey: null,
                identidadQueExpresa: null,
              });
            }}
          >
            {guardando ? copy.botones.guardando : copy.botones.continuar}
          </button>
        </BarraPasos>
      </div>
    );
  }

  const actual = preguntas[indice];
  const esUltima = indice === preguntas.length - 1;

  function validarPasoActual(): boolean {
    if (actual.key === 'imagen_mental') return imagenMental.trim().length > 0;
    if (actual.key === 'fecha_limite') return fechaLimite.trim().length > 0;
    if (actual.key === 'area_key') return !!areaKey;
    if (actual.key === 'identidad_que_expresa') return identidadQueExpresa.trim().length > 0;
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
      imagenMental,
      fechaLimite: fechaLimite || null,
      areaKey,
      identidadQueExpresa: identidadQueExpresa || null,
    });
  }

  return (
    <div>
      <PreguntaUnica claveAnimacion={actual.key} pregunta={actual.pregunta}>
        {actual.key === 'imagen_mental' && (
          <textarea className={base.textarea} value={imagenMental} onChange={(e) => setImagenMental(e.target.value)} autoFocus />
        )}
        {actual.key === 'fecha_limite' && (
          <input type="date" className={base.input} value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} autoFocus />
        )}
        {actual.key === 'area_key' && (
          <div className={base.areasFila}>
            {areas.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`${base.areaChip} ${areaKey === a.key ? base.areaChipElegido : ''}`}
                onClick={() => setAreaKey(a.key)}
              >
                {a.nombre}
              </button>
            ))}
          </div>
        )}
        {actual.key === 'identidad_que_expresa' && (
          <textarea
            className={base.textarea}
            value={identidadQueExpresa}
            onChange={(e) => setIdentidadQueExpresa(e.target.value)}
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
          {guardando ? copy.botones.guardando : esUltima ? copy.botones.terminar : copy.botones.siguiente}
        </button>
      </BarraPasos>

      {indice === 0 && (
        <div style={{ marginTop: 16 }}>
          <button type="button" className={base.btnGhost} onClick={() => setSinProposito(true)}>
            {copy.botones.noTengoObjetivoClaro}
          </button>
        </div>
      )}
    </div>
  );
}
