'use client';

/**
 * Espejo — íntimo, solo del dueño. Check-in de la mañana (tres preguntas
 * y foto opcional), la ropa que se dejó elegida anoche y el historial de
 * autopercepción como carrusel coverflow (tarjetas que se inclinan según
 * su distancia al centro).
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardarCheckinEspejo } from '../actions';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_espejo.module.css';

export interface EntradaEspejo {
  id: string;
  fecha: string;
  momento: string;
  comoMeVeo: string | null;
  comoMePercibo: string | null;
  comoMeSiento: string | null;
  fotoUrl: string | null;
}

function fechaLinda(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('es-AR', { timeZone: 'UTC', day: 'numeric', month: 'long' });
}

function Coverflow({ entradas }: { entradas: EntradaEspejo[] }) {
  const contRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const cont = contRef.current;
    if (!cont) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cont.scrollLeft = 0; // lo más nuevo, al centro
    let raf = 0;
    const aplicar = () => {
      raf = 0;
      const centro = cont.scrollLeft + cont.clientWidth / 2;
      cont.querySelectorAll<HTMLElement>('[data-tarjeta]').forEach((el) => {
        const d = (el.offsetLeft + el.offsetWidth / 2 - centro) / el.offsetWidth; // 0 = al centro
        const c = Math.max(-2, Math.min(2, d));
        el.style.setProperty('--d', String(c));
        el.style.transform = reducido ? '' : `rotateY(${-c * 38}deg) translateZ(${-Math.abs(c) * 60}px) scale(${1 - Math.min(Math.abs(c), 2) * 0.08})`;
        el.style.opacity = String(1 - Math.min(Math.abs(c), 2) * 0.2);
      });
    };
    const alMover = () => {
      if (!raf) raf = requestAnimationFrame(aplicar);
    };
    aplicar();
    cont.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('resize', alMover);
    return () => {
      cont.removeEventListener('scroll', alMover);
      window.removeEventListener('resize', alMover);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [entradas.length]);

  return (
    <ul ref={contRef} className={s.coverflow} tabIndex={0} aria-label={copy.espejo.historialTitulo}>
      {entradas.map((e) => (
        <li key={e.id} data-tarjeta className={s.tarjeta}>
          <div className={s.tarjetaFoto}>
            {e.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.fotoUrl} alt="" className={s.tarjetaImg} onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.display = 'none')} />
            ) : (
              <span className={s.sinFoto}>{copy.espejo.sinFoto}</span>
            )}
          </div>
          <div className={s.tarjetaCuerpo}>
            <p className={s.tarjetaFecha}>
              {fechaLinda(e.fecha)} · {copy.espejo.momento[e.momento] ?? ''}
            </p>
            {e.comoMeVeo && <p className={s.tarjetaTexto}>{e.comoMeVeo}</p>}
            {e.comoMePercibo && <p className={s.tarjetaTexto}>{e.comoMePercibo}</p>}
            {e.comoMeSiento && <p className={s.tarjetaTexto}>{e.comoMeSiento}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EspejoCliente({ ropa, entradas }: { ropa: string | null; entradas: EntradaEspejo[] }) {
  const router = useRouter();
  const [veo, setVeo] = useState('');
  const [percibo, setPercibo] = useState('');
  const [siento, setSiento] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [claveArchivo, setClaveArchivo] = useState(0);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    if (!foto) {
      setVista(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setVista(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  function elegirFoto(f: File | null) {
    if (f && (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) {
      setFoto(null);
      setClaveArchivo((k) => k + 1);
      setMensaje({ tipo: 'error', texto: copy.espejo.fotoInvalida });
      return;
    }
    setMensaje(null);
    setFoto(f);
  }

  async function guardar() {
    if (!veo.trim() && !percibo.trim() && !siento.trim()) {
      setMensaje({ tipo: 'error', texto: copy.estados.campoRequerido });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    const fd = new FormData();
    fd.set('como_me_veo', veo);
    fd.set('como_me_percibo', percibo);
    fd.set('como_me_siento', siento);
    if (foto) fd.set('foto', foto);
    let r: { error?: string; ok?: boolean };
    try {
      r = await guardarCheckinEspejo(fd);
    } catch {
      r = { error: 'red' };
    } finally {
      setGuardando(false);
    }
    if (r.error) {
      setMensaje({ tipo: 'error', texto: copy.estados.error });
      return;
    }
    setVeo('');
    setPercibo('');
    setSiento('');
    setFoto(null);
    setClaveArchivo((k) => k + 1);
    setMensaje({ tipo: 'ok', texto: copy.espejo.guardado });
    router.refresh();
  }

  return (
    <div className={s.wrap}>
      <section className={s.ropa}>
        <p className={s.etiqueta}>{copy.espejo.ropaTitulo}</p>
        <p className={ropa ? s.ropaTexto : `${base.ayuda} ${s.ropaVacia}`}>{ropa ?? copy.espejo.ropaVacia}</p>
      </section>

      <section className={s.checkin}>
        <p className={s.etiqueta}>{copy.espejo.checkinTitulo}</p>
        <div className={base.campo}>
          <label className={base.campoLabel} htmlFor="e-veo">{copy.espejo.comoMeVeo}</label>
          <textarea id="e-veo" className={base.textarea} value={veo} onChange={(e) => setVeo(e.target.value)} placeholder={copy.espejo.comoMeVeoPlaceholder} maxLength={600} rows={2} />
        </div>
        <div className={base.campo}>
          <label className={base.campoLabel} htmlFor="e-percibo">{copy.espejo.comoMePercibo}</label>
          <textarea id="e-percibo" className={base.textarea} value={percibo} onChange={(e) => setPercibo(e.target.value)} placeholder={copy.espejo.comoMePerciboPlaceholder} maxLength={600} rows={2} />
        </div>
        <div className={base.campo}>
          <label className={base.campoLabel} htmlFor="e-siento">{copy.espejo.comoMeSiento}</label>
          <textarea id="e-siento" className={base.textarea} value={siento} onChange={(e) => setSiento(e.target.value)} placeholder={copy.espejo.comoMeSientoPlaceholder} maxLength={600} rows={2} />
        </div>

        <div className={s.fotoFila}>
          <label className={`${base.btnGhost} ${s.fotoBoton}`}>
            {copy.espejo.foto}
            <input key={claveArchivo} type="file" accept="image/png,image/jpeg,image/webp" className={s.fotoInput} onChange={(e) => elegirFoto(e.target.files?.[0] ?? null)} />
          </label>
          {vista && (
            <span className={s.vistaPrevia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={vista} alt="" className={s.vistaImg} />
              <button type="button" className={s.quitarFoto} onClick={() => {
                  setFoto(null);
                  setClaveArchivo((k) => k + 1);
                }}
              >
                {copy.espejo.quitarFoto}</button>
            </span>
          )}
        </div>

        {mensaje && (
          <p className={mensaje.tipo === 'ok' ? s.ok : s.error} role={mensaje.tipo === 'ok' ? 'status' : 'alert'}>
            {mensaje.texto}
          </p>
        )}
        <div className={base.filaBotones}>
          <button type="button" className={base.btn} onClick={guardar} disabled={guardando}>
            {guardando ? copy.botones.guardando : copy.espejo.guardar}
          </button>
        </div>
        <p className={s.privado}>{copy.espejo.soloVos}</p>
      </section>

      <section className={s.historial}>
        <p className={s.etiqueta}>{copy.espejo.historialTitulo}</p>
        {entradas.length === 0 ? <p className={`${base.ayuda} ${s.ropaVacia}`}>{copy.espejo.historialVacio}</p> : <Coverflow entradas={entradas} />}
      </section>

      <section className={s.guardarropa}>
        <p className={s.etiqueta}>{copy.espejo.guardarropaTitulo}</p>
        <p className={`${base.ayuda} ${s.ropaVacia}`}>{copy.espejo.guardarropaProximamente}</p>
      </section>
    </div>
  );
}
