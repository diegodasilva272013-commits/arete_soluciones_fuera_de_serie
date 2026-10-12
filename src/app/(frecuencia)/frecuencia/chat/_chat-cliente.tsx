'use client';

/**
 * Chat de texto del agente (5.4). Referencia FUNCIONAL de los componentes de
 * 21st.dev, diseño propio de Areté: caja de texto que crece sola, acciones
 * rápidas, selector de modelo (de la base), estados reales (enviando,
 * herramientas usadas, propuesta de semana para confirmar). Sin librerías nuevas.
 *
 * Voz: dictado con SpeechRecognition (mensajes de voz que se envían al terminar)
 * y lectura de las respuestas con speechSynthesis. Todo en el navegador: sin
 * claves ni servicios externos.
 */

import { useEffect, useRef, useState } from 'react';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_chat.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CLAVE_LEER = 'frecuencia_chat_leer_voz';

/** Texto limpio para leer en voz alta: sin markdown ni símbolos sueltos. */
function paraVoz(t: string): string {
  return t.replace(/[*_`#>~]+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

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

  // ── Voz ──
  const [soportaDictado, setSoportaDictado] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [leer, setLeer] = useState(false);
  const [hablando, setHablando] = useState(false);
  const recRef = useRef<any>(null);
  const leerRef = useRef(false);
  const enviarRef = useRef<(t: string) => void>(() => {});

  useEffect(() => {
    setSoportaDictado(!!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    try {
      const v = localStorage.getItem(CLAVE_LEER) === '1';
      setLeer(v);
      leerRef.current = v;
    } catch { /* sin almacenamiento: queda apagado */ }
    return () => {
      try { recRef.current?.abort(); } catch { /* nada */ }
      window.speechSynthesis?.cancel();
    };
  }, []);

  function cambiarLeer(v: boolean) {
    setLeer(v);
    leerRef.current = v;
    try { localStorage.setItem(CLAVE_LEER, v ? '1' : '0'); } catch { /* nada */ }
    if (!v) { window.speechSynthesis?.cancel(); setHablando(false); }
    else desbloquearVoz();
  }

  // iOS/Safari solo deja hablar si la primera voz sale de un toque de la persona.
  function desbloquearVoz() {
    try { window.speechSynthesis?.speak(new SpeechSynthesisUtterance('')); } catch { /* nada */ }
  }

  function hablar(texto: string) {
    const synth = window.speechSynthesis;
    const t = paraVoz(texto);
    if (!synth || !t) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'es-AR';
    const voces = synth.getVoices();
    u.voice = voces.find((x) => x.lang === 'es-AR') ?? voces.find((x) => /^es[-_](419|MX|US)/i.test(x.lang)) ?? voces.find((x) => x.lang.toLowerCase().startsWith('es')) ?? null;
    u.onstart = () => setHablando(true);
    u.onend = () => setHablando(false);
    u.onerror = () => setHablando(false);
    synth.speak(u);
  }

  function pararVoz() {
    window.speechSynthesis?.cancel();
    setHablando(false);
  }

  function alternarDictado() {
    if (grabando) {
      recRef.current?.stop(); // onend envía lo dictado
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || enviando) return;
    pararVoz();
    desbloquearVoz();
    setError(null);
    const rec = new SR();
    rec.lang = 'es-AR';
    rec.interimResults = true;
    rec.continuous = true;
    let final = '';
    let parcial = '';
    let fallo = false;
    rec.onresult = (e: any) => {
      parcial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += `${r[0].transcript} `;
        else parcial += r[0].transcript;
      }
      setTexto(`${final}${parcial}`.trim());
    };
    rec.onerror = (e: any) => {
      fallo = true;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setError(copy.chat.voz.permiso);
      else if (e.error === 'audio-capture') setError(copy.chat.voz.sinMicrofono);
      else if (e.error !== 'aborted') setError(copy.chat.voz.sinEntender);
    };
    rec.onend = () => {
      setGrabando(false);
      recRef.current = null;
      const t = `${final}${parcial}`.trim();
      if (t) enviarRef.current(t);
      else if (!fallo) setError(copy.chat.voz.sinEntender);
    };
    recRef.current = rec;
    try {
      rec.start();
      setGrabando(true);
    } catch {
      setError(copy.chat.voz.sinEntender);
    }
  }

  // La caja de texto crece sola con lo que se escribe.
  useEffect(() => {
    const a = areaRef.current;
    if (!a) return;
    a.style.height = 'auto';
    a.style.height = `${Math.min(a.scrollHeight, 180)}px`;
  }, [texto]);

  const primera = useRef(true);
  useEffect(() => {
    // Al abrir no se salta al final: solo cuando llega algo nuevo.
    if (primera.current) {
      primera.current = false;
      return;
    }
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
        if (leerRef.current) hablar(String(d.respuesta ?? ''));
      }
    } catch {
      setError(copy.chat.errores.generico);
    } finally {
      setEnviando(false);
      areaRef.current?.focus();
    }
  }

  enviarRef.current = enviar;

  return (
    <div className={s.wrap}>
      <div className={s.hilo} role="log" aria-label={copy.chat.titulo}>
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
          <div className={s.mensajeAgente}>
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
          <button
            type="button"
            className={grabando ? `${s.microfono} ${s.microfonoActivo}` : s.microfono}
            onClick={alternarDictado}
            disabled={!soportaDictado || (enviando && !grabando)}
            aria-pressed={grabando}
            title={soportaDictado ? undefined : copy.chat.voz.noSoportado}
          >
            {grabando ? copy.chat.voz.grabando : copy.chat.voz.grabar}
          </button>
          <button type="button" className={s.enviar} onClick={() => enviar(texto)} disabled={enviando || !texto.trim()}>
            {enviando ? copy.chat.enviando : copy.chat.enviar}
          </button>
        </div>
        <div className={s.vozFila}>
          <label>
            <input type="checkbox" checked={leer} onChange={(e) => cambiarLeer(e.target.checked)} />
            <span>{copy.chat.voz.leer}</span>
          </label>
          {hablando && (
            <button type="button" onClick={pararVoz}>
              {copy.chat.voz.detenerVoz}
            </button>
          )}
          {!soportaDictado && <span>{copy.chat.voz.noSoportado}</span>}
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
