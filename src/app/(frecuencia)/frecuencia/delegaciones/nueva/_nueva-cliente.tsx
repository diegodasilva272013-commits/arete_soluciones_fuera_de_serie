'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_delegaciones.module.css';
import { crearDelegacion } from '../_actions';

const t = copy.delegaciones.form;
type Op = { id: string; titulo?: string; nombre?: string };

export function NuevaDelegacion({ tareas, criterios, personas, tareaInicial }: { tareas: Op[]; criterios: Op[]; personas: Op[]; tareaInicial: string }) {
  const router = useRouter();
  const [tareaId, setTareaId] = useState(tareas.some((x) => x.id === tareaInicial) ? tareaInicial : '');
  const [aUserId, setAUserId] = useState('');
  const [criterioId, setCriterioId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const candado = useRef(false);

  async function delegar() {
    if (candado.current) return;
    if (!tareaId || !aUserId || !criterioId) return setError(t.falta);
    candado.current = true;
    setOcupado(true);
    setError(null);
    try {
      const r = await crearDelegacion({ tareaId, aUserId, criterioId });
      if (r.error) return setError(r.error);
      router.push('/frecuencia/delegaciones');
      router.refresh();
    } catch {
      setError(t.error);
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }

  const selector = (id: string, label: string, valor: string, set: (v: string) => void, ops: Op[]) => (
    <div className={base.campo}>
      <label className={base.campoLabel} htmlFor={id}>{label}</label>
      <select id={id} className={`${base.input} ${s.select}`} value={valor} onChange={(e) => { set(e.target.value); setError(null); }}>
        <option value="">{t.elegir}</option>
        {ops.map((o) => <option key={o.id} value={o.id}>{o.titulo ?? o.nombre}</option>)}
      </select>
    </div>
  );

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.delegaciones.kicker}</span>
      </div>
      <h1 className={base.titulo}>{t.titulo}</h1>
      <p className={base.subtitulo}>{t.subtitulo}</p>

      {tareas.length === 0 && <p className={base.ayuda} style={{ marginTop: 20 }}>{t.sinTareas}</p>}
      {personas.length === 0 && <p className={base.ayuda} style={{ marginTop: 20 }}>{t.sinPersonas}</p>}
      {criterios.length === 0 && (
        <p className={base.ayuda} style={{ marginTop: 20 }}>
          {t.sinCriterios} <Link href="/frecuencia/criterios/nuevo" className={base.btnGhost}>{t.escribirCriterio} →</Link>
        </p>
      )}

      {tareas.length > 0 && personas.length > 0 && criterios.length > 0 && (
        <>
          {selector('dl-tarea', t.tarea, tareaId, setTareaId, tareas)}
          {selector('dl-persona', t.persona, aUserId, setAUserId, personas)}
          {selector('dl-criterio', t.criterio, criterioId, setCriterioId, criterios)}
          {error && <p className={s.error} role="alert">{error}</p>}
          <div className={base.filaBotones}>
            <button type="button" className={base.btnSec} onClick={() => router.push('/frecuencia/delegaciones')} disabled={ocupado}>{t.volver}</button>
            <button type="button" className={base.btn} onClick={delegar} disabled={ocupado}>{ocupado ? t.delegando : t.delegar}</button>
          </div>
        </>
      )}
    </div>
  );
}
