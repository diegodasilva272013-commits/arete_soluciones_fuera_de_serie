'use client';

/**
 * Ajustes de dosis propuestos (7.3): sube o baja las veces por semana de
 * una tarea según el cumplimiento sostenido. Siempre se propone y la
 * persona confirma; el texto nunca culpa. "Dejarlo como está" oculta la
 * propuesta de esta semana en este navegador (la regla la vuelve a
 * evaluar la semana siguiente).
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AjusteDosisPropuesto } from '@/lib/frecuencia/dosis';
import { aplicarAjusteDosis } from '../actions';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_ajustes-dosis.module.css';

export function AjustesDosis({ propuestas, semanaClave }: { propuestas: AjusteDosisPropuesto[]; semanaClave: string }) {
  const router = useRouter();
  const [ocultas, setOcultas] = useState<string[]>([]);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setOcultas(JSON.parse(localStorage.getItem(`frecuencia-dosis-ocultas:${semanaClave}`) ?? '[]'));
    } catch {
      /* sin almacenamiento: se muestran todas */
    }
  }, [semanaClave]);

  const visibles = propuestas.filter((p) => !ocultas.includes(p.tareaId));
  if (!visibles.length) return null;

  function ocultar(id: string) {
    const nuevas = [...ocultas, id];
    setOcultas(nuevas);
    try {
      localStorage.setItem(`frecuencia-dosis-ocultas:${semanaClave}`, JSON.stringify(nuevas));
    } catch {
      /* sin almacenamiento */
    }
  }

  async function aceptar(p: AjusteDosisPropuesto) {
    setTrabajando(p.tareaId);
    setError(false);
    const r = await aplicarAjusteDosis(p.tareaId, p.a);
    setTrabajando(null);
    if (r.error) {
      setError(true);
      return;
    }
    ocultar(p.tareaId);
    router.refresh();
  }

  return (
    <section className={s.panel} aria-label={copy.dosis.titulo}>
      <p className={s.titulo}>{copy.dosis.titulo}</p>
      <p className={`${base.ayuda} ${s.ayuda}`}>{copy.dosis.ayuda}</p>
      <ul className={s.lista}>
        {visibles.map((p) => (
          <li key={p.tareaId} className={`${s.item} ${p.tipo === 'subir' ? s.subir : s.bajar}`}>
            <p className={s.mensaje}>{(p.tipo === 'subir' ? copy.dosis.subir : copy.dosis.bajar)(p.titulo, p.cumplimientos.length, p.de, p.a)}</p>
            <p className={s.datos}>{p.cumplimientos.map((c) => copy.dosis.cumplimiento(Math.round(c * 100))).join(' · ')}</p>
            <div className={s.botones}>
              <button type="button" className={base.btn} onClick={() => aceptar(p)} disabled={trabajando === p.tareaId}>
                {trabajando === p.tareaId ? copy.botones.guardando : copy.dosis.aceptar}
              </button>
              <button type="button" className={base.btnGhost} onClick={() => ocultar(p.tareaId)}>
                {copy.dosis.dejarlo}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p className={s.error} role="alert">
          {copy.estados.error}
        </p>
      )}
    </section>
  );
}
