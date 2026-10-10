'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '../_copy';
import s from './_delegaciones.module.css';
import { marcarVolvio } from './_actions';

const t = copy.delegaciones;

export function FilaDelegue({ id, tarea, persona, criterio, fecha, volvio }: { id: string; tarea: string; persona: string; criterio: string; fecha: string; volvio: boolean }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const candado = useRef(false);
  const [error, setError] = useState<string | null>(null);

  async function alternar() {
    if (candado.current) return;
    candado.current = true;
    setOcupado(true);
    setError(null);
    try {
      const r = await marcarVolvio({ id, volvio: !volvio });
      if (r.error) setError(r.error);
      else router.refresh();
    } catch {
      setError(t.form.error);
    } finally {
      candado.current = false;
      setOcupado(false);
    }
  }

  return (
    <article className={`${s.tarjeta} ${volvio ? s.volvio : ''}`}>
      <p className={s.meta}>{t.a} {persona} · {fecha}</p>
      <p className={s.titulo}>{tarea}</p>
      <p className={s.meta} style={{ margin: 0 }}>{t.criterio}: {criterio}</p>
      <div className={s.fila}>
        <span className={`${s.estado} ${volvio ? s.estadoVolvio : ''}`}>{volvio ? t.volvio : t.enSusManos}</span>
        <button type="button" className={s.mini} disabled={ocupado} onClick={alternar} aria-label={`${volvio ? t.desmarcarVolvio : t.marcarVolvio}: ${tarea}`}>
          {volvio ? t.desmarcarVolvio : t.marcarVolvio}
        </button>
      </div>
      {error && <p className={s.error} role="alert">{error}</p>}
    </article>
  );
}
