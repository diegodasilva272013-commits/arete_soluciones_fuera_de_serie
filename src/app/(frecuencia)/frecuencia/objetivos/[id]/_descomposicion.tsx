'use client';

/**
 * Bajar un objetivo a tierra con IA (5.3). La IA propone, la persona revisa
 * y confirma, y recién ahí se guarda; después, armar la semana. Los estados
 * de la pantalla (pensando / propuesta / guardada) son los reales.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PropuestaDescomposicion } from '@/lib/frecuencia/ia/descomposicion';
import { guardarDescomposicion, proponerDescomposicion } from './_descomponer-actions';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from './_descomposicion.module.css';

type Estado = { tipo: 'reposo' } | { tipo: 'pensando' } | { tipo: 'propuesta'; propuesta: PropuestaDescomposicion } | { tipo: 'guardando'; propuesta: PropuestaDescomposicion } | { tipo: 'guardada'; cantidad: number };

export function Descomposicion({ objetivoId }: { objetivoId: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ tipo: 'reposo' });
  const [error, setError] = useState<string | null>(null);

  async function pedir() {
    setError(null);
    setEstado({ tipo: 'pensando' });
    try {
      const r = await proponerDescomposicion(objetivoId);
      if (r.ok) setEstado({ tipo: 'propuesta', propuesta: r.propuesta });
      else {
        setError(copy.descomposicion.errores[r.codigo] ?? copy.descomposicion.errores.generico);
        setEstado({ tipo: 'reposo' });
      }
    } catch {
      setError(copy.descomposicion.errores.generico);
      setEstado({ tipo: 'reposo' });
    }
  }

  async function guardar(propuesta: PropuestaDescomposicion) {
    setError(null);
    setEstado({ tipo: 'guardando', propuesta });
    try {
      const r = await guardarDescomposicion(objetivoId, propuesta);
      if (r.ok) {
        setEstado({ tipo: 'guardada', cantidad: r.guardadas ?? propuesta.tareas.length });
        router.refresh();
        return;
      }
    } catch {
      /* cae al error genérico */
    }
    setError(copy.estados.error);
    setEstado({ tipo: 'propuesta', propuesta });
  }

  return (
    <section className={s.caja} aria-label={copy.descomposicion.titulo} aria-live="polite">
      {estado.tipo === 'reposo' && (
        <>
          <p className={s.titulo}>{copy.descomposicion.titulo}</p>
          <p className={`${base.ayuda} ${s.ayuda}`}>{copy.descomposicion.ayuda}</p>
          <div className={base.filaBotones}>
            <button type="button" className={base.btn} onClick={pedir}>
              {copy.descomposicion.boton}
            </button>
          </div>
        </>
      )}

      {estado.tipo === 'pensando' && (
        <div className={s.pensando} role="status">
          <span className={s.onda} aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <p className={s.pensandoTexto}>{copy.descomposicion.pensando}</p>
        </div>
      )}

      {(estado.tipo === 'propuesta' || estado.tipo === 'guardando') && (
        <>
          <p className={s.titulo}>{copy.descomposicion.propuestaTitulo}</p>
          {estado.propuesta.metas.length > 0 && (
            <>
              <p className={s.sub}>{copy.descomposicion.metasTitulo}</p>
              <ul className={s.metas}>
                {estado.propuesta.metas.map((m) => (
                  <li key={m.periodo} className={s.meta}>
                    <span className={s.periodo}>{m.periodo}</span>
                    <span>{m.meta}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className={s.sub}>{copy.descomposicion.tareasTitulo}</p>
          <ol className={s.tareas}>
            {estado.propuesta.tareas.map((t, i) => (
              <li key={`${i}-${t.titulo}`} className={s.tarea} style={{ ['--i' as string]: i }}>
                <p className={s.tareaTitulo}>{t.titulo}</p>
                <p className={s.tareaDatos}>
                  {copy.tareas.tipoEnergiaOpciones[t.tipoEnergia]} · {copy.descomposicion.minutos(t.duracionMin)} · {copy.descomposicion.vecesPorSemana(t.dosisObjetivo)}
                </p>
                {t.protocolo.length > 0 && (
                  <ol className={s.protocolo}>
                    {t.protocolo.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ol>
                )}
                {t.dependeDe.length > 0 && (
                  <p className={s.depende}>
                    {copy.descomposicion.dependeDe} {t.dependeDe.map((d) => estado.propuesta.tareas[d]?.titulo).filter(Boolean).join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <div className={base.filaBotones}>
            <button type="button" className={base.btn} onClick={() => guardar(estado.propuesta)} disabled={estado.tipo === 'guardando'}>
              {estado.tipo === 'guardando' ? copy.botones.guardando : copy.descomposicion.aceptar}
            </button>
            <button type="button" className={base.btnSec} onClick={pedir} disabled={estado.tipo === 'guardando'}>
              {copy.descomposicion.otra}
            </button>
            <button type="button" className={base.btnGhost} onClick={() => setEstado({ tipo: 'reposo' })} disabled={estado.tipo === 'guardando'}>
              {copy.descomposicion.descartar}
            </button>
          </div>
        </>
      )}

      {estado.tipo === 'guardada' && (
        <>
          <p className={s.titulo}>{copy.descomposicion.guardadas(estado.cantidad)}</p>
          <div className={base.filaBotones}>
            <Link href="/frecuencia/semana" className={base.btn}>
              {copy.descomposicion.armarSemana}
            </Link>
          </div>
        </>
      )}

      {estado.tipo === 'reposo' && error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
