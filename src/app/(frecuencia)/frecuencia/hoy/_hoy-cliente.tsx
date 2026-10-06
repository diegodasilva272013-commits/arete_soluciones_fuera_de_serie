'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p className={base.ayuda} style={{ margin: 0 }}>
              {copy.hoy.sinDial}
            </p>
            <Link href="/frecuencia/dial" className={base.btnGhost}>
              {copy.hoy.irAlDial}
            </Link>
          </div>
        ) : (
          <DialMini valor={valorDialHoy} />
        )}
      </div>

      {conflicto && (
        <div className={s.item} style={{ marginTop: 20, borderColor: 'var(--azul)' }}>
          <p style={{ margin: 0, flex: 1 }}>{copy.enElAire.errorConflicto(conflicto.bloqueEnCursoTitulo)}</p>
          <button type="button" className={base.btnGhost} onClick={irAlBloqueEnCurso}>
            {copy.enElAire.irAlQueEstaEnCurso}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <p className={base.ayuda} style={{ margin: 0 }}>
            {copy.hoy.sinBloques}
          </p>
          <Link href="/frecuencia/semana" className={base.btnGhost}>
            {copy.hoy.irASemana}
          </Link>
        </div>
      ) : (
        <div className={s.linea}>
          {items.map((item) =>
            item.esActual && esTareable(item.tipo) && item.estado === 'PROGRAMADO' ? (
              <motion.div key={item.id} className={s.itemActual} layoutId="bloque-en-foco">
                <div className={s.itemActualCabecera}>
                  <span className={s.itemActualBadge}>{copy.hoy.bloqueActualLabel}</span>
                  <span className={s.itemHora}>
                    {horaCorta(item.inicio, timezone)}–{horaCorta(item.fin, timezone)}
                  </span>
                  <span className={s.itemTitulo}>{item.titulo}</span>
                </div>
                <div className={base.filaBotones} style={{ marginTop: 0 }}>
                  <button type="button" className={base.btn} onClick={() => handleSalirAlAire(item.id)} disabled={saliendo === item.id}>
                    {saliendo === item.id ? copy.botones.guardando : copy.hoy.salirAlAire}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div key={item.id} className={s.item}>
                <span className={s.itemHora}>
                  {horaCorta(item.inicio, timezone)}–{horaCorta(item.fin, timezone)}
                </span>
                <span className={s.itemTitulo}>{item.titulo}</span>
                <span className={s.itemTipo}>{copy.semana.tipoLabel[item.tipo]}</span>
              </div>
            )
          )}
        </div>
      )}

      <div className={s.ideasPanel}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: 0 }}>
          {copy.hoy.ideasTitulo}
        </p>
        <p className={base.ayuda} style={{ marginTop: 4 }}>
          {copy.hoy.ideasAyuda}
        </p>
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
          />
          <button type="button" className={base.btn} onClick={enviarIdea} disabled={guardandoIdea}>
            {guardandoIdea ? copy.botones.guardando : copy.hoy.estacionar}
          </button>
        </div>
        {ideaGuardada && <p className={s.ideaOk}>{copy.hoy.ideaEstacionada}</p>}
      </div>

      <div className={base.filaBotones}>
        <Link href="/frecuencia/cierre" className={base.btnSec}>
          {copy.cierre.cerrarElDia}
        </Link>
      </div>
    </div>
  );
}
