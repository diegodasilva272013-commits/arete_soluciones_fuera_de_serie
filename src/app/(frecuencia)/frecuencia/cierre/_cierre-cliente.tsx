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
import { agregarEvidenciaManual, guardarAprendizaje, guardarDial, guardarEspejo, guardarReflexionFalla } from '../actions';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_cierre.module.css';
import type { EnergiaEscasez, PasoAnteFalla } from '@/types/frecuencia';
import type { TipoBloque } from '@/lib/frecuencia/plan';
import { BarraPasos } from '../_barra-pasos';
import { CapaFija } from '../_shell';

export interface EvidenciaDelDia {
  id: string;
  texto: string;
  tipo: string;
  creadoEn: string;
}

export interface BloqueDelDia {
  id: string;
  tipo: TipoBloque;
  inicio: string;
  fin: string;
  titulo: string;
}

type Paso = 'registro' | 'aprendiste' | 'dial_noche' | 'disenar_manana' | 'pasos_falla' | 'completo';

function horaCorta(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
}

export function CierreCliente({
  evidencia: evidenciaInicial,
  aprendizajes: aprendizajesIniciales,
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
  aprendizajes: EvidenciaDelDia[];
  bloquesManana: BloqueDelDia[];
  huboFalla: boolean;
  pasosAnteFalla: PasoAnteFalla[];
  dialValorInicial: number;
  energiasGuardadasIniciales: Record<string, number>;
  energiasDisponibles: EnergiaEscasez[];
  accionesSubida: string[];
  timezone: string;
}) {
  const pasos: Paso[] = ['registro', 'aprendiste', 'dial_noche', 'disenar_manana', ...(huboFalla ? (['pasos_falla'] as const) : []), 'completo'];
  const [indice, setIndice] = useState(0);
  const paso = pasos[indice];

  const [evidencia, setEvidencia] = useState(evidenciaInicial);
  const [aprendizajes, setAprendizajes] = useState(aprendizajesIniciales);
  const [textoAprendizaje, setTextoAprendizaje] = useState('');
  const [guardandoAprendizaje, setGuardandoAprendizaje] = useState(false);
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

  async function agregarAprendizaje(): Promise<boolean> {
    const texto = textoAprendizaje.trim();
    if (!texto) return true;
    setGuardandoAprendizaje(true);
    const r = await guardarAprendizaje(texto);
    setGuardandoAprendizaje(false);
    if (r.error) return false;
    setAprendizajes((prev) => [...prev, { id: `local-${prev.length}`, texto, tipo: 'APRENDIZAJE', creadoEn: new Date().toISOString() }]);
    setTextoAprendizaje('');
    return true;
  }

  async function agregarManual() {
    if (!textoManual.trim()) return;
    setGuardandoManual(true);
    const r = await agregarEvidenciaManual(textoManual);
    setGuardandoManual(false);
    if (!r.error) {
      setEvidencia((prev) => [...prev, { id: `local-${prev.length}`, texto: textoManual.trim(), tipo: 'MANUAL', creadoEn: new Date().toISOString() }]);
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
      <CapaFija>
        <div className={base.progresoWrap}>
          <div className={base.progresoBarra} style={{ width: `${((indice + 1) / pasos.length) * 100}%` }} />
        </div>
      </CapaFija>
      {paso !== 'completo' && <p className={base.ayuda}>{copy.cierre.pasoDe(indice + 1, pasos.length)}</p>}

      {paso === 'registro' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.registro.subtitulo}</p>

          {evidencia.length === 0 ? (
            <p className={`${base.ayuda} ${s.vacio}`}>{copy.cierre.registro.vacio}</p>
          ) : (
            <ol className={s.bitacora}>
              {evidencia.map((e, i) => (
                <li key={e.id} className={s.bitacoraFila} style={{ ['--i' as string]: i }}>
                  <span className={s.bitacoraHora}>{horaCorta(e.creadoEn, timezone)}</span>
                  <span className={s.bitacoraNodo} aria-hidden />
                  <div className={s.bitacoraCuerpo}>
                    <p className={s.evidenciaTexto}>{e.texto}</p>
                    <span className={s.evidenciaTipo}>{copy.cierre.registro.tipoLabel[e.tipo] ?? copy.cierre.registro.tipoDesconocido}</span>
                  </div>
                </li>
              ))}
            </ol>
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
          <BarraPasos>
            <button type="button" className={base.btnSec} onClick={agregarManual} disabled={guardandoManual}>
              {guardandoManual ? copy.botones.guardando : copy.cierre.registro.agregar}
            </button>
            <button type="button" className={base.btn} onClick={avanzar}>
              {copy.botones.siguiente}
            </button>
          </BarraPasos>
        </div>
      )}

      {paso === 'aprendiste' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.aprendiste.subtitulo}</p>

          {aprendizajes.length === 0 ? (
            <p className={`${base.ayuda} ${s.vacio}`}>{copy.cierre.aprendiste.vacio}</p>
          ) : (
            <ul className={s.aprendizajes}>
              {aprendizajes.map((a, i) => (
                <li key={a.id} className={s.aprendizaje} style={{ ['--i' as string]: i }}>
                  {a.texto}
                </li>
              ))}
            </ul>
          )}

          <div className={base.campo}>
            <label className={base.campoLabel} htmlFor="aprendizaje">
              {copy.cierre.aprendiste.label}
            </label>
            <textarea
              id="aprendizaje"
              className={base.textarea}
              value={textoAprendizaje}
              onChange={(ev) => setTextoAprendizaje(ev.target.value)}
              placeholder={copy.cierre.aprendiste.placeholder}
            />
          </div>
          <BarraPasos>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
            <button type="button" className={base.btnSec} onClick={agregarAprendizaje} disabled={guardandoAprendizaje || !textoAprendizaje.trim()}>
              {guardandoAprendizaje ? copy.botones.guardando : copy.cierre.aprendiste.agregar}
            </button>
            <button
              type="button"
              className={base.btn}
              disabled={guardandoAprendizaje}
              onClick={async () => {
                if (await agregarAprendizaje()) avanzar();
              }}
            >
              {copy.botones.siguiente}
            </button>
          </BarraPasos>
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
            onAtras={retroceder}
          />
        </div>
      )}

      {paso === 'disenar_manana' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.cierre.disenarManana.subtitulo}</p>

          {bloquesManana.length === 0 ? (
            <p className={`${base.ayuda} ${s.vacio}`}>
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

          <BarraPasos>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
            <button type="button" className={base.btn} onClick={guardarVestimentaYAvanzar} disabled={guardandoVestimenta}>
              {guardandoVestimenta ? copy.botones.guardando : copy.botones.continuar}
            </button>
          </BarraPasos>
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

          <BarraPasos>
            <button type="button" className={base.btn} onClick={responderPasoFalla} disabled={guardandoFalla}>
              {guardandoFalla ? copy.botones.guardando : copy.botones.continuar}
            </button>
          </BarraPasos>
        </div>
      )}

      {paso === 'completo' && (
        <div className={s.completoWrap}>
          <CapaFija>
            <div className={s.apagon} aria-hidden>
              <span className={s.apagonLinea} />
            </div>
          </CapaFija>
          <p className={s.finEtiqueta}>{copy.cierre.completo.finTransmision}</p>
          <h2 className={base.titulo}>{copy.cierre.completo.titulo}</h2>
          <p className={`${base.subtitulo} ${s.completoSub}`}>
            {copy.cierre.completo.subtitulo}
          </p>
          <BarraPasos centrada>
            <Link href="/frecuencia/hoy" className={base.btn}>
              {copy.cierre.completo.irAHoy}
            </Link>
          </BarraPasos>
        </div>
      )}
    </div>
  );
}
