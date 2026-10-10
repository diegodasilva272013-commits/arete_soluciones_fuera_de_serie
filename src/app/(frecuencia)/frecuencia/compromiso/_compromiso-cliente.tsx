'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_compromiso.module.css';
import { actualizarAvance, guardarCompromiso } from './_actions';

const t = copy.compromiso;

function Avance({ id, inicial }: { id: string; inicial: number }) {
  const router = useRouter();
  const [valor, setValor] = useState(inicial);
  const [estado, setEstado] = useState<'quieto' | 'guardando' | 'ok' | 'error'>('quieto');
  const candado = useRef(false);

  async function guardar() {
    if (candado.current) return;
    candado.current = true;
    setEstado('guardando');
    try {
      const r = await actualizarAvance({ id, avance: valor });
      setEstado(r.error ? 'error' : 'ok');
      if (!r.error) router.refresh();
    } catch {
      setEstado('error');
    } finally {
      candado.current = false;
    }
  }

  return (
    <div>
      <label className={base.campoLabel} htmlFor={`av-${id}`}>{t.avanceLabel}</label>
      <div className={s.avanceFila}>
        <span className={s.valor} aria-live="polite">{valor}%</span>
        <input id={`av-${id}`} className={s.rango} type="range" min={0} max={100} step={5} value={valor} onChange={(e) => { setValor(Number(e.target.value)); setEstado('quieto'); }} />
      </div>
      <div className={s.barra} aria-hidden><div className={s.relleno} style={{ width: `${valor}%` }} /></div>
      <div className={base.filaBotones}>
        <button type="button" className={base.btnSec} onClick={guardar} disabled={estado === 'guardando' || valor === inicial}>{t.guardarAvance}</button>
      </div>
      {estado === 'ok' && <p className={s.ok} role="status">{t.guardado}</p>}
      {estado === 'error' && <p className={s.error} role="alert">{t.errorGuardar}</p>}
    </div>
  );
}

export function CompromisoAjeno({ id, de, texto, avance }: { id: string; de: string; texto: string; avance: number }) {
  return (
    <article className={s.tarjeta}>
      <p className={s.meta}>{t.de} {de}</p>
      <p className={s.texto}>{texto}</p>
      <Avance id={id} inicial={avance} />
    </article>
  );
}

export function MiCompromiso({ mes, inicial, companeros }: { mes: string; inicial: { id: string; texto: string; avance: number; coConductorId: string | null; coNombre: string | null } | null; companeros: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState(inicial?.texto ?? '');
  const [co, setCo] = useState(inicial?.coConductorId ?? '');
  const [ocupado, setOcupado] = useState(false);
  const candado = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function guardar() {
    if (candado.current) return;
    if (!texto.trim()) return setError(t.falta);
    candado.current = true;
    setOcupado(true);
    setError(null);
    setOk(false);
    try {
      const r = await guardarCompromiso({ texto, coConductorId: co || null });
      if (r.error) setError(r.error);
      else {
        setOk(true);
        router.refresh();
      }
    } catch {
      setError(t.errorGuardar);
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }

  return (
    <section className={s.tarjeta} aria-label={t.titulo}>
      <p className={s.meta}>{t.mes}: {mes.slice(0, 7)}</p>
      <div className={base.campo} style={{ marginTop: 0 }}>
        <label className={base.campoLabel} htmlFor="cm-texto">{t.textoLabel}</label>
        <textarea id="cm-texto" className={base.textarea} value={texto} onChange={(e) => { setTexto(e.target.value); setError(null); setOk(false); }} placeholder={t.textoPlaceholder} rows={3} maxLength={400} />
      </div>
      <div className={base.campo}>
        <label className={base.campoLabel} htmlFor="cm-co">{t.coLabel}</label>
        {companeros.length === 0 ? (
          <p className={base.ayuda}>{t.sinEquipo}</p>
        ) : (
          <select id="cm-co" className={`${base.input} ${s.select}`} value={co} onChange={(e) => { setCo(e.target.value); setOk(false); }}>
            <option value="">{t.coNinguno}</option>
            {companeros.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        )}
      </div>
      {error && <p className={s.error} role="alert">{error}</p>}
      {ok && <p className={s.ok} role="status">{t.guardado}</p>}
      <div className={base.filaBotones}>
        <button type="button" className={base.btn} onClick={guardar} disabled={ocupado}>{ocupado ? t.guardando : t.guardar}</button>
      </div>
      {inicial && (
        <div style={{ marginTop: 28 }}>
          <Avance id={inicial.id} inicial={inicial.avance} />
        </div>
      )}
    </section>
  );
}
