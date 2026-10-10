'use client';

/**
 * Grilla de la Semana: días en columnas, horas en filas (posicionado
 * absoluto dentro de cada columna, no un <table> — así un bloque de
 * 90 minutos ocupa 90 minutos reales de alto, no una fila entera).
 * Mobile: scroll horizontal día por día con scroll-snap (CSS puro, ver
 * _semana.module.css) — efecto nuevo, solo en esta pantalla.
 */

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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

function minutosDeHora(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutosAhora(timezone: string): number {
  return partesLocales(new Date().toISOString(), timezone).minutos;
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
  const router = useRouter();
  const [bloques, setBloques] = useState(bloquesIniciales);
  useEffect(() => {
    setBloques(bloquesIniciales);
    setPropuesta(null);
  }, [bloquesIniciales]);
  const grillaRef = useRef<HTMLDivElement>(null);
  const [ahoraMin, setAhoraMin] = useState<number | null>(null);
  const [noNegociables, setNoNegociables] = useState(noNegociablesIniciales);
  const [propuesta, setPropuesta] = useState<BloquePropuesto[] | null>(null);
  const [armando, setArmando] = useState(false);
  const [refrescando, iniciarRefresco] = useTransition();
  const [guardandoPropuesta, setGuardandoPropuesta] = useState(false);
  const [guardandoNoNeg, setGuardandoNoNeg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevoTexto, setNuevoTexto] = useState('');
  // Revisar/confirmar la semana propuesta es un flujo: sin dock, barra fija abajo.
  useFlujoActivo(propuesta !== null);

  const horas = Array.from({ length: HORA_FIN_GRILLA - HORA_INICIO_GRILLA }, (_, i) => HORA_INICIO_GRILLA + i);
  const hoyIndex = NOMBRE_DIA_A_INDICE[new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(new Date())];

  // La línea de AHORA se mueve sola con la hora de la persona.
  useEffect(() => {
    setAhoraMin(minutosAhora(timezone));
    const id = setInterval(() => setAhoraMin(minutosAhora(timezone)), 30000);
    return () => clearInterval(id);
  }, [timezone]);

  // En celular se ve un día por vez: arranca parado en hoy.
  useEffect(() => {
    const cont = grillaRef.current;
    const hoyEl = cont?.querySelector<HTMLElement>('[data-hoy="true"]');
    if (!cont || !hoyEl || cont.scrollWidth <= cont.clientWidth) return;
    cont.scrollLeft = hoyEl.offsetLeft - 44;
  }, []);

  // Al abrir, la pantalla se acomoda para que la línea de AHORA quede a la vista.
  const yaAcomodo = useRef(false);
  useEffect(() => {
    if (ahoraMin === null || yaAcomodo.current) return;
    yaAcomodo.current = true;
    const el = grillaRef.current?.querySelector<HTMLElement>('[data-ahora]');
    if (!el) return;
    const base = grillaRef.current!.getBoundingClientRect().top + window.scrollY;
    const ahoraY = el.getBoundingClientRect().top + window.scrollY;
    // Primero se ve el encabezado de la grilla; si AHORA queda muy abajo, se baja hasta él.
    const y = ahoraY - base > window.innerHeight * 0.65 ? ahoraY - window.innerHeight * 0.55 : base - 72;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (y > window.scrollY + 40) window.scrollTo({ top: y, behavior: reducido ? 'auto' : 'smooth' });
  }, [ahoraMin]);

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
    // En celular se ve un día por vez: se lleva la grilla al primer día de la propuesta.
    const primero = DIAS_SEMANA.findIndex((d) => r.bloques.some((b) => b.dia === d));
    const cont = grillaRef.current;
    const col = cont?.querySelectorAll<HTMLElement>('[data-dia]')[primero];
    if (cont && col && cont.scrollWidth > cont.clientWidth) cont.scrollLeft = col.offsetLeft - 44;
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
    // La vista previa se queda hasta que llegan los bloques reales (sin parpadeo).
    iniciarRefresco(() => {
      router.refresh();
    });
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

      <ul className={s.leyenda} aria-label={copy.semana.leyenda}>
        {(['NO_NEGOCIABLE', 'EJECUTAR', 'ORQUESTAR', 'IMPREVISTOS'] as TipoBloque[]).map((t) => (
          <li key={t} className={`${claseBloque(t)} ${s.leyendaChip}`}>
            {copy.semana.tipoLabel[t]}
          </li>
        ))}
      </ul>

      {error && <p className={s.error} role="alert">{error}</p>}

      {propuesta && (
        <div className={s.propuestaOverlay}>
          <p className={`${base.campoLabel} ${s.propuestaTitulo}`}>
            {copy.semana.propuestaTitulo}
          </p>
          <div className={s.propuestaLista}>
            {propuesta.map((b, i) => (
              <div key={i} className={s.propuestaFila}>
                <span className={s.propuestaFilaTitulo}>
                  {b.titulo === copy.semana.tipoLabel[b.tipo] ? b.titulo : `${copy.semana.tipoLabel[b.tipo]} — ${b.titulo}`}
                </span>
                <span className={s.propuestaFilaCuando}>
                  {copy.semana.diasLabel[b.dia]} {b.horaInicio}–{b.horaFin}
                </span>
              </div>
            ))}
          </div>
          <BarraPasos>
            <button type="button" className={base.btn} onClick={confirmar} disabled={guardandoPropuesta || refrescando}>
              {guardandoPropuesta || refrescando ? copy.botones.guardando : copy.semana.confirmarPropuesta}
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

      <div className={s.grillaScroll} ref={grillaRef}>
        <div className={s.columnaHoras}>
          <div className={s.horaLabelCabecera} />
          {horas.map((h) => (
            <div key={h} className={s.horaLabel}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {DIAS_SEMANA.map((dia, diaIndex) => (
          <div key={dia} className={`${s.dia} ${diaIndex === hoyIndex ? s.diaHoy : ''}`} data-hoy={diaIndex === hoyIndex} data-dia={dia}>
            <div className={diaIndex === hoyIndex ? s.diaNombreHoy : s.diaNombre}>{copy.semana.diasLabel[dia]}</div>
            <div className={s.diaCuerpo} style={{ height: horas.length * ALTURA_HORA_PX }}>
              {diaIndex === hoyIndex && ahoraMin !== null && ahoraMin >= HORA_INICIO_GRILLA * 60 && ahoraMin <= HORA_FIN_GRILLA * 60 && (
                <div className={s.ahora} data-ahora style={{ top: `${((ahoraMin - HORA_INICIO_GRILLA * 60) / 60) * ALTURA_HORA_PX}px` }} aria-label={copy.semana.ahora}>
                  <span className={s.ahoraEtiqueta}>{copy.semana.ahora}</span>
                </div>
              )}
              {propuesta
                ?.filter((b) => b.dia === dia)
                .map((b, i) => (
                  <div
                    key={`p${i}`}
                    className={`${s.bloqueFantasma} ${claseBloque(b.tipo)}`}
                    style={{ ...estiloPosicion(minutosDeHora(b.horaInicio), minutosDeHora(b.horaFin)), ['--i' as string]: i }}
                    title={copy.semana.vistaPrevia}
                  >
                    <div className={s.bloqueTitulo}>{b.titulo}</div>
                  </div>
                ))}
              {horas.map((h) => (
                <div key={h} className={s.lineaHora} />
              ))}
              {bloques
                .filter((b) => partesLocales(b.inicio, timezone).diaIndex === diaIndex)
                .map((b, orden) => {
                  const inicio = partesLocales(b.inicio, timezone).minutos;
                  const fin = partesLocales(b.fin, timezone).minutos;
                  return (
                    <div
                      key={b.id}
                      className={claseBloque(b.tipo)}
                      style={{ ...estiloPosicion(inicio, fin), ['--i' as string]: orden }}
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

      <div className={`${base.panel} ${s.panelNoNeg}`}>
        <p className={s.noNegTitulo}>
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
