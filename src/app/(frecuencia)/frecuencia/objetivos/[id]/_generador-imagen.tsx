'use client';

/**
 * Generador de imagen (5.6): la imagen mental de un objetivo o el ancla de
 * una tarea. El estado que se ve es el REAL de frecuencia_imagenes
 * (pendiente → generando → lista | error): se consulta cada tanto mientras
 * el pedido está en curso y la imagen se revela cuando el estado pasa a
 * "lista". Una imagen por pedido, sin variantes.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearImagen, estadoImagen, procesarImagen, type EstadoImagen } from '../../_ia/imagenes';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from './_generador-imagen.module.css';

export interface ImagenGuardada {
  id: string;
  estado: EstadoImagen;
  url: string | null;
}

export function GeneradorImagen({ objetivoId, tareaId, imagenes, titulo, ayuda, botonGenerar }: { objetivoId?: string; tareaId?: string; imagenes: ImagenGuardada[]; titulo: string; ayuda?: string; botonGenerar: string }) {
  const router = useRouter();
  const ultima = imagenes[0] ?? null;
  const [pedido, setPedido] = useState<{ id: string; estado: EstadoImagen; url?: string } | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const vivo = useRef(true);

  useEffect(() => () => void (vivo.current = false), []);

  // Mientras hay un pedido en curso, se consulta su estado real.
  useEffect(() => {
    if (!pedido || pedido.estado === 'lista' || pedido.estado === 'error') return;
    const id = setInterval(async () => {
      const e = await estadoImagen(pedido.id);
      if (vivo.current) setPedido((p) => (p && p.id === pedido.id ? { ...p, estado: e.estado, url: e.url } : p));
    }, 1200);
    return () => clearInterval(id);
  }, [pedido]);

  async function generar() {
    setError(null);
    const c = await crearImagen({ objetivoId, tareaId, descripcion });
    if (!c.ok) {
      setError(copy.imagenes.errores[c.codigo] ?? copy.imagenes.errores.generico);
      return;
    }
    setPedido({ id: c.id, estado: 'pendiente' });
    // El procesamiento corre en el servidor; la pantalla sigue el estado real con la consulta de arriba.
    const r = await procesarImagen(c.id);
    if (!vivo.current) return;
    setPedido({ id: c.id, estado: r.estado, url: r.url });
    if (r.estado === 'lista') router.refresh();
    if (r.estado === 'error') setError(copy.imagenes.errores.generico);
  }

  const enCurso = pedido && (pedido.estado === 'pendiente' || pedido.estado === 'generando');
  const mostrar = pedido?.estado === 'lista' ? pedido.url ?? null : ultima?.estado === 'lista' ? ultima.url : null;

  return (
    <section className={s.caja} aria-label={titulo}>
      <p className={s.titulo}>{titulo}</p>
      {ayuda && <p className={`${base.ayuda} ${s.ayuda}`}>{ayuda}</p>}

      <div className={s.marco} data-estado={enCurso ? pedido?.estado : mostrar ? 'lista' : 'vacio'}>
        {mostrar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={mostrar} src={mostrar} alt={copy.imagenes.alt} className={`${s.imagen} ${pedido?.estado === 'lista' ? s.revelada : s.yaEstaba}`} />
        )}
        {enCurso && (
          <div className={s.estado} role="status">
            <span className={s.onda} aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>{copy.imagenes.estados[pedido!.estado]}</span>
          </div>
        )}
      </div>

      {!enCurso && (
        <>
          <input className={base.input} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder={copy.imagenes.descripcionPlaceholder} maxLength={400} aria-label={copy.imagenes.descripcionPlaceholder} />
          <div className={base.filaBotones}>
            <button type="button" className={base.btn} onClick={generar}>
              {pedido?.estado === 'error' ? copy.imagenes.reintentar : botonGenerar}
            </button>
          </div>
        </>
      )}
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
