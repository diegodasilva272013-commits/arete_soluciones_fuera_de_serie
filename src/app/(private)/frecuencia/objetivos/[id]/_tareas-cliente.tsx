'use client';

/**
 * CRUD de tareas de un objetivo + prioridad visual. La prioridad usa
 * `calcularPrioridad` de src/lib/frecuencia/plan.ts — la MISMA función
 * que después usa el motor de la semana — para que "la tarea que más
 * desbloquea es prioridad 0" sea una sola fuente de verdad, no dos
 * implementaciones que puedan desalinearse.
 */

import { useMemo, useState } from 'react';
import { calcularPrioridad, type TareaParaPlan, type TipoEnergia } from '@/lib/frecuencia/plan';
import { crearTarea, actualizarTarea, borrarTarea, type TareaInput } from '../../actions';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';

export interface TareaDeObjetivo {
  id: string;
  titulo: string;
  protocolo: string[];
  tipo_energia: TipoEnergia | null;
  duracion_min: number | null;
  dosis_actual: number;
  dosis_objetivo: number | null;
  desbloquea: string[];
}

const TIPOS_ENERGIA: TipoEnergia[] = ['profundo', 'decision', 'creativo'];

function formVacio(): TareaInput {
  return { objetivoId: '', titulo: '', protocolo: [], tipoEnergia: null, duracionMin: null, dosisActual: 1, dosisObjetivo: null, desbloquea: [] };
}

export function TareasCliente({ objetivoId, tareasIniciales }: { objetivoId: string; tareasIniciales: TareaDeObjetivo[] }) {
  const [tareas, setTareas] = useState(tareasIniciales);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<TareaInput>({ ...formVacio(), objetivoId });
  const [pasoProtocolo, setPasoProtocolo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prioridad = useMemo(() => {
    const paraPlan: TareaParaPlan[] = tareas.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      tipoEnergia: t.tipo_energia,
      duracionMin: t.duracion_min ?? 0,
      dosisObjetivo: t.dosis_objetivo,
      vecesDesbloquea: t.desbloquea.length,
      areaKey: null,
      objetivoId,
    }));
    return calcularPrioridad(paraPlan);
  }, [tareas, objetivoId]);

  function empezarEdicion(t: TareaDeObjetivo) {
    setEditandoId(t.id);
    setForm({
      objetivoId,
      titulo: t.titulo,
      protocolo: t.protocolo,
      tipoEnergia: t.tipo_energia,
      duracionMin: t.duracion_min,
      dosisActual: t.dosis_actual,
      dosisObjetivo: t.dosis_objetivo,
      desbloquea: t.desbloquea,
    });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm({ ...formVacio(), objetivoId });
    setPasoProtocolo('');
  }

  function agregarPasoProtocolo() {
    const texto = pasoProtocolo.trim();
    if (!texto) return;
    setForm((f) => ({ ...f, protocolo: [...f.protocolo, texto] }));
    setPasoProtocolo('');
  }

  function quitarPasoProtocolo(i: number) {
    setForm((f) => ({ ...f, protocolo: f.protocolo.filter((_, idx) => idx !== i) }));
  }

  function alternarDesbloquea(tareaId: string) {
    setForm((f) => ({
      ...f,
      desbloquea: f.desbloquea.includes(tareaId) ? f.desbloquea.filter((id) => id !== tareaId) : [...f.desbloquea, tareaId],
    }));
  }

  async function guardar() {
    if (!form.titulo.trim()) {
      setError(copy.estados.campoRequerido);
      return;
    }
    setGuardando(true);
    setError(null);
    const r = editandoId ? await actualizarTarea(editandoId, form) : await crearTarea(form);
    setGuardando(false);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }

    if (editandoId) {
      setTareas((prev) =>
        prev.map((t) =>
          t.id === editandoId
            ? { ...t, titulo: form.titulo, protocolo: form.protocolo, tipo_energia: form.tipoEnergia, duracion_min: form.duracionMin, dosis_actual: form.dosisActual, dosis_objetivo: form.dosisObjetivo, desbloquea: form.desbloquea }
            : t
        )
      );
    } else if ('id' in r && r.id) {
      setTareas((prev) => [
        ...prev,
        { id: r.id as string, titulo: form.titulo, protocolo: form.protocolo, tipo_energia: form.tipoEnergia, duracion_min: form.duracionMin, dosis_actual: form.dosisActual, dosis_objetivo: form.dosisObjetivo, desbloquea: form.desbloquea },
      ]);
    }
    cancelarEdicion();
  }

  async function borrar(tareaId: string) {
    if (!window.confirm(copy.tareas.confirmarBorrar)) return;
    const r = await borrarTarea(tareaId, objetivoId);
    if (r.error) {
      setError(copy.estados.error);
      return;
    }
    setTareas((prev) => prev.filter((t) => t.id !== tareaId).map((t) => ({ ...t, desbloquea: t.desbloquea.filter((id) => id !== tareaId) })));
  }

  const tareasOrdenadas = [...tareas].sort((a, b) => (prioridad.get(a.id)! - prioridad.get(b.id)!));

  return (
    <div>
      <div style={{ marginTop: 28 }}>
        {tareasOrdenadas.length === 0 && <p className={base.ayuda}>{copy.tareas.vacio}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tareasOrdenadas.map((t) => (
            <div key={t.id} className={base.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <p style={{ fontFamily: 'var(--f-texto)', fontSize: 16, color: 'var(--hueso)', margin: 0 }}>{t.titulo}</p>
                <span className={base.kickerLabel} style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
                  {prioridad.get(t.id) === 0 ? copy.tareas.prioridadCero : `${copy.tareas.prioridadLabel} ${prioridad.get(t.id)}`}
                </span>
              </div>
              <p className={base.ayuda} style={{ margin: '6px 0 0' }}>
                {t.tipo_energia ? copy.tareas.tipoEnergiaOpciones[t.tipo_energia] : copy.tareas.tipoEnergiaSinElegir}
                {t.duracion_min ? ` · ${t.duracion_min} min` : ''}
                {` · ${copy.tareas.dosisActualLabel.toLowerCase()} ${t.dosis_actual}${t.dosis_objetivo ? `/${t.dosis_objetivo}` : ''}`}
                {t.desbloquea.length > 0 ? ` · desbloquea ${t.desbloquea.length}` : ''}
              </p>
              <div className={base.filaBotones} style={{ marginTop: 14 }}>
                <button type="button" className={base.btnSec} onClick={() => empezarEdicion(t)}>
                  {copy.tareas.editarTarea}
                </button>
                <button type="button" className={base.btnGhost} onClick={() => borrar(t.id)}>
                  {copy.botones.quitar}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={base.panel} style={{ marginTop: 28 }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: '0 0 18px' }}>
          {editandoId ? copy.tareas.editarTarea : copy.tareas.nuevaTarea}
        </p>

        <div className={base.campo} style={{ marginTop: 0 }}>
          <label className={base.campoLabel}>{copy.tareas.tituloLabel}</label>
          <input className={base.input} value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder={copy.tareas.tituloPlaceholder} />
        </div>

        <div className={base.campo}>
          <label className={base.campoLabel}>{copy.tareas.protocoloLabel}</label>
          <input
            className={base.input}
            value={pasoProtocolo}
            onChange={(e) => setPasoProtocolo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarPasoProtocolo();
              }
            }}
            placeholder={copy.tareas.protocoloPlaceholder}
          />
          {form.protocolo.length > 0 && (
            <div className={base.chipsFila}>
              {form.protocolo.map((paso, i) => (
                <span key={i} className={base.chip}>
                  {paso}
                  <button type="button" className={base.chipQuitar} onClick={() => quitarPasoProtocolo(i)} aria-label={copy.botones.quitar}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={base.campo}>
          <label className={base.campoLabel}>{copy.tareas.tipoEnergiaLabel}</label>
          <div className={base.areasFila}>
            {TIPOS_ENERGIA.map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`${base.areaChip} ${form.tipoEnergia === tipo ? base.areaChipElegido : ''}`}
                onClick={() => setForm((f) => ({ ...f, tipoEnergia: f.tipoEnergia === tipo ? null : tipo }))}
              >
                {copy.tareas.tipoEnergiaOpciones[tipo]}
              </button>
            ))}
          </div>
        </div>

        <div className={base.campo}>
          <label className={base.campoLabel}>{copy.tareas.duracionLabel}</label>
          <input
            type="number"
            min={0}
            className={base.input}
            value={form.duracionMin ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, duracionMin: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>

        <div className={base.campo} style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label className={base.campoLabel}>{copy.tareas.dosisActualLabel}</label>
            <input type="number" min={0} className={base.input} value={form.dosisActual} onChange={(e) => setForm((f) => ({ ...f, dosisActual: Number(e.target.value) }))} />
          </div>
          <div style={{ flex: 1 }}>
            <label className={base.campoLabel}>{copy.tareas.dosisObjetivoLabel}</label>
            <input
              type="number"
              min={0}
              className={base.input}
              value={form.dosisObjetivo ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, dosisObjetivo: e.target.value ? Number(e.target.value) : null }))}
            />
          </div>
        </div>

        <div className={base.campo}>
          <label className={base.campoLabel}>{copy.tareas.desbloqueaLabel}</label>
          {tareas.filter((t) => t.id !== editandoId).length === 0 ? (
            <p className={base.ayuda} style={{ marginTop: 0 }}>
              {copy.tareas.desbloqueaVacio}
            </p>
          ) : (
            <div className={base.areasFila}>
              {tareas
                .filter((t) => t.id !== editandoId)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${base.areaChip} ${form.desbloquea.includes(t.id) ? base.areaChipElegido : ''}`}
                    onClick={() => alternarDesbloquea(t.id)}
                  >
                    {t.titulo}
                  </button>
                ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 16 }}>{error}</p>}

        <div className={base.filaBotones}>
          <button type="button" className={base.btn} onClick={guardar} disabled={guardando}>
            {guardando ? copy.botones.guardando : copy.botones.guardar}
          </button>
          {editandoId && (
            <button type="button" className={base.btnGhost} onClick={cancelarEdicion}>
              {copy.botones.atras}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
