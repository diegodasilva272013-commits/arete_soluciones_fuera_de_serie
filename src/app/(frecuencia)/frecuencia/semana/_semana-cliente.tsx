'use client';

/**
 * Grilla de la Semana: días en columnas, horas en filas (posicionado
 * absoluto dentro de cada columna, no un <table> — así un bloque de
 * 90 minutos ocupa 90 minutos reales de alto, no una fila entera).
 * Mobile: scroll horizontal día por día con scroll-snap (CSS puro, ver
 * _semana.module.css) — efecto nuevo, solo en esta pantalla.
 */

import { useState } from 'react';
import { DIAS_SEMANA, type BloquePropuesto, type DiaSemana, type TipoBloque } from '@/lib/frecuencia/plan';
import { proponerSemana, confirmarSemana, borrarBloque, guardarNoNegociablesConHorario } from '../actions';
import type { NoNegociableGuardado } from '@/types/frecuencia';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_semana.module.css';
import { BarraPasos } from '../_barra-pasos';
import { useFlujoActivo } from '../_shell';

export interface BloqueDeSemana {
  id: string;
  tareaId: string | null;
  tipo: TipoBloque;
  inicio: string; // ISO, UTC
  fin: string;
  estado: string;
  titulo: string;
}

const HORA_INICIO_GRILLA = 5;
const HORA_FIN_GRILLA = 23;
const ALTURA_HORA_PX = 56;

const NOMBRE_DIA_A_INDICE: Record<string, number> = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };

function partesLocales(fechaISO: string, timezone: string): { diaIndex: number; minutos: number } {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false });
  const partes = fmt.formatToParts(new Date(fechaISO));
  const weekday = partes.find((p) => p.type === 'weekday')!.value;
  const hora = Number(partes.find((p) => p.type === 'hour')!.value) % 24;
  const minuto = Number(partes.find((p) => p.type === 'minute')!.value);
  return { diaIndex: NOMBRE_DIA_A_INDICE[weekday], minutos: hora * 60 + minuto };
}

function estiloPosicion(minutosInicio: number, minutosFin: number) {
  const inicioGrilla = HORA_INICIO_GRILLA * 60;
  const top = ((minutosInicio - inicioGrilla) / 60) * ALTURA_HORA_PX;
  const alto = ((minutosFin - minutosInicio) / 60) * ALTURA_HORA_PX;
  return { top: `${top}px`, height: `${Math.max(alto, 18)}px` };
}

function claseBloque(tipo: TipoBloque) {
  if (tipo === 'NO_NEGOCIABLE') return s.bloqueNoNegociable;
  if (tipo === 'EJECUTAR') return s.bloqueEjecutar;
  if (tipo === 'ORQUESTAR') return s.bloqueOrquestar;
  return s.bloqueImprevistos;
}

export function SemanaCliente({
  bloquesIniciales,
  noNegociablesIniciales,
  lunesSemana,
  timezone,
}: {
  bloquesIniciales: BloqueDeSemana[];
  noNegociablesIniciales: NoNegociableGuardado[];
  lunesSemana: string;
  timezone: string;
}) {
  const [bloques, setBloques] = useState(bloquesIniciales);
  const [noNegociables, setNoNegociables] = useState(noNegociablesIniciales);
  const [propuesta, setPropuesta] = useState<BloquePropuesto[] | null>(null);
  const [armando, setArmando] = useState(false);
  const [guardandoPropuesta, setGuardandoPropuesta] = useState(false);
  const [guardandoNoNeg, setGuardandoNoNeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevoTexto, setNuevoTexto] = useState('');
  // Revisar/confirmar la semana propuesta es un flujo: sin dock, barra fija abajo.
  useFlujoActivo(propuesta !== null);

  const horas = Array.from({ length: HORA_FIN_GRILLA - HORA_INICIO_GRILLA }, (_, i) => HORA_INICIO_GRILLA + i);
  const hoyIndex = NOMBRE_DIA_A_INDICE[new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date())];

  async function armar() {
    setArmando(true);
    setError(null);
    const r = await proponerSemana();
    setArmando(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    setPropuesta(r.bloques);
  }

  async function confirmar() {
    if (!propuesta) return;
    setGuardandoPropuesta(true);
    const r = await confirmarSemana(propuesta);
    setGuardandoPropuesta(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    setPropuesta(null);
    window.location.reload();
  }

  async function eliminarBloque(id: string) {
    if (!window.confirm(copy.semana.confirmarBorrarBloque)) return;
    const r = await borrarBloque(id);
    if (!r.error) setBloques((prev) => prev.filter((b) => b.id !== id));
  }

  function agregarNoNegociable() {
    const texto = nuevoTexto.trim();
    if (!texto) return;
    setNoNegociables((prev) => [...prev, { texto, dia: null, horaInicio: null, horaFin: null }]);
    setNuevoTexto('');
  }

  function actualizarNoNegociable(i: number, cambios: Partial<NoNegociableGuardado>) {
    setNoNegociables((prev) => prev.map((n, idx) => (idx === i ? { ...n, ...cambios } : n)));
  }

  function quitarNoNegociable(i: number) {
    setNoNegociables((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function guardarNoNegociables() {
    setGuardandoNoNeg(true);
    const r = await guardarNoNegociablesConHorario(noNegociables);
    setGuardandoNoNeg(false);
    if (r.error) setError(copy.estados.error);
  }

  return (
    <div>
      <div className={s.cabecera}>
        <button type="button" className={base.btn} onClick={armar} disabled={armando}>
          {armando ? copy.semana.armando : copy.semana.armar}
        </button>
      </div>

      {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 12 }}>{error}</p>}

      {propuesta && (
        <div className={s.propuestaOverlay}>
          <p className={base.campoLabel} style={{ margin: 0 }}>
            {copy.semana.propuestaTitulo}
          </p>
          <div className={s.propuestaLista}>
            {propuesta.map((b, i) => (
              <div key={i} className={s.propuestaFila}>
                <span className={s.propuestaFilaTitulo}>
                  {copy.semana.tipoLabel[b.tipo]} — {b.titulo}
                </span>
                <span className={s.propuestaFilaCuando}>
                  {copy.semana.diasLabel[b.dia]} {b.horaInicio}–{b.horaFin}
                </span>
              </div>
            ))}
          </div>
          <BarraPasos>
            <button type="button" className={base.btn} onClick={confirmar} disabled={guardandoPropuesta}>
              {guardandoPropuesta ? copy.botones.guardando : copy.semana.confirmarPropuesta}
            </button>
            <button type="button" className={base.btnGhost} onClick={() => setPropuesta(null)}>
              {copy.semana.descartarPropuesta}
            </button>
          </BarraPasos>
        </div>
      )}

      {bloques.length === 0 && !propuesta && (
        <p className={base.ayuda} style={{ marginTop: 20 }}>
          {copy.semana.vacia}
        </p>
      )}

      <div className={s.grillaScroll}>
        <div className={s.columnaHoras}>
          <div className={s.horaLabelCabecera} />
          {horas.map((h) => (
            <div key={h} className={s.horaLabel}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {DIAS_SEMANA.map((dia, diaIndex) => (
          <div key={dia} className={s.dia}>
            <div className={diaIndex === hoyIndex ? s.diaNombreHoy : s.diaNombre}>{copy.semana.diasLabel[dia]}</div>
            <div className={s.diaCuerpo} style={{ height: horas.length * ALTURA_HORA_PX }}>
              {horas.map((h) => (
                <div key={h} className={s.lineaHora} />
              ))}
              {bloques
                .filter((b) => partesLocales(b.inicio, timezone).diaIndex === diaIndex)
                .map((b) => {
                  const inicio = partesLocales(b.inicio, timezone).minutos;
                  const fin = partesLocales(b.fin, timezone).minutos;
                  return (
                    <div
                      key={b.id}
                      className={claseBloque(b.tipo)}
                      style={estiloPosicion(inicio, fin)}
                      onClick={() => eliminarBloque(b.id)}
                      title={copy.semana.confirmarBorrarBloque}
                    >
                      <div className={s.bloqueTitulo}>{b.titulo}</div>
                      <div className={s.bloqueHora}>
                        {String(Math.floor(inicio / 60)).padStart(2, '0')}:{String(inicio % 60).padStart(2, '0')}–
                        {String(Math.floor(fin / 60)).padStart(2, '0')}:{String(fin % 60).padStart(2, '0')}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className={base.panel} style={{ marginTop: 32 }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: '0 0 6px' }}>
          {copy.semana.noNegociablesTitulo}
        </p>
        <p className={base.ayuda} style={{ marginTop: 0 }}>
          {copy.semana.noNegociablesAyuda}
        </p>

        {noNegociables.map((n, i) => (
          <div key={i} className={s.noNegociableFila}>
            <span className={s.noNegociableTexto}>{n.texto}</span>
            <select className={s.selectHora} value={n.dia ?? ''} onChange={(e) => actualizarNoNegociable(i, { dia: (e.target.value || null) as DiaSemana | null })}>
              <option value="">—</option>
              {DIAS_SEMANA.map((d) => (
                <option key={d} value={d}>
                  {copy.semana.diasLabel[d]}
                </option>
              ))}
            </select>
            <input type="time" className={s.selectHora} value={n.horaInicio ?? ''} onChange={(e) => actualizarNoNegociable(i, { horaInicio: e.target.value || null })} />
            <input type="time" className={s.selectHora} value={n.horaFin ?? ''} onChange={(e) => actualizarNoNegociable(i, { horaFin: e.target.value || null })} />
            <button type="button" className={base.chipQuitar} onClick={() => quitarNoNegociable(i)} aria-label={copy.botones.quitar}>
              ×
            </button>
            {(!n.dia || !n.horaInicio || !n.horaFin) && (
              <p className={base.ayuda} style={{ margin: 0, flexBasis: '100%' }}>
                {copy.semana.sinAgendar}
              </p>
            )}
          </div>
        ))}

        <div className={base.campo}>
          <input
            className={base.input}
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarNoNegociable();
              }
            }}
            placeholder={copy.semana.nuevoNoNegociablePlaceholder}
          />
        </div>

        <div className={base.filaBotones}>
          <button type="button" className={base.btnSec} onClick={agregarNoNegociable}>
            {copy.semana.agregarNoNegociable}
          </button>
          <button type="button" className={base.btn} onClick={guardarNoNegociables} disabled={guardandoNoNeg}>
            {guardandoNoNeg ? copy.botones.guardando : copy.semana.guardarNoNegociables}
          </button>
        </div>
      </div>
    </div>
  );
}
