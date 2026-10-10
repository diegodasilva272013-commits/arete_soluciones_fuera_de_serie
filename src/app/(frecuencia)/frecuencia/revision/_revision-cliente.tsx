'use client';

/**
 * Revisión semanal / ritual del domingo (7.2). Wizard de un solo screen
 * con pasos internos: la verdad (entrenamiento cumplido primero, avance
 * del objetivo después), qué funcionó y qué no, volver a puntuar las
 * áreas, rediagnóstico de energía (solo si toca) y armar la semana que
 * viene. Íntimo: todo con el cliente de sesión de la persona.
 */

import Link from 'next/link';
import { useState } from 'react';
import { Ecualizador } from '../_ecualizador';
import { guardarAreas, guardarEnergia, guardarRevision, proponerSemana, confirmarSemana } from '../actions';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_revision.module.css';
import type { AreaVida, AreasReglas } from '@/types/frecuencia';
import type { BloquePropuesto } from '@/lib/frecuencia/plan';
import { BarraPasos } from '../_barra-pasos';
import { CapaFija } from '../_shell';

export interface MetricasSemana {
  planificados: number;
  cumplidos: number;
  tareasConAvance: number;
  tareasTotal: number;
  porTarea: { titulo: string; planificados: number; cumplidos: number }[];
}
export interface PreguntaEnergia {
  key: string;
  pregunta: string;
  ayuda: string | null;
}

type Paso = 'verdad' | 'funciono' | 'areas' | 'energia' | 'semana' | 'completo';

function Medidor({ etiqueta, pct, detalle, grande }: { etiqueta: string; pct: number; detalle: string; grande?: boolean }) {
  return (
    <div className={`${s.medidor} ${grande ? s.medidorGrande : ''}`}>
      <p className={s.medidorEtiqueta}>{etiqueta}</p>
      <p className={s.medidorPct}>
        {pct}
        <span>%</span>
      </p>
      <div className={s.barra} role="img" aria-label={`${etiqueta}: ${pct}%`}>
        <div className={s.barraRelleno} style={{ width: `${pct}%` }} />
      </div>
      <p className={s.medidorDetalle}>{detalle}</p>
    </div>
  );
}

function ListaEditable({ etiqueta, placeholder, items, onCambiar, id }: { etiqueta: string; placeholder: string; items: string[]; onCambiar: (xs: string[]) => void; id: string }) {
  const [texto, setTexto] = useState('');
  function sumar() {
    const t = texto.trim();
    if (!t) return;
    onCambiar([...items, t]);
    setTexto('');
  }
  return (
    <div className={base.campo}>
      <label className={base.campoLabel} htmlFor={id}>
        {etiqueta}
      </label>
      {items.length > 0 && (
        <ul className={s.items}>
          {items.map((x, i) => (
            <li key={`${i}-${x}`} className={s.item}>
              <span>{x}</span>
              <button type="button" className={base.chipQuitar} onClick={() => onCambiar(items.filter((_, j) => j !== i))} aria-label={copy.botones.quitar}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        className={base.input}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            sumar();
          }
        }}
        placeholder={placeholder}
        maxLength={300}
      />
      <p className={base.ayuda}>{copy.revision.funciono.sumar}</p>
    </div>
  );
}

export function RevisionCliente({
  metricas,
  queFuncionoInicial,
  queNoInicial,
  areas,
  reglas,
  nivelesIniciales,
  palancaInicial,
  manzanaInicial,
  tocaEnergia: tocaEnergiaInicial,
  preguntasEnergia,
  horaDespertarInicial,
  franjasIniciales,
  semanaSiguienteYaArmada: semanaSiguienteYaArmadaInicial,
}: {
  metricas: MetricasSemana;
  queFuncionoInicial: string[];
  queNoInicial: string[];
  areas: AreaVida[];
  reglas: AreasReglas | null;
  nivelesIniciales: Record<string, number>;
  palancaInicial: string | null;
  manzanaInicial: string | null;
  tocaEnergia: boolean;
  preguntasEnergia: PreguntaEnergia[];
  horaDespertarInicial: string;
  franjasIniciales: Record<string, string>;
  semanaSiguienteYaArmada: boolean;
}) {
  // Los pasos se congelan al abrir: si no, al guardar la energía (que revalida la página) el paso desaparece y el índice salta.
  const [tocaEnergia] = useState(tocaEnergiaInicial);
  const [semanaSiguienteYaArmada] = useState(semanaSiguienteYaArmadaInicial);
  const pasos: Paso[] = ['verdad', 'funciono', 'areas', ...(tocaEnergia ? (['energia'] as const) : []), 'semana', 'completo'];
  const [indice, setIndice] = useState(0);
  const paso = pasos[indice];
  const avanzar = () => setIndice((i) => Math.min(i + 1, pasos.length - 1));
  const retroceder = () => setIndice((i) => Math.max(i - 1, 0));

  const [queFunciono, setQueFunciono] = useState(queFuncionoInicial);
  const [queNo, setQueNo] = useState(queNoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(false);

  const [horaDespertar, setHoraDespertar] = useState(horaDespertarInicial);
  const [franjas, setFranjas] = useState(franjasIniciales);

  const [propuesta, setPropuesta] = useState<BloquePropuesto[] | null>(null);
  const [armando, setArmando] = useState(false);

  const pctPrincipal = metricas.planificados ? Math.round((metricas.cumplidos / metricas.planificados) * 100) : 0;
  const pctSecundaria = metricas.tareasTotal ? Math.round((metricas.tareasConAvance / metricas.tareasTotal) * 100) : 0;

  async function guardarFuncionoYAvanzar() {
    setGuardando(true);
    setError(false);
    const r = await guardarRevision({ queFunciono, queNo });
    setGuardando(false);
    if (r.error) {
      setError(true);
      return;
    }
    avanzar();
  }

  async function guardarEnergiaYAvanzar() {
    setGuardando(true);
    setError(false);
    const r = await guardarEnergia({
      horaDespertar,
      franjas: preguntasEnergia.map((p) => ({ tipo: p.key as 'profundo' | 'decision' | 'creativo', respuesta: (franjas[p.key] ?? '').trim() })).filter((f) => f.respuesta),
    });
    setGuardando(false);
    if (r.error) {
      setError(true);
      return;
    }
    avanzar();
  }

  async function armar() {
    setArmando(true);
    setError(false);
    const r = await proponerSemana();
    setArmando(false);
    if (r.error) {
      setError(true);
      return;
    }
    setPropuesta(r.bloques);
  }

  async function guardarSemana() {
    if (!propuesta) return;
    setGuardando(true);
    setError(false);
    const r = await confirmarSemana(propuesta, true);
    if (!r.error) await guardarRevision({ queFunciono, queNo, cargaSiguiente: { bloques: propuesta.length, tareas: Array.from(new Set(propuesta.map((b) => b.titulo))).length } });
    setGuardando(false);
    if (r.error) {
      setError(true);
      return;
    }
    avanzar();
  }

  const mensajeError = error ? (
    <p className={s.error} role="alert">
      {copy.estados.error}
    </p>
  ) : null;

  return (
    <div>
      <CapaFija>
        <div className={base.progresoWrap}>
          <div className={base.progresoBarra} style={{ width: `${((indice + 1) / pasos.length) * 100}%` }} />
        </div>
      </CapaFija>
      {paso !== 'completo' && <p className={base.ayuda}>{copy.revision.pasoDe(indice + 1, pasos.length)}</p>}

      {paso === 'verdad' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.revision.verdad.subtitulo}</p>
          {metricas.planificados === 0 ? (
            <p className={`${base.ayuda} ${s.vacio}`}>{copy.revision.verdad.sinDatos}</p>
          ) : (
            <>
              <Medidor grande etiqueta={copy.revision.verdad.principal} pct={pctPrincipal} detalle={copy.revision.verdad.principalDetalle(metricas.cumplidos, metricas.planificados)} />
              <Medidor etiqueta={copy.revision.verdad.secundaria} pct={pctSecundaria} detalle={copy.revision.verdad.secundariaDetalle(metricas.tareasConAvance, metricas.tareasTotal)} />
              <p className={s.subEtiqueta}>{copy.revision.verdad.porTarea}</p>
              <ul className={s.items}>
                {metricas.porTarea.map((t) => (
                  <li key={t.titulo} className={s.fila}>
                    <span>{t.titulo}</span>
                    <span className={s.filaNumero}>
                      {t.cumplidos}/{t.planificados}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <BarraPasos>
            <button type="button" className={base.btn} onClick={avanzar}>
              {copy.botones.siguiente}
            </button>
          </BarraPasos>
        </div>
      )}

      {paso === 'funciono' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.revision.funciono.subtitulo}</p>
          <ListaEditable id="funciono" etiqueta={copy.revision.funciono.queFuncionoLabel} placeholder={copy.revision.funciono.queFuncionoPlaceholder} items={queFunciono} onCambiar={setQueFunciono} />
          <ListaEditable id="no-funciono" etiqueta={copy.revision.funciono.queNoLabel} placeholder={copy.revision.funciono.queNoPlaceholder} items={queNo} onCambiar={setQueNo} />
          {mensajeError}
          <BarraPasos>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
            <button type="button" className={base.btn} onClick={guardarFuncionoYAvanzar} disabled={guardando}>
              {guardando ? copy.botones.guardando : copy.botones.siguiente}
            </button>
          </BarraPasos>
        </div>
      )}

      {paso === 'areas' && (
        <div className={s.paso}>
          <p className={base.subtitulo}>{copy.revision.areas.subtitulo}</p>
          <Ecualizador
            areas={areas}
            reglas={reglas}
            nivelesIniciales={nivelesIniciales}
            palancaInicial={palancaInicial}
            manzanaInicial={manzanaInicial}
            textoCta={copy.botones.continuar}
            onGuardar={guardarAreas}
            onDespuesDeGuardar={avanzar}
            onAtras={retroceder}
          />
        </div>
      )}

      {paso === 'energia' && (
        <div className={s.paso}>
          <p className={s.subEtiqueta}>{copy.revision.energia.kicker}</p>
          <p className={base.subtitulo}>{copy.revision.energia.subtitulo}</p>
          <div className={base.campo}>
            <label className={base.campoLabel} htmlFor="hora-despertar">
              {copy.revision.energia.horaDespertar}
            </label>
            <input id="hora-despertar" type="time" className={base.input} value={horaDespertar} onChange={(e) => setHoraDespertar(e.target.value)} />
          </div>
          {preguntasEnergia.map((p) => (
            <div key={p.key} className={base.campo}>
              <label className={base.campoLabel} htmlFor={`franja-${p.key}`}>
                {p.pregunta}
              </label>
              <input id={`franja-${p.key}`} className={base.input} value={franjas[p.key] ?? ''} onChange={(e) => setFranjas((prev) => ({ ...prev, [p.key]: e.target.value }))} />
              {p.ayuda && <p className={base.ayuda}>{p.ayuda}</p>}
            </div>
          ))}
          {mensajeError}
          <BarraPasos>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
            <button type="button" className={base.btnGhost} onClick={avanzar} disabled={guardando}>
              {copy.revision.energia.saltear}
            </button>
            <button type="button" className={base.btn} onClick={guardarEnergiaYAvanzar} disabled={guardando || !horaDespertar}>
              {guardando ? copy.botones.guardando : copy.botones.continuar}
            </button>
          </BarraPasos>
        </div>
      )}

      {paso === 'semana' && (
        <div className={s.paso}>
          <p className={s.subEtiqueta}>{copy.revision.semana.titulo}</p>
          <p className={base.subtitulo}>{copy.revision.semana.subtitulo}</p>
          {semanaSiguienteYaArmada ? (
            <p className={`${base.ayuda} ${s.vacio}`}>{copy.revision.semana.yaArmada}</p>
          ) : propuesta ? (
            propuesta.length === 0 ? (
              <p className={`${base.ayuda} ${s.vacio}`}>{copy.revision.semana.sinNada}</p>
            ) : (
              <ul className={s.items}>
                {propuesta.map((b, i) => (
                  <li key={i} className={s.fila}>
                    <span>{b.titulo}</span>
                    <span className={s.filaNumero}>
                      {copy.semana.diasLabel[b.dia]} {b.horaInicio}–{b.horaFin}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className={base.filaBotones}>
              <button type="button" className={base.btn} onClick={armar} disabled={armando}>
                {armando ? copy.revision.semana.armando : copy.revision.semana.armar}
              </button>
            </div>
          )}
          {mensajeError}
          <BarraPasos>
            <button type="button" className={base.btnSec} onClick={retroceder}>
              {copy.botones.atras}
            </button>
            {semanaSiguienteYaArmada || (propuesta && propuesta.length === 0) ? (
              <button type="button" className={base.btn} onClick={avanzar}>
                {copy.botones.terminar}
              </button>
            ) : (
              <button type="button" className={base.btn} onClick={guardarSemana} disabled={!propuesta || guardando}>
                {guardando ? copy.botones.guardando : copy.revision.semana.guardar}
              </button>
            )}
          </BarraPasos>
        </div>
      )}

      {paso === 'completo' && (
        <div className={s.completo}>
          <h2 className={base.titulo}>{copy.revision.completo.titulo}</h2>
          <p className={`${base.subtitulo} ${s.completoSub}`}>{copy.revision.completo.subtitulo}</p>
          <BarraPasos centrada>
            <Link href="/frecuencia/semana" className={base.btn}>
              {copy.revision.completo.irASemana}
            </Link>
          </BarraPasos>
        </div>
      )}
    </div>
  );
}
