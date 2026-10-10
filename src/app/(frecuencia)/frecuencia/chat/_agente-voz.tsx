'use client';

/**
 * Agente de VOZ (5.5): conecta @11labs/client con el agente de ElevenLabs de Frecuencia (agentId
 * en NEXT_PUBLIC_FRECUENCIA_AGENT_ID: no es secreto). Todo lo que se ve es REAL: el modo
 * (escuchando / hablando) viene de la librería y la onda se dibuja con el volumen real de
 * entrada y de salida (getInputVolume / getOutputVolume), sin datos al azar ni modo demo.
 * Las herramientas del agente (client tools) llaman al servidor, que ejecuta la MISMA capa
 * de herramientas que el chat de texto.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Conversation, type Mode, type Status } from '@11labs/client';
import { esAfirmativo } from '@/lib/frecuencia/ia/historial';
import { NOMBRES_HERRAMIENTAS } from '@/lib/frecuencia/ia/herramientas-def';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import s from './_agente-voz.module.css';

const BARRAS = 24;

export function AgenteVoz({ agentId }: { agentId: string | null }) {
  const [estado, setEstado] = useState<Status>('disconnected');
  const [modo, setModo] = useState<Mode>('listening');
  const [error, setError] = useState<string | null>(null);
  const [lineas, setLineas] = useState<{ quien: 'user' | 'ai'; texto: string }[]>([]);
  const [propuesta, setPropuesta] = useState<{ hash: string; bloques: { dia: string; horaInicio: string; horaFin: string; titulo: string }[] } | null>(null);
  const convRef = useRef<Conversation | null>(null);
  const barrasRef = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef(0);
  // Estado de la confirmación de la semana: lo mostrado y si la persona dijo que sí DESPUÉS.
  const hashMostrado = useRef<string | null>(null);
  const confirmado = useRef(false);

  const llamar = useCallback(async (nombre: string, argumentos: unknown): Promise<string> => {
    const r = await fetch('/api/frecuencia/voz/herramientas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, argumentos, hashMostrado: hashMostrado.current, confirmadoPorPersona: confirmado.current }),
    });
    const d = (await r.json().catch(() => ({ ok: false, error: 'error' }))) as { ok: boolean; estado?: string; propuesta_hash?: string; bloques?: { dia: string; horaInicio: string; horaFin: string; titulo: string }[] };
    if (nombre === 'armar_semana' && d.ok && d.estado === 'propuesta' && d.propuesta_hash) {
      hashMostrado.current = d.propuesta_hash;
      confirmado.current = false; // hace falta un sí NUEVO después de esta propuesta
      setPropuesta({ hash: d.propuesta_hash, bloques: d.bloques ?? [] });
    }
    return JSON.stringify(d);
  }, []);

  // La onda: volumen real de entrada (cuando escucha) o de salida (cuando habla), cuadro a cuadro.
  useEffect(() => {
    if (estado !== 'connected') return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const c = convRef.current;
      const v = c ? (modo === 'speaking' ? c.getOutputByteFrequencyData() : c.getInputByteFrequencyData()) : null;
      barrasRef.current.forEach((el, i) => {
        if (!el) return;
        const x = v && v.length ? v[Math.floor((i / BARRAS) * v.length * 0.6)] / 255 : 0;
        el.style.transform = `scaleY(${reducido ? 0.2 + (x > 0.05 ? 0.4 : 0) : 0.08 + x * 0.92})`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [estado, modo]);

  useEffect(() => () => void convRef.current?.endSession(), []);

  async function iniciar() {
    if (!agentId || estado !== 'disconnected') return;
    setError(null);
    setLineas([]);
    setPropuesta(null);
    hashMostrado.current = null;
    confirmado.current = false;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(copy.voz.permisoMicrofono);
      return;
    }
    try {
      const ctx = await fetch('/api/frecuencia/voz/contexto').then((r) => (r.ok ? r.json() : { variables: {} }));
      const clientTools = Object.fromEntries(NOMBRES_HERRAMIENTAS.map((n) => [n, (params: unknown) => llamar(n, params)]));
      convRef.current = await Conversation.startSession({
        agentId,
        connectionType: 'websocket',
        dynamicVariables: ctx.variables,
        clientTools,
        onStatusChange: ({ status }) => setEstado(status),
        onModeChange: ({ mode }) => setModo(mode),
        onMessage: ({ message, source }) => {
          setLineas((l) => [...l.slice(-30), { quien: source, texto: message }]);
          // "Su sí": la última frase de la PERSONA después de la propuesta tiene que ser afirmativa.
          if (source === 'user' && hashMostrado.current) confirmado.current = esAfirmativo(message);
        },
        onDisconnect: () => {
          convRef.current = null;
          setEstado('disconnected');
        },
        onError: () => setError(copy.voz.errorGenerico),
      });
    } catch {
      setError(copy.voz.errorGenerico);
      setEstado('disconnected');
    }
  }

  async function cortar() {
    await convRef.current?.endSession();
    convRef.current = null;
    setEstado('disconnected');
  }

  if (!agentId) {
    return (
      <section className={s.caja}>
        <p className={s.titulo}>{copy.voz.titulo}</p>
        <p className={`${base.ayuda} ${s.aviso}`}>{copy.voz.sinAgente}</p>
      </section>
    );
  }

  const activo = estado === 'connected';
  return (
    <section className={s.caja} aria-label={copy.voz.titulo}>
      <p className={s.titulo}>{copy.voz.titulo}</p>
      <div className={s.escena} data-modo={activo ? modo : 'reposo'}>
        <span className={s.onda} aria-hidden>
          {Array.from({ length: BARRAS }, (_, i) => (
            <i key={i} ref={(el) => void (el && (barrasRef.current[i] = el as unknown as HTMLSpanElement))} />
          ))}
        </span>
        <p className={s.estado} role="status">
          {estado === 'connecting' ? copy.voz.conectando : activo ? (modo === 'speaking' ? copy.voz.hablando : copy.voz.escuchando) : ''}
        </p>
      </div>
      <div className={base.filaBotones}>
        {activo || estado === 'connecting' ? (
          <button type="button" className={base.btnSec} onClick={cortar}>
            {copy.voz.cortar}
          </button>
        ) : (
          <button type="button" className={base.btn} onClick={iniciar}>
            {copy.voz.iniciar}
          </button>
        )}
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {propuesta && (
        <div className={s.propuesta}>
          <p className={s.sub}>{copy.voz.propuesta}</p>
          <ul>
            {propuesta.bloques.map((b, i) => (
              <li key={i}>
                <span>{b.titulo}</span>
                <span className={s.cuando}>
                  {copy.semana.diasLabel[b.dia as keyof typeof copy.semana.diasLabel] ?? b.dia} {b.horaInicio}–{b.horaFin}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {lineas.length > 0 && (
        <div className={s.transcripcion}>
          <p className={s.sub}>{copy.voz.transcripcion}</p>
          {lineas.map((l, i) => (
            <p key={i} className={l.quien === 'ai' ? s.lineaAgente : s.lineaVos}>
              {l.texto}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
