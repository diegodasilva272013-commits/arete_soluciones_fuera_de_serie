'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_criterios.module.css';
import { guardarCriterio } from '../actions';
import type { CriterioFila, GuiaCriterio } from './_datos';

const t = copy.criterios.form;

export function CriterioFormulario({ inicial, equipos, guia }: { inicial?: CriterioFila; equipos: { id: string; nombre: string }[]; guia: GuiaCriterio }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [queSeDecide, setQueSeDecide] = useState(inicial?.que_se_decide ?? '');
  const [queEntra, setQueEntra] = useState(inicial?.que_entra ?? '');
  const [queNoEntra, setQueNoEntra] = useState(inicial?.que_no_entra ?? '');
  const [costo, setCosto] = useState(inicial?.costo_si_sale_mal ?? '');
  const [reversible, setReversible] = useState<boolean | null>(inicial ? inicial.reversible : null);
  const [tiempo, setTiempo] = useState(inicial?.tiempo_reversibilidad ?? '');
  const [responsable, setResponsable] = useState(inicial?.quien_asume_responsabilidad ?? '');
  const [ambito, setAmbito] = useState<'personal' | 'equipo'>(inicial?.ambito ?? 'personal');
  const [equipoId, setEquipoId] = useState(inicial?.equipo_id ?? equipos[0]?.id ?? '');

  // El aviso de "faltan puntos" no queda pegado: se va en cuanto la persona sigue escribiendo.
  useEffect(() => setError(null), [titulo, queSeDecide, queEntra, queNoEntra, costo, reversible, tiempo]);

  function guardar() {
    const completo = [titulo, queSeDecide, queEntra, queNoEntra, costo].every((x) => x.trim()) && reversible !== null && (!reversible || tiempo.trim());
    if (!completo) return setError(t.faltan);
    setError(null);
    empezar(async () => {
      const r = await guardarCriterio({
        id: inicial?.id,
        ambito,
        equipoId: ambito === 'equipo' ? equipoId : null,
        titulo,
        queSeDecide,
        queEntra,
        queNoEntra,
        costoSiSaleMal: costo,
        reversible: reversible === true,
        tiempoReversibilidad: reversible ? tiempo : null,
        quienAsumeResponsabilidad: responsable,
      });
      if (r.error) return setError(r.error === 'Faltan puntos del criterio.' ? t.faltan : t.errorGuardar);
      router.push('/frecuencia/criterios');
      router.refresh();
    });
  }

  const area = (id: string, label: string, valor: string, set: (v: string) => void) => (
    <div className={base.campo}>
      <label className={base.campoLabel} htmlFor={id}>{label}</label>
      <textarea id={id} className={base.textarea} value={valor} onChange={(e) => set(e.target.value)} rows={3} maxLength={400} />
    </div>
  );

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.criterios.kicker}</span>
      </div>
      <h1 className={base.titulo}>{inicial ? t.tituloEditar : t.tituloNuevo}</h1>
      <p className={base.subtitulo}>{t.subtitulo}</p>
      <div className={s.guia}>
        <p className={s.regla}>{guia.regla ?? copy.criterios.regla}</p>
        {guia.noDelegable.length > 0 && (
          <>
            <p className={s.test}>{copy.criterios.noDelegable}:</p>
            <ul className={s.noDelegable}>{guia.noDelegable.map((x) => <li key={x}>{x}</li>)}</ul>
          </>
        )}
      </div>

      <div className={base.campo}>
        <label className={base.campoLabel} htmlFor="cr-titulo">{t.titulo}</label>
        <input id="cr-titulo" className={base.input} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={t.tituloPlaceholder} maxLength={120} />
      </div>
      {area('cr-decide', t.queSeDecide, queSeDecide, setQueSeDecide)}
      {area('cr-entra', t.queEntra, queEntra, setQueEntra)}
      {area('cr-noentra', t.queNoEntra, queNoEntra, setQueNoEntra)}
      {area('cr-costo', t.costo, costo, setCosto)}

      <div className={base.campo} role="group" aria-labelledby="cr-rev">
        <span className={base.campoLabel} id="cr-rev">{t.reversible}</span>
        <div className={s.opciones}>
          <button type="button" aria-pressed={reversible === true} className={`${s.opcion} ${reversible === true ? s.opcionOn : ''}`} onClick={() => setReversible(true)}>{t.reversibleSi}</button>
          <button type="button" aria-pressed={reversible === false} className={`${s.opcion} ${reversible === false ? s.opcionOn : ''}`} onClick={() => setReversible(false)}>{t.reversibleNo}</button>
        </div>
      </div>
      {reversible === true && (
        <div className={base.campo}>
          <label className={base.campoLabel} htmlFor="cr-tiempo">{t.tiempo}</label>
          <input id="cr-tiempo" className={base.input} value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder={t.tiempoPlaceholder} maxLength={120} />
        </div>
      )}

      <div className={base.campo}>
        <label className={base.campoLabel} htmlFor="cr-resp">{t.responsabilidad}</label>
        <input id="cr-resp" className={base.input} value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder={guia.responsabilidad ?? t.responsabilidadPlaceholder} maxLength={160} />
      </div>

      {equipos.length > 0 && (
        <div className={base.campo} role="group" aria-labelledby="cr-ambito">
          <span className={base.campoLabel} id="cr-ambito">{t.ambito}</span>
          <div className={s.opciones}>
            <button type="button" aria-pressed={ambito === 'personal'} className={`${s.opcion} ${ambito === 'personal' ? s.opcionOn : ''}`} onClick={() => setAmbito('personal')}>{copy.criterios.ambitoPersonal}</button>
            <button type="button" aria-pressed={ambito === 'equipo'} className={`${s.opcion} ${ambito === 'equipo' ? s.opcionOn : ''}`} onClick={() => setAmbito('equipo')}>{copy.criterios.ambitoEquipo}</button>
          </div>
          {ambito === 'equipo' && equipos.length > 1 && (
            <select className={base.input} style={{ marginTop: 10 }} value={equipoId} onChange={(e) => setEquipoId(e.target.value)} aria-label={t.equipo}>
              {equipos.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          )}
        </div>
      )}

      {error && <p className={s.error} role="alert">{error}</p>}
      <div className={base.filaBotones}>
        <button type="button" className={base.btnSec} onClick={() => router.push('/frecuencia/criterios')} disabled={pendiente}>{t.cancelar}</button>
        <button type="button" className={base.btn} onClick={guardar} disabled={pendiente}>{pendiente ? t.guardando : t.guardar}</button>
      </div>
    </div>
  );
}
