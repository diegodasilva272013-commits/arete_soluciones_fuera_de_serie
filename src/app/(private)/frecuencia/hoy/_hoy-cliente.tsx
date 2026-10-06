'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { TipoBloque } from '@/lib/frecuencia/plan';
import { estacionarIdea } from '../actions';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { DialMini } from './_dial-mini';
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

export function HoyCliente({ valorDialHoy, items, timezone }: { valorDialHoy: number | null; items: ItemLinea[]; timezone: string }) {
  const [textoIdea, setTextoIdea] = useState('');
  const [guardandoIdea, setGuardandoIdea] = useState(false);
  const [ideaGuardada, setIdeaGuardada] = useState(false);

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
            item.esActual ? (
              <div key={item.id} className={s.itemActual}>
                <div className={s.itemActualCabecera}>
                  <span className={s.itemActualBadge}>{copy.hoy.bloqueActualLabel}</span>
                  <span className={s.itemHora}>
                    {horaCorta(item.inicio, timezone)}–{horaCorta(item.fin, timezone)}
                  </span>
                  <span className={s.itemTitulo}>{item.titulo}</span>
                </div>
                <div className={base.filaBotones} style={{ marginTop: 0 }}>
                  <button type="button" className={base.btn} disabled title={copy.hoy.salirAlAireProximamente}>
                    {copy.hoy.salirAlAire}
                  </button>
                </div>
              </div>
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
    </div>
  );
}
