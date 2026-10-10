'use client';

/**
 * Chat de texto del agente (5.4). Referencia FUNCIONAL de los componentes de
 * 21st.dev, diseño propio de Areté: caja de texto que crece sola, acciones
 * rápidas, selector de modelo (de la base), estados reales (enviando,
 * herramientas usadas, propuesta de semana para confirmar). Sin librerías nuevas.
 */

import { useEffect, useRef, useState } from 'react';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_chat.module.css';

interface Mensaje {
  rol: 'user' | 'assistant';
  contenido: string;
  acciones?: Accion[];
}
interface Accion {
  herramienta: string;
  ok: boolean;
  resumen: string;
  propuesta?: { hash: string; bloques: { dia: string; horaInicio: string; horaFin: string; titulo: string }[] };
}

export function ChatCliente({
  conversacionInicial,
  mensajesIniciales,
  modelos,
}: {
  conversacionInicial: string | null;
  mensajesIniciales: Mensaje[];
  modelos: { id: string; nombre: string; porDefecto: boolean }[];
}) {
  const [conversacionId, setConversacionId] = useState(conversacionInicial);
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modeloId, setModeloId] = useState(modelos.find((m) => m.porDefecto)?.id ?? modelos[0]?.id ?? '');
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  // La caja de texto crece sola con lo que se escribe.
  useEffect(() => {
    const a = areaRef.current;
    if (!a) return;
    a.style.height = 'auto';
    a.style.height = `${Math.min(a.scrollHeight, 180)}px`;
  }, [texto]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [mensajes, enviando]);

  async function enviar(contenido: string) {
    const t = contenido.trim();
    if (!t || enviando) return;
    setError(null);
    setEnviando(true);
    setMensajes((m) => [...m, { rol: 'user', contenido: t }]);
    setTexto('');
    try {
      const r = await fetch('/api/frecuencia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacionId, mensaje: t, modeloId }),
      });
      const d = await r.json().catch(() => ({}));
      if (d.conversacionId) setConversacionId(d.conversacionId);
      if (!r.ok) {
        setError(copy.chat.errores[d.error as string] ?? copy.chat.errores.generico);
      } else {
        setMensajes((m) => [...m, { rol: 'assistant', contenido: d.respuesta as string, acciones: d.acciones as Accion[] }]);
      }
    } catch {
      setError(copy.chat.errores.generico);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.hilo} role="log" aria-live="polite" aria-label={copy.chat.titulo}>
        {mensajes.length === 0 && (
          <div className={s.arranque}>
            <p className={`${base.ayuda} ${s.vacio}`}>{copy.chat.vacio}</p>
            <div className={s.tarjetas}>
              {copy.chat.accionesRapidas.map((a, i) => (
                <button key={a.etiqueta} type="button" className={s.tarjeta} style={{ ['--i' as string]: i }} disabled={enviando} onClick={() => enviar(a.mensaje)}>
                  <span className={s.tarjetaNumero}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.tarjetaTitulo}>{a.etiqueta}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {mensajes.map((m, i) => (
          <article key={i} className={m.rol === 'user' ? s.mensajeVos : s.mensajeAgente}>
            <p className={s.etiqueta}>{m.rol === 'user' ? copy.chat.etiquetaVos : copy.chat.etiquetaAgente}</p>
            <p className={s.texto}>{m.contenido}</p>
            {m.acciones?.map((a, j) => (
              <div key={j} className={a.ok ? s.accion : `${s.accion} ${s.accionFallo}`}>
                <i className={s.led} aria-hidden />
                <span>
                  {a.ok ? copy.chat.herramientas[a.herramienta] ?? a.herramienta : copy.chat.herramientaFallo}
                  {a.ok && a.resumen && a.resumen !== 'ok' && a.resumen !== 'propuesta' ? `: ${a.resumen}` : ''}
                </span>
                {a.propuesta && (
                  <div className={s.propuesta}>
                    <p className={s.propuestaTitulo}>{copy.chat.propuestaTitulo}</p>
                    <ul className={s.propuestaLista}>
                      {a.propuesta.bloques.map((b, k) => (
                        <li key={k}>
                          <span>{b.titulo}</span>
                          <span className={s.propuestaCuando}>
                            {copy.semana.diasLabel[b.dia as keyof typeof copy.semana.diasLabel] ?? b.dia} {b.horaInicio}–{b.horaFin}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {i === mensajes.length - 1 && (
                      <div className={base.filaBotones}>
                        <button type="button" className={base.btn} disabled={enviando} onClick={() => enviar(copy.chat.mensajeSi)}>
                          {copy.chat.propuestaSi}
                        </button>
                        <button type="button" className={base.btnSec} disabled={enviando} onClick={() => enviar(copy.chat.mensajeCambiar)}>
                          {copy.chat.propuestaCambiar}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </article>
        ))}
        {enviando && (
          <div className={s.mensajeAgente} role="status">
            <p className={s.etiqueta}>{copy.chat.etiquetaAgente}</p>
            <span className={s.onda} aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className={s.soloLectores}>{copy.chat.enviando}</span>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}

      <div className={s.compositor}>
        <div className={s.rapidas} hidden={mensajes.length === 0}>
          {copy.chat.accionesRapidas.map((a) => (
            <button key={a.etiqueta} type="button" className={s.rapida} disabled={enviando} onClick={() => enviar(a.mensaje)}>
              {a.etiqueta}
            </button>
          ))}
        </div>
        <div className={s.caja}>
          <textarea
            ref={areaRef}
            className={s.area}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviar(texto);
              }
            }}
            placeholder={copy.chat.placeholder}
            aria-label={copy.chat.placeholder}
            rows={1}
            maxLength={2000}
          />
          <button type="button" className={s.enviar} onClick={() => enviar(texto)} disabled={enviando || !texto.trim()}>
            {enviando ? copy.chat.enviando : copy.chat.enviar}
          </button>
        </div>
        {modelos.length > 1 && (
          <label className={s.modelo}>
            <span>{copy.chat.modelo}</span>
            <select value={modeloId} onChange={(e) => setModeloId(e.target.value)} disabled={enviando}>
              {modelos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
