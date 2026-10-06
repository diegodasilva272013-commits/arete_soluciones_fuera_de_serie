'use client';

/**
 * Cierre del día — wizard de un solo screen con pasos internos (no rutas
 * propias, a diferencia del onboarding): registro de emisión, dial de
 * la noche, diseñar mañana (bloques + vestimenta) y, si algo no salió
 * hoy, los 4 pasos ante falla antes de terminar.
 */

import Link from 'next/link';
import { useState } from 'react';
import { Dial } from '../_dial';
import { agregarEvidenciaManual, guardarDial, guardarEspejo, guardarReflexionFalla } from '../actions';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_cierre.module.css';
import type { EnergiaEscasez, PasoAnteFalla } from '@/types/frecuencia';
import type { TipoBloque } from '@/lib/frecuencia/plan';

export interface EvidenciaDelDia {
  id: string;
  texto: string;
  tipo: string;
}

export interface BloqueDelDia {
  id: string;
  tipo: TipoBloque;
  inicio: string;
  fin: string;
  titulo: string;
}

type Paso = 'registro' | 'dial_noche' | 'disenar_manana' | 'pasos_falla' | 'completo';

function horaCorta(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
}

export function CierreCliente({
  evidencia: evidenciaInicial,
  bloquesManana,
  huboFalla,
  pasosAnteFalla,
  dialValorInicial,
  energiasGuardadasIniciales,
  energiasDisponibles,
  accionesSubida,
  timezone,
}: {
  evidencia: EvidenciaDelDia[];
  bloquesManana: BloqueDelDia[];
  huboFalla: boolean;
  pasosAnteFalla: PasoAnteFalla[];
  dialValorInicial: number;
  energiasGuardadasIniciales: Record<string, number>;
  energiasDisponibles: EnergiaEscasez[];
  accionesSubida: string[];
  timezone: string;
}) {
  const pasos: Paso[] = ['registro', 'dial_noche', 'disenar_manana', ...(huboFalla ? (['pasos_falla'] as const) : []), 'completo'];
  const [indice, setIndice] = useState(0);
  const paso = pasos[indice];

  const [evidencia, setEvidencia] = useState(evidenciaInicial);
  const [textoManual, setTextoManual] = useState('');
  const [guardandoManual, setGuardandoManual] = useState(false);

  const [vestimenta, setVestimenta] = useState('');
  const [guardandoVestimenta, setGuardandoVestimenta] = useState(false);

  const [indiceFalla, setIndiceFalla] = useState(0);
  const [respuestaFalla, setRespuestaFalla] = useState('');
  const [guardandoFalla, setGuardandoFalla] = useState(false);

  function avanzar() {
    setIndice((i) => Math.min(i + 1, pasos.length - 1));
  }
  function retroceder() {
    setIndice((i) => Math.max(i - 1, 0));
  }

  async function agregarManual() {
    if (!textoManual.trim()) return;
    setGuardandoManual(true);
    const r = await agregarEvidenciaManual(textoManual);
    setGuardandoManual(false);
    if (!r.error) {
      setEvidencia((prev) => [...prev, { id: `local-${prev.length}`, texto: textoManual.trim(), tipo: 'MANUAL' }]);
      setTextoManual('');
    }
  }

  async function guardarVestimentaYAvanzar() {
    if (vestimenta.trim()) {
      setGuardandoVestimenta(true);
      await guardarEspejo({ vestimentaManana: vestimenta.trim() });
      setGuardandoVestimenta(false);
    }
    avanzar();
  }

  async function responderPasoFalla() {
    const actual = pasosAnteFalla[indiceFalla];
    if (respuestaFalla.trim()) {
      setGuardandoFalla(true);
      await guardarReflexionFalla(actual.paso, actual.nombre, respuestaFalla);
      setGuardandoFalla(false);
    }
    setRespuestaFalla('');
    if (indiceFalla < pasosAnteFalla.length - 1) {
      setIndiceFalla((i) => i + 1);
    } else {
      avanzar();
    }
  }

  return (
    <div>
      <div className={base.progresoWrap}>
        <div className={base.progresoBarra} style={{ width: `${((indice + 1) / pasos.length) * 100}%` }} />
      </div>
      {paso !== 'completo' && <p className={base.ayuda}>{copy.cierre.pasoDe(indice + 1, pasos.length)}</p>}

      {paso === 'registro' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.registro.subtitulo}</p>

          {evidencia.length === 0 ? (
            <p className={base.ayuda} style={{ marginTop: 20 }}>
              {copy.cierre.registro.vacio}
            </p>
          ) : (
            <div className={s.evidenciaLista}>
              {evidencia.map((e) => (
                <div key={e.id} className={s.evidenciaItem}>
                  <p className={s.evidenciaTexto}>{e.texto}</p>
                  <span className={s.evidenciaTipo}>{e.tipo}</span>
                </div>
              ))}
            </div>
          )}

          <div className={base.campo}>
            <label className={base.campoLabel}>{copy.cierre.registro.cargarManual}</label>
            <input
              className={base.input}
              value={textoManual}
              onChange={(ev) => setTextoManual(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  agregarManual();
                }
              }}
              placeholder={copy.cierre.registro.placeholderManual}
            />
          </div>
          <div className={base.filaBotones}>
            <button type="button" className={base.btnSec} onClick={agregarManual} disabled={guardandoManual}>
              {guardandoManual ? copy.botones.guardando : copy.cierre.registro.agregar}
            </button>
            <button type="button" className={base.btn} onClick={avanzar}>
              {copy.botones.siguiente}
            </button>
          </div>
        </div>
      )}

      {paso === 'dial_noche' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.dialNoche.subtitulo}</p>
          <Dial
            valorInicial={dialValorInicial}
            energiasGuardadasIniciales={energiasGuardadasIniciales}
            energiasDisponibles={energiasDisponibles}
            accionesSubida={accionesSubida}
            textoCta={copy.botones.continuar}
            onGuardar={guardarDial}
            onDespuesDeGuardar={avanzar}
          />
          <div className={base.filaBotones}>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
          </div>
        </div>
      )}

      {paso === 'disenar_manana' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.disenarManana.subtitulo}</p>

          {bloquesManana.length === 0 ? (
            <p className={base.ayuda} style={{ marginTop: 20 }}>
              {copy.cierre.disenarManana.vacioBloques}
            </p>
          ) : (
            <div className={s.bloquesManana}>
              {bloquesManana.map((b) => (
                <div key={b.id} className={s.bloqueManana}>
                  <span className={s.bloqueMananaHora}>
                    {horaCorta(b.inicio, timezone)}–{horaCorta(b.fin, timezone)}
                  </span>
                  <span className={s.bloqueMananaTitulo}>{b.titulo}</span>
                </div>
              ))}
            </div>
          )}

          <div className={base.campo}>
            <label className={base.campoLabel}>{copy.cierre.disenarManana.vestimentaLabel}</label>
            <input
              className={base.input}
              value={vestimenta}
              onChange={(ev) => setVestimenta(ev.target.value)}
              placeholder={copy.cierre.disenarManana.vestimentaPlaceholder}
            />
          </div>

          <div className={base.filaBotones}>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
            <button type="button" className={base.btn} onClick={guardarVestimentaYAvanzar} disabled={guardandoVestimenta}>
              {guardandoVestimenta ? copy.botones.guardando : copy.botones.continuar}
            </button>
          </div>
        </div>
      )}

      {paso === 'pasos_falla' && pasosAnteFalla[indiceFalla] && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.pasosAnteFalla.subtitulo}</p>

          <p className={s.pasoFallaNumero}>
            {copy.cierre.pasoDe(indiceFalla + 1, pasosAnteFalla.length)} — {pasosAnteFalla[indiceFalla].nombre}
          </p>
          <p className={s.pasoFallaDescripcion}>{pasosAnteFalla[indiceFalla].descripcion}</p>

          <div className={base.campo}>
            <textarea
              className={base.textarea}
              value={respuestaFalla}
              onChange={(ev) => setRespuestaFalla(ev.target.value)}
              placeholder={copy.cierre.pasosAnteFalla.placeholder}
            />
          </div>

          <div className={base.filaBotones}>
            <button type="button" className={base.btn} onClick={responderPasoFalla} disabled={guardandoFalla}>
              {guardandoFalla ? copy.botones.guardando : copy.botones.continuar}
            </button>
          </div>
        </div>
      )}

      {paso === 'completo' && (
        <div className={s.completoWrap}>
          <h2 className={base.titulo}>{copy.cierre.completo.titulo}</h2>
          <p className={base.subtitulo} style={{ margin: '12px auto 0' }}>
            {copy.cierre.completo.subtitulo}
          </p>
          <div className={base.filaBotones} style={{ justifyContent: 'center' }}>
            <Link href="/frecuencia/hoy" className={base.btn}>
              {copy.cierre.completo.irAHoy}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
