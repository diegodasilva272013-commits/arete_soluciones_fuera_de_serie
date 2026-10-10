'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { TipoBloque } from '@/lib/frecuencia/plan';
import type { DatosEnElAire } from '@/lib/frecuencia-semana';
import { estacionarIdea, salirAlAire, obtenerBloqueEnCurso } from '../actions';
import { copy } from '../_copy';
import { useFlujoActivo } from '../_shell';
import base from '../frecuencia.module.css';
import { DialMini } from './_dial-mini';
import { EnElAire } from './_en-el-aire';
import s from './_hoy.module.css';

export interface ItemLinea {
  id: string;
  tipo: TipoBloque;
  inicio: string;
  fin: string;
  estado: string;
  titulo: string;
  esActual: boolean;
}

function horaCorta(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
}

function esTareable(tipo: TipoBloque): boolean {
  return tipo === 'EJECUTAR' || tipo === 'ORQUESTAR';
}

export function HoyCliente({
  valorDialHoy,
  items,
  timezone,
  enElAireInicial,
}: {
  valorDialHoy: number | null;
  items: ItemLinea[];
  timezone: string;
  enElAireInicial: DatosEnElAire | null;
}) {
  const router = useRouter();
  const [textoIdea, setTextoIdea] = useState('');
  const [guardandoIdea, setGuardandoIdea] = useState(false);
  const [ideaGuardada, setIdeaGuardada] = useState(false);
  const [ideasAbiertas, setIdeasAbiertas] = useState(false);
  const [ahoraMs, setAhoraMs] = useState<number | null>(null);
  useEffect(() => {
    setAhoraMs(Date.now());
    const id = setInterval(() => setAhoraMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const [enElAire, setEnElAire] = useState<DatosEnElAire | null>(enElAireInicial);
  const [saliendo, setSaliendo] = useState<string | null>(null);
  // EN EL AIRE es un flujo a pantalla completa: sin dock mientras está abierto.
  useFlujoActivo(enElAire !== null);
  const [conflicto, setConflicto] = useState<{ bloqueEnCursoId: string; bloqueEnCursoTitulo: string } | null>(null);

  async function enviarIdea() {
    if (!textoIdea.trim()) return;
    setGuardandoIdea(true);
    setIdeaGuardada(false);
    const r = await estacionarIdea(textoIdea);
    setGuardandoIdea(false);
    if (!r.error) {
      setTextoIdea('');
      setIdeaGuardada(true);
    }
  }

  async function handleSalirAlAire(bloqueId: string) {
    setSaliendo(bloqueId);
    setConflicto(null);
    const r = await salirAlAire(bloqueId);
    setSaliendo(null);
    if (!r.ok) {
      if ('conflicto' in r && r.conflicto) setConflicto({ bloqueEnCursoId: r.bloqueEnCursoId, bloqueEnCursoTitulo: r.bloqueEnCursoTitulo });
      return;
    }
    const { ok, ...datos } = r;
    setEnElAire(datos);
  }

  async function irAlBloqueEnCurso() {
    const datos = await obtenerBloqueEnCurso();
    setConflicto(null);
    if (datos) setEnElAire(datos);
  }

  function handleTerminar() {
    setEnElAire(null);
    router.refresh();
  }

  if (enElAire) {
    return (
      <EnElAire
        bloqueId={enElAire.bloqueId}
        titulo={enElAire.titulo}
        protocolo={enElAire.protocolo}
        reglasFoco={enElAire.reglasFoco}
        inicioReal={enElAire.inicioReal}
        interrupcionesIniciales={enElAire.interrupciones}
        mostrarDosMinutos={enElAire.mostrarDosMinutos}
        textoDosMinutos={enElAire.textoDosMinutos}
        onTerminar={handleTerminar}
      />
    );
  }

  return (
    <div>
      <div className={s.dialMiniWrap}>
        {valorDialHoy === null ? (
          <div className={s.vacio}>
            <p className={`${base.ayuda} ${s.vacioTexto}`}>{copy.hoy.sinDial}</p>
            <Link href="/frecuencia/dial" className={base.btnGhost}>
              {copy.hoy.irAlDial}
            </Link>
          </div>
        ) : (
          <DialMini valor={valorDialHoy} />
        )}
      </div>

      {conflicto && (
        <div className={`${s.item} ${s.conflicto}`}>
          <p className={s.conflictoTexto}>{copy.enElAire.errorConflicto(conflicto.bloqueEnCursoTitulo)}</p>
          <button type="button" className={base.btnGhost} onClick={irAlBloqueEnCurso}>
            {copy.enElAire.irAlQueEstaEnCurso}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className={s.vacio}>
          <p className={`${base.ayuda} ${s.vacioTexto}`}>{copy.hoy.sinBloques}</p>
          <Link href="/frecuencia/semana" className={base.btnGhost}>
            {copy.hoy.irASemana}
          </Link>
        </div>
      ) : (
        <>
          <p className={s.lineaTitulo}>{copy.hoy.lineaDelDia}</p>
          <ol className={s.linea}>
            {items.map((item) => {
              const pasado = !item.esActual && (item.estado === 'CUMPLIDO' || item.estado === 'NO_SALIO' || (ahoraMs !== null && new Date(item.fin).getTime() < ahoraMs));
              const actual = item.esActual && esTareable(item.tipo) && item.estado === 'PROGRAMADO';
              const estadoTexto = copy.hoy.estadoLabel[item.estado];
              return (
                <li key={item.id} className={`${s.fila} ${pasado ? s.filaPasada : ''} ${item.esActual ? s.filaActual : ''}`}>
                  <span className={s.nodo} aria-hidden />
                  {actual ? (
                    <motion.div className={s.itemActual} layoutId="bloque-en-foco">
                      <div className={s.itemActualCabecera}>
                        <span className={s.itemActualBadge}>{copy.hoy.bloqueActualLabel}</span>
                        <span className={s.itemHora}>
                          {horaCorta(item.inicio, timezone)}–{horaCorta(item.fin, timezone)}
                        </span>
                      </div>
                      <p className={s.itemActualTitulo}>{item.titulo}</p>
                      <button type="button" className={`${base.btn} ${s.salirAlAire}`} onClick={() => handleSalirAlAire(item.id)} disabled={saliendo === item.id}>
                        {saliendo === item.id ? copy.botones.guardando : copy.hoy.salirAlAire}
                      </button>
                    </motion.div>
                  ) : (
                    <div className={s.item}>
                      <span className={s.itemHora}>
                        {horaCorta(item.inicio, timezone)}–{horaCorta(item.fin, timezone)}
                      </span>
                      <span className={s.itemTitulo}>{item.titulo}</span>
                      <span className={s.itemTipo}>{estadoTexto || copy.semana.tipoLabel[item.tipo]}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className={s.ideasPanel}>
        <button type="button" className={s.ideasBoton} aria-expanded={ideasAbiertas} onClick={() => setIdeasAbiertas((v) => !v)}>
          <span className={s.ideasTitulo}>{copy.hoy.ideasTitulo}</span>
          <span className={`${s.ideasFlecha} ${ideasAbiertas ? s.ideasFlechaAbierta : ''}`} aria-hidden />
          <span className={s.soloLectores}>{ideasAbiertas ? copy.hoy.cerrarIdeas : copy.hoy.abrirIdeas}</span>
        </button>
        <div className={`${s.ideasCajon} ${ideasAbiertas ? s.ideasCajonAbierto : ''}`}>
          <div className={s.ideasContenido}>
            <p className={`${base.ayuda} ${s.ideasAyuda}`}>{copy.hoy.ideasAyuda}</p>
            <div className={s.ideaForm}>
              <input
                className={base.input}
                value={textoIdea}
                onChange={(e) => setTextoIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    enviarIdea();
                  }
                }}
                placeholder={copy.hoy.ideaPlaceholder}
                tabIndex={ideasAbiertas ? 0 : -1}
              />
              <button type="button" className={base.btn} onClick={enviarIdea} disabled={guardandoIdea} tabIndex={ideasAbiertas ? 0 : -1}>
                {guardandoIdea ? copy.botones.guardando : copy.hoy.estacionar}
              </button>
            </div>
            {ideaGuardada && <p className={s.ideaOk}>{copy.hoy.ideaEstacionada}</p>}
          </div>
        </div>
      </div>

      <div className={base.filaBotones}>
        <Link href="/frecuencia/cierre" className={base.btnSec}>
          {copy.cierre.cerrarElDia}
        </Link>
      </div>
    </div>
  );
}
