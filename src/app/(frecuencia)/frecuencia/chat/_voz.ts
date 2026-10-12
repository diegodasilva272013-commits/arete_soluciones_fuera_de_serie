'use client';

/**
 * Voz del chat de Frecuencia: mensajes de voz (se graba el audio y el agente lo
 * entiende) y MODO CONVERSACIÓN (manos libres: escucha, detecta cuándo dejaste
 * de hablar, responde con voz y vuelve a escuchar).
 *
 * Todo con la API de NVIDIA (la misma clave del agente), vía el servidor:
 * Audio → texto: /api/frecuencia/voz/transcribir (Parakeet). El audio se convierte
 * a WAV 16 kHz en el navegador. Si el servidor no puede, respaldo con el
 * reconocimiento de voz del navegador, que corre en paralelo mientras se graba.
 * Texto → voz: /api/frecuencia/voz/hablar (Magpie); si no puede, la voz del navegador.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { copy } from '../_copy';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CLAVE_LEER = 'frecuencia_chat_leer_voz';
const UMBRAL_VOZ = 0.035; // volumen (RMS 0..1) a partir del cual se considera que alguien habla
const SILENCIO_MS = 1300; // silencio después de hablar que cierra el turno
const ESPERA_VOZ_MS = 25_000; // si nadie habla en este tiempo, se reinicia la escucha
const MAX_TURNO_MS = 60_000;
const MIN_BYTES = 1500;
// WAV de silencio: sirve para "desbloquear" el audio en iOS/Safari con un toque de la persona.
const WAV_SILENCIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

export type EstadoConversacion = 'escuchando' | 'pensando' | 'hablando';

/** Texto limpio para leer en voz alta: sin markdown ni símbolos sueltos. */
export function paraVoz(t: string): string {
  return t.replace(/[*_`#>~]+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

/** Convierte el audio grabado (webm/mp4) a WAV mono de 16 kHz y 16 bits: el formato que pide el reconocimiento de voz de NVIDIA. */
export async function aWav16k(blob: Blob): Promise<Blob | null> {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    const dec: AudioBuffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    void ctx.close();
    const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(dec.duration * 16000)), 16000);
    const fuente = off.createBufferSource();
    fuente.buffer = dec;
    fuente.connect(off.destination);
    fuente.start();
    const pcm = (await off.startRendering()).getChannelData(0);
    const v = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const txt = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    txt(0, 'RIFF'); v.setUint32(4, 36 + pcm.length * 2, true); txt(8, 'WAVEfmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    txt(36, 'data'); v.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 0x7fff, true);
    return new Blob([v], { type: 'audio/wav' });
  } catch {
    return null;
  }
}

interface Captura {
  parar: () => Promise<{ blob: Blob; vivo: string }>;
  cancelar: () => void;
}

export function useVoz({
  enviarRef,
  ocupado,
  setError,
}: {
  /** Manda el texto al agente y devuelve su respuesta (o null si falló). Se encarga de leerla en voz alta. */
  enviarRef: React.MutableRefObject<(texto: string) => Promise<string | null>>;
  ocupado: boolean;
  setError: (e: string | null) => void;
}) {
  const [soporta, setSoporta] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [conversando, setConversando] = useState(false);
  const [estadoConv, setEstadoConv] = useState<EstadoConversacion>('escuchando');
  const [hablando, setHablando] = useState(false);
  const [leer, setLeer] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const capturaRef = useRef<Captura | null>(null);
  const rafRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resolverVozRef = useRef<(() => void) | null>(null);
  const conversandoRef = useRef(false);
  const leerRef = useRef(false);
  const turnoRef = useRef(0);
  const servidorSTT = useRef(true);
  const servidorTTS = useRef(true);

  useEffect(() => {
    setSoporta(typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
    try {
      const v = localStorage.getItem(CLAVE_LEER) === '1';
      setLeer(v);
      leerRef.current = v;
    } catch { /* sin almacenamiento: queda apagado */ }
    return () => {
      conversandoRef.current = false;
      turnoRef.current++;
      cancelAnimationFrame(rafRef.current);
      try { capturaRef.current?.cancelar(); } catch { /* nada */ }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void ctxRef.current?.close().catch(() => {});
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Salida: la voz del agente ──

  const pararVoz = useCallback(() => {
    try { audioRef.current?.pause(); } catch { /* nada */ }
    window.speechSynthesis?.cancel();
    setHablando(false);
    const r = resolverVozRef.current;
    resolverVozRef.current = null;
    r?.();
  }, []);

  /** Un toque de la persona "desbloquea" el audio para que después pueda hablar solo (iOS/Safari). */
  const desbloquearAudio = useCallback(() => {
    try {
      const a = audioRef.current ?? new Audio();
      audioRef.current = a;
      a.src = WAV_SILENCIO;
      void a.play().catch(() => {});
    } catch { /* nada */ }
    try { window.speechSynthesis?.speak(new SpeechSynthesisUtterance('')); } catch { /* nada */ }
  }, []);

  const hablar = useCallback(
    (texto: string): Promise<void> => {
      const t = paraVoz(texto);
      if (!t) return Promise.resolve();
      pararVoz();
      return new Promise<void>((resolve) => {
        resolverVozRef.current = resolve;
        setHablando(true);
        const fin = () => {
          setHablando(false);
          if (resolverVozRef.current === resolve) resolverVozRef.current = null;
          resolve();
        };
        const conVozDelNavegador = () => {
          const synth = window.speechSynthesis;
          if (!synth) return fin();
          const u = new SpeechSynthesisUtterance(t);
          u.lang = 'es-AR';
          const voces = synth.getVoices();
          u.voice = voces.find((x) => x.lang === 'es-AR') ?? voces.find((x) => /^es[-_](419|MX|US)/i.test(x.lang)) ?? voces.find((x) => x.lang.toLowerCase().startsWith('es')) ?? null;
          u.onend = fin;
          u.onerror = fin;
          synth.speak(u);
        };
        void (async () => {
          if (servidorTTS.current) {
            try {
              const r = await fetch('/api/frecuencia/voz/hablar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: t }) });
              if (r.ok) {
                const url = URL.createObjectURL(await r.blob());
                const a = audioRef.current ?? new Audio();
                audioRef.current = a;
                a.onended = () => { URL.revokeObjectURL(url); fin(); };
                a.onerror = () => { URL.revokeObjectURL(url); conVozDelNavegador(); };
                a.src = url;
                try { await a.play(); return; } catch { URL.revokeObjectURL(url); }
              } else if (r.status !== 429) {
                servidorTTS.current = false; // sin clave / sin crédito: se usa la voz del navegador hasta recargar
              }
            } catch {
              servidorTTS.current = false;
            }
          }
          conVozDelNavegador();
        })();
      });
    },
    [pararVoz],
  );

  /** Lee la respuesta si la persona lo pidió o si está en modo conversación. */
  const hablarSiCorresponde = useCallback((texto: string): Promise<void> => (leerRef.current || conversandoRef.current ? hablar(texto) : Promise.resolve()), [hablar]);

  const cambiarLeer = useCallback(
    (v: boolean) => {
      setLeer(v);
      leerRef.current = v;
      try { localStorage.setItem(CLAVE_LEER, v ? '1' : '0'); } catch { /* nada */ }
      if (v) desbloquearAudio();
      else if (!conversandoRef.current) pararVoz();
    },
    [desbloquearAudio, pararVoz],
  );

  // ── Entrada: el micrófono ──

  async function abrirMic(): Promise<boolean> {
    if (streamRef.current?.active) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        const ctx: AudioContext = new Ctx();
        const an = ctx.createAnalyser();
        an.fftSize = 1024;
        ctx.createMediaStreamSource(stream).connect(an);
        ctxRef.current = ctx;
        analyserRef.current = an;
      }
      return true;
    } catch (e) {
      const nombre = (e as Error).name;
      setError(nombre === 'NotFoundError' ? copy.chat.voz.sinMicrofono : nombre === 'NotAllowedError' || nombre === 'SecurityError' ? copy.chat.voz.permiso : copy.chat.voz.sinEntender);
      return false;
    }
  }

  function cerrarMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
  }

  /** Graba el audio y, en paralelo, reconoce lo que se dice con el navegador (respaldo si el servidor no puede). */
  function iniciarCaptura(): Captura | null {
    const stream = streamRef.current;
    if (!stream) return null;
    const mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const trozos: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data); };

    let final = '';
    let parcial = '';
    let sr: any = null;
    let srTermino: () => void = () => {};
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      try {
        sr = new SR();
        sr.lang = 'es-AR';
        sr.interimResults = true;
        sr.continuous = true;
        sr.onresult = (e: any) => {
          parcial = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) final += `${r[0].transcript} `;
            else parcial += r[0].transcript;
          }
        };
        sr.onerror = () => {};
        sr.onend = () => srTermino();
        sr.start();
      } catch { sr = null; }
    }

    rec.start();
    return {
      parar: () =>
        new Promise((resolve) => {
          const cerrar = () => resolve({ blob: new Blob(trozos, { type: rec.mimeType || mime || 'audio/webm' }), vivo: `${final}${parcial}`.trim() });
          rec.onstop = async () => {
            if (sr) {
              await new Promise<void>((ok) => {
                srTermino = ok;
                setTimeout(ok, 700); // el reconocimiento puede tardar un instante en soltar lo último
                try { sr.stop(); } catch { ok(); }
              });
            }
            cerrar();
          };
          try { rec.stop(); } catch { cerrar(); }
        }),
      cancelar: () => {
        rec.onstop = null;
        try { rec.stop(); } catch { /* nada */ }
        try { sr?.abort(); } catch { /* nada */ }
      },
    };
  }

  /** Del audio al texto: servidor primero, respaldo con lo que reconoció el navegador. */
  async function aTexto(blob: Blob, vivo: string): Promise<string> {
    const wav = servidorSTT.current && blob.size >= MIN_BYTES ? await aWav16k(blob) : null;
    if (wav) {
      try {
        const fd = new FormData();
        fd.append('audio', wav, 'voz.wav');
        const r = await fetch('/api/frecuencia/voz/transcribir', { method: 'POST', body: fd });
        if (r.ok) {
          const d = (await r.json()) as { texto?: string };
          if (d.texto?.trim()) return d.texto.trim();
        } else if (r.status === 422) {
          return vivo; // el servidor no oyó voz
        } else if (r.status !== 429) {
          servidorSTT.current = false; // sin clave / sin crédito: se usa el navegador hasta recargar
        }
      } catch {
        servidorSTT.current = false;
      }
    }
    return vivo;
  }

  // ── Mensaje de voz: tocás, hablás, tocás y se envía ──

  const grabarNota = useCallback(async () => {
    if (conversandoRef.current) return;
    if (grabando) {
      const captura = capturaRef.current;
      capturaRef.current = null;
      setGrabando(false);
      if (!captura) return;
      setTranscribiendo(true);
      try {
        const { blob, vivo } = await captura.parar();
        cerrarMic();
        const t = await aTexto(blob, vivo);
        if (!t) setError(copy.chat.voz.sinEntender);
        else await enviarRef.current(t);
      } finally {
        setTranscribiendo(false);
      }
      return;
    }
    if (ocupado || transcribiendo) return;
    pararVoz();
    desbloquearAudio();
    setError(null);
    if (!(await abrirMic())) return;
    const captura = iniciarCaptura();
    if (!captura) return;
    capturaRef.current = captura;
    setGrabando(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grabando, ocupado, transcribiendo]);

  // ── Modo conversación ──

  function escucharTurno() {
    if (!conversandoRef.current) return;
    const id = ++turnoRef.current;
    setEstadoConv('escuchando');
    const captura = iniciarCaptura();
    const an = analyserRef.current;
    if (!captura || !an) {
      setError(copy.chat.voz.sinEntender);
      terminarConversacion();
      return;
    }
    capturaRef.current = captura;
    const buf = new Uint8Array(an.fftSize);
    const inicio = performance.now();
    let hablo = false;
    let silencioDesde = 0;

    const finalizar = async () => {
      setEstadoConv('pensando');
      const { blob, vivo } = await captura.parar();
      if (id !== turnoRef.current || !conversandoRef.current) return;
      const t = await aTexto(blob, vivo);
      if (id !== turnoRef.current || !conversandoRef.current) return;
      if (!t) return escucharTurno();
      setEstadoConv('hablando');
      await enviarRef.current(t); // el chat lee la respuesta en voz alta y termina cuando acaba de hablar
      if (conversandoRef.current) escucharTurno();
    };

    const tick = () => {
      if (id !== turnoRef.current || !conversandoRef.current) return;
      an.getByteTimeDomainData(buf);
      let suma = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        suma += v * v;
      }
      const rms = Math.sqrt(suma / buf.length);
      const ahora = performance.now();
      if (rms > UMBRAL_VOZ) {
        hablo = true;
        silencioDesde = 0;
      } else if (hablo) {
        if (!silencioDesde) silencioDesde = ahora;
        else if (ahora - silencioDesde > SILENCIO_MS) return void finalizar();
      }
      if (!hablo && ahora - inicio > ESPERA_VOZ_MS) {
        captura.cancelar(); // nadie habló: se descarta y se vuelve a escuchar, sin acumular audio
        return escucharTurno();
      }
      if (ahora - inicio > MAX_TURNO_MS) return void finalizar();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  async function iniciarConversacion() {
    if (conversandoRef.current || ocupado || grabando) return;
    pararVoz();
    desbloquearAudio();
    setError(null);
    if (!(await abrirMic())) return;
    conversandoRef.current = true;
    setConversando(true);
    escucharTurno();
  }

  function terminarConversacion() {
    conversandoRef.current = false;
    turnoRef.current++;
    cancelAnimationFrame(rafRef.current);
    try { capturaRef.current?.cancelar(); } catch { /* nada */ }
    capturaRef.current = null;
    cerrarMic();
    pararVoz();
    setConversando(false);
    setGrabando(false);
    setTranscribiendo(false);
  }

  return {
    soporta,
    grabando,
    transcribiendo,
    conversando,
    estadoConv,
    hablando,
    leer,
    cambiarLeer,
    grabarNota,
    iniciarConversacion,
    terminarConversacion,
    pararVoz,
    hablarSiCorresponde,
  };
}
