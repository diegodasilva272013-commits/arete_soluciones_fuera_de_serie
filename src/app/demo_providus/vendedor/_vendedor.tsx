'use client';

/**
 * DEMO PROVIDUS — pantalla del vendedor.
 * Los leads que cargan las promotoras en su zona le llegan solos (consulta cada ~2 s), para
 * llamarlos apenas entran: botón de llamada y de WhatsApp en cada uno, y marcar cómo fue el
 * contacto. Pensada para el celular. Al llegar un lead nuevo vibra y suena (si activó el sonido).
 * El servidor solo devuelve los leads asignados a este vendedor.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatoLegible } from '@/lib/demo-providus/telefono';
import { ETIQUETA_LLAMADA } from '@/lib/demo-providus/resultado-llamada';
import { LoginVendedor } from '../_acceso';

type Contacto = 'nuevo' | 'contactado' | 'sin_respuesta';
interface Lead {
  id: string;
  creado_en: string;
  asignado_en: string | null;
  nombre: string;
  apellido: string;
  telefono: string;
  telefono_e164: string;
  provincia: string;
  localidad: string | null;
  foto_url: string | null;
  evento: string | null;
  promotora_nombre: string | null;
  promotora_apellido: string | null;
  sucursal: string | null;
  contacto_estado: Contacto;
  contacto_en: string | null;
  llamada_estado: string | null;
  llamada_segundos?: number | null;
  llamada_resumen?: string | null;
}
interface Yo { id: string; nombre: string; apellido: string; provincias: string[]; recibe_resto: boolean }

const CADA_MS = 2000;
const NUEVO_MS = 9000;
const CLAVE_SONIDO = 'pv_vendedor_sonido';
const CURVA = 'ease-[cubic-bezier(0.32,0.72,0,1)]';

const ts = (l: Lead) => new Date(l.asignado_en ?? l.creado_en).getTime();
const iniciales = (n: string, a: string) => `${n.trim()[0] ?? ''}${a.trim()[0] ?? ''}`.toUpperCase();
const lugar = (l: Lead) => (l.localidad && l.localidad !== l.provincia ? `${l.localidad}, ${l.provincia}` : l.provincia);
function hace(t: number, ahora: number): string {
  const s = Math.max(0, Math.floor((ahora - t) / 1000));
  if (s < 60) return `hace ${s} s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return new Date(t).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

function Foto({ l }: { l: Lead }) {
  const [fallo, setFallo] = useState(false);
  const caja = 'h-16 w-16 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(224,96,58,0.5),0_0_24px_-6px_rgba(224,96,58,0.55)]';
  if (!l.foto_url || fallo) {
    return <span className={`${caja} grid place-items-center bg-[linear-gradient(145deg,#f0562a,#9c2f10)] text-[19px] font-semibold text-[#fff6ef]`} aria-hidden="true">{iniciales(l.nombre, l.apellido)}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={l.foto_url} alt="" width={64} height={64} onError={() => setFallo(true)} className={`${caja} object-cover`} />;
}

const icoTel = (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.600 2.800c.5-.1 1 .1 1.200.6l1.400 3.300c.2.4.1.9-.2 1.200L7.700 9.200a12 12 0 0 0 7.100 7.100l1.300-1.300c.3-.3.800-.4 1.200-.2l3.300 1.400c.5.200.7.700.6 1.200l-.4 2.700c-.1.700-.7 1.200-1.400 1.200C10.800 21.300 2.700 13.200 2.700 4.600c0-.7.500-1.300 1.200-1.400l2.700-.4Z" /></svg>);
const icoWa = (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.400a9.600 9.600 0 0 0-8.200 14.600L2.500 21.500l4.600-1.200A9.600 9.600 0 1 0 12 2.400Zm4.900 13.600c-.2.600-1.200 1.100-1.700 1.200-.4.100-1 .1-1.600-.1-2.800-1-4.600-3.400-4.800-3.600-.1-.2-1.100-1.500-1.100-2.800 0-1.300.7-1.900.9-2.200.2-.2.500-.3.700-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.700.2.300.8 1.300 1.700 2.100 1.200 1 2.200 1.300 2.500 1.500.3.100.5.100.7-.1l.9-1.100c.2-.3.4-.2.700-.1l1.900.9c.3.100.5.200.5.400 0 .1 0 .7-.2 1.300Z" /></svg>);

function Tarjeta({ l, ahora, nuevo, alMarcar }: { l: Lead; ahora: number; nuevo: boolean; alMarcar: (e: Contacto) => void }) {
  const mensaje = `Hola ${l.nombre}, te escribo de Providus. Hoy dejaste tus datos en nuestro stand. ¿Podemos hablar un minuto?`;
  const wa = `https://wa.me/${l.telefono_e164.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
  const eti = l.llamada_estado ? ETIQUETA_LLAMADA[l.llamada_estado] : undefined;
  const hecho = l.contacto_estado !== 'nuevo';
  const boton = `inline-flex h-9 touch-manipulation items-center justify-center rounded-full px-4 text-[13px] font-medium text-[#ebe6dd] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition-[background-color,box-shadow,transform] duration-500 ${CURVA} hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] active:scale-[0.97]`;
  return (
    <li className={`rounded-[28px] p-1.5 transition-[box-shadow,opacity] duration-700 ${CURVA} ${nuevo ? 'bg-[rgba(224,96,58,0.08)] shadow-[0_0_0_1px_rgba(224,96,58,0.6),0_0_44px_-10px_rgba(224,96,58,0.55)]' : 'bg-white/[0.025] shadow-[0_0_0_1px_rgba(255,255,255,0.07)]'} ${hecho ? 'opacity-60' : ''}`}>
      <div className="rounded-[22px] bg-[#0d0b09] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-4">
          <Foto l={l} />
          <div className="min-w-0 flex-1">
            <p className="pv-display truncate text-[19px] leading-tight text-[#ebe6dd]">{l.nombre} {l.apellido}</p>
            <p className="pv-num mt-1 text-[17px] font-semibold tracking-wide text-[#e3c58e]">{formatoLegible(l.telefono_e164)}</p>
            <p className="mt-0.5 truncate text-[13.5px] text-[#9c8c75]">{lugar(l)}</p>
          </div>
          {nuevo && <span className="shrink-0 self-start rounded-full bg-[linear-gradient(145deg,#f0562a,#c23a14)] px-2.5 py-1 text-[12px] font-semibold text-[#fff6ef] shadow-[0_0_18px_-4px_rgba(224,96,58,0.8)]">Nuevo</span>}
        </div>

        <p className="mt-3 text-[12.5px] leading-snug text-[#7f705c]">
          Cargó {l.promotora_nombre ? `${l.promotora_nombre} ${l.promotora_apellido ?? ''}`.trim() : 'una promotora'}
          {l.evento ? ` en ${l.evento}` : ''}. <span className="pv-num">{hace(ts(l), ahora)}</span>
        </p>
        {eti && (
          <div className="mt-2">
            <p className={`text-[12.5px] font-medium ${eti.bueno ? 'text-[#e3c58e]' : 'text-[#f08a73]'}`}>{eti.larga}{l.llamada_estado === 'atendida' && l.llamada_segundos ? ` Duró ${l.llamada_segundos} s.` : ''}</p>
            {l.llamada_resumen && (
              <details className="mt-1.5 text-[12.5px] text-[#9c8c75]">
                <summary className="cursor-pointer text-[#b4a892] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e]">Qué se habló</summary>
                <p className="mt-1.5 leading-relaxed">{l.llamada_resumen}</p>
              </details>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a href={`tel:${l.telefono_e164}`} className={`pv-boton group inline-flex h-12 touch-manipulation items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-[#fff6ef] transition-transform duration-500 ${CURVA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] active:scale-[0.98]`}>
            {icoTel}Llamar
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`inline-flex h-12 touch-manipulation items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-[#7be0a0] shadow-[inset_0_0_0_1px_rgba(123,224,160,0.4)] transition-[background-color,transform] duration-500 ${CURVA} hover:bg-[rgba(123,224,160,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] active:scale-[0.98]`}>
            {icoWa}WhatsApp
          </a>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {l.contacto_estado === 'nuevo' ? (
            <>
              <button type="button" onClick={() => alMarcar('contactado')} className={boton}>Ya lo llamé</button>
              <button type="button" onClick={() => alMarcar('sin_respuesta')} className={boton}>No contestó</button>
            </>
          ) : (
            <>
              <span className="text-[13px] text-[#8a7a64]">{l.contacto_estado === 'contactado' ? 'Contactado' : 'No contestó'}</span>
              <button type="button" onClick={() => alMarcar('nuevo')} className={boton}>Volver a pendientes</button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function Panel({ alVencer }: { alVencer: () => void }) {
  const [yo, setYo] = useState<Yo | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cargado, setCargado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ahora, setAhora] = useState(0);
  const [vista, setVista] = useState<'pendientes' | 'vistos'>('pendientes');
  const [sonido, setSonido] = useState(false);
  const [nuevos, setNuevos] = useState<Record<string, number>>({});
  const [enVivo, setEnVivo] = useState(false);

  const conocidos = useRef<Set<string> | null>(null);
  const sonidoRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const enCurso = useRef(false);

  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    try { const v = localStorage.getItem(CLAVE_SONIDO) === '1'; setSonido(v); sonidoRef.current = v; } catch { /* arranca apagado */ }
  }, []);

  const contexto = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume().catch(() => {});
      return ctxRef.current;
    } catch { return null; }
  }, []);
  const avisar = useCallback(() => {
    try { navigator.vibrate?.([220, 90, 220]); } catch { /* sin vibración */ }
    if (!sonidoRef.current) return;
    const ctx = contexto();
    if (!ctx) return;
    [880, 1175].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain(); const t0 = ctx.currentTime + i * 0.16;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + 0.15);
    });
  }, [contexto]);
  function alternarSonido() {
    const v = !sonido;
    setSonido(v); sonidoRef.current = v;
    try { localStorage.setItem(CLAVE_SONIDO, v ? '1' : '0'); } catch { /* nada */ }
    if (v) { contexto(); setTimeout(avisar, 30); } // este toque habilita el audio del navegador
  }

  useEffect(() => {
    let activo = true;
    async function traer() {
      if (enCurso.current) return;
      enCurso.current = true;
      try {
        const r = await fetch('/api/demo-providus/vendedor/leads', { cache: 'no-store' });
        const d = (await r.json().catch(() => null)) as { ok?: boolean; vendedor?: Yo; leads?: Lead[]; detalle?: string } | null;
        if (r.status === 401) { if (activo) alVencer(); return; }
        if (!r.ok || !d?.ok || !d.leads || !d.vendedor) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
        if (!activo) return;
        const nuevosIds = conocidos.current ? d.leads.filter((l) => !conocidos.current!.has(l.id)) : [];
        conocidos.current = new Set(d.leads.map((l) => l.id));
        if (nuevosIds.length) {
          const hasta = Date.now() + NUEVO_MS;
          setNuevos((prev) => ({ ...prev, ...Object.fromEntries(nuevosIds.map((l) => [l.id, hasta])) }));
          avisar();
        }
        setYo(d.vendedor); setLeads(d.leads); setCargado(true); setError(null); setEnVivo(true);
      } catch (e) {
        if (!activo) return;
        setEnVivo(false);
        setError(e instanceof TypeError ? 'Sin conexión. Reintentando solo…' : e instanceof Error ? e.message : String(e));
      } finally { enCurso.current = false; }
    }
    void traer();
    const t = setInterval(() => void traer(), CADA_MS);
    return () => { activo = false; clearInterval(t); };
  }, [alVencer, avisar]);

  async function marcar(id: string, estado: Contacto) {
    const antes = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, contacto_estado: estado } : l)));
    try {
      const r = await fetch(`/api/demo-providus/vendedor/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
      if (r.status === 401) { alVencer(); return; }
      if (!r.ok) throw new Error();
    } catch {
      setLeads(antes);
      setError('No se pudo guardar el cambio. Probá de nuevo.');
    }
  }

  async function salir() {
    await fetch('/api/demo-providus/auth/salir', { method: 'POST' }).catch(() => {});
    alVencer();
  }

  const pendientes = useMemo(() => leads.filter((l) => l.contacto_estado === 'nuevo').sort((a, b) => ts(b) - ts(a)), [leads]);
  const vistos = useMemo(() => leads.filter((l) => l.contacto_estado !== 'nuevo').sort((a, b) => ts(b) - ts(a)), [leads]);
  const lista = vista === 'pendientes' ? pendientes : vistos;

  // Mientras haya una llamada del asistente en curso, se pregunta cada 10 s cómo terminó (el servidor consulta a ElevenLabs).
  const hayLlamando = leads.some((l) => l.llamada_estado === 'llamando');
  useEffect(() => {
    if (!hayLlamando) return;
    const pedir = () => { void fetch('/api/demo-providus/llamadas/sincronizar', { method: 'POST' }).catch(() => {}); };
    const t = setInterval(pedir, 10_000);
    return () => clearInterval(t);
  }, [hayLlamando]);

  useEffect(() => {
    document.title = pendientes.length ? `(${pendientes.length}) Vendedores · Providus` : 'Vendedores · Providus';
  }, [pendientes.length]);

  const zonas = yo ? [...yo.provincias, ...(yo.recibe_resto ? ['El resto del país'] : [])] : [];
  const enlace = `whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-medium text-[#b4a892] transition-colors duration-500 ${CURVA} hover:text-[#ebe6dd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e]`;

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#070605] pb-24 text-[#ebe6dd] [color-scheme:dark]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(224,96,58,0.2),transparent_72%)]" aria-hidden="true" />

      <header className="sticky top-3 z-30 mx-auto mt-4 flex w-[min(720px,calc(100%-24px))] items-center justify-between rounded-full bg-[rgba(13,11,9,0.72)] py-2 pl-5 pr-2 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo-providus/logo-app.jpg" alt="Providus, S.A. de Capitalización y Renta" width={1086} height={268} className="pv-logo-app h-7 w-auto" />
        <nav className="flex items-center gap-1" aria-label="Opciones">
          <button type="button" onClick={alternarSonido} aria-pressed={sonido} className={`${enlace} ${sonido ? '!text-[#e3c58e]' : ''}`}>{sonido ? 'Sonido activado' : 'Activar sonido'}</button>
          <button type="button" onClick={() => void salir()} className={enlace}>Salir</button>
        </nav>
      </header>

      <main className="relative mx-auto w-[min(720px,calc(100%-24px))] pt-9">
        <div className="pv-in" style={{ ['--i' as string]: 0 }}>
          <p className="flex items-center gap-2.5 text-[13.5px] text-[#9c8c75]" role="status">
            <span className={`h-2 w-2 rounded-full ${enVivo ? 'pv-pulso bg-[#4ade80]' : 'bg-[#f5b942]'}`} aria-hidden="true" />
            {enVivo ? 'En vivo: los datos te llegan solos' : 'Reconectando…'}
          </p>
          <h1 className="pv-display mt-3 text-[clamp(28px,7vw,40px)] leading-[1.05] [text-wrap:balance]">{yo ? `Hola, ${yo.nombre}` : 'Tus datos'}</h1>
          {zonas.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tu zona">
              {zonas.map((z) => <li key={z} className="rounded-full bg-white/[0.05] px-3 py-1 text-[13px] text-[#cbbfa9] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">{z}</li>)}
            </ul>
          )}

          <div role="tablist" aria-label="Tus datos" className="mt-7 inline-flex max-w-full gap-1 rounded-full bg-white/[0.04] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {([['pendientes', `Para llamar (${pendientes.length})`], ['vistos', `Ya vistos (${vistos.length})`]] as const).map(([id, t]) => (
              <button key={id} role="tab" aria-selected={vista === id} type="button" onClick={() => setVista(id)} className={`relative shrink-0 touch-manipulation rounded-full px-5 py-2.5 text-[14px] font-medium transition-[background,color,box-shadow] duration-500 ${CURVA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] ${vista === id ? 'bg-[linear-gradient(145deg,#4a3c2d,#2a2119)] text-[#ebe6dd] shadow-[0_0_26px_-6px_rgba(224,96,58,0.7),inset_0_1px_0_rgba(255,255,255,0.18)]' : 'text-[#9c8c75] hover:text-[#ebe6dd]'}`}>{t}</button>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="mt-5 rounded-2xl bg-[#4a1f18] px-4 py-3 text-[13px] font-medium leading-snug text-[#f6b9a8]">{error}</p>}

        <section className="mt-6" aria-label="Datos">
          {!cargado ? (
            <p className="py-16 text-center text-[14px] text-[#8a7a64]" role="status">Cargando tus datos…</p>
          ) : lista.length === 0 ? (
            <div className="rounded-[28px] bg-white/[0.025] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.07)]">
              <div className="rounded-[22px] bg-[#0d0b09] px-6 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                <span className="pv-pulso mx-auto block h-2.5 w-2.5 rounded-full bg-[#e0603a]" aria-hidden="true" />
                <p className="pv-display mt-5 text-[19px]">{vista === 'pendientes' ? 'Todo al día' : 'Todavía no marcaste ninguno'}</p>
                <p className="mx-auto mt-2 max-w-[34ch] text-[14px] leading-relaxed text-[#8a7a64]">
                  {vista === 'pendientes' ? 'Cuando una promotora cargue a alguien de tu zona, aparece acá solo y te vibra el celular. No hace falta refrescar.' : 'Los datos que marques como llamados o sin respuesta quedan acá.'}
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {lista.map((l) => <Tarjeta key={l.id} l={l} ahora={ahora} nuevo={(nuevos[l.id] ?? 0) > ahora && l.contacto_estado === 'nuevo'} alMarcar={(e) => void marcar(l.id, e)} />)}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

/** Protege la pantalla con el usuario y la clave del vendedor. */
export function Vendedor() {
  const [est, setEst] = useState<'cargando' | 'login' | 'ok'>('cargando');
  const [msg, setMsg] = useState<string | null>(null);
  const revisar = useCallback(async () => {
    try {
      const r = await fetch('/api/demo-providus/auth/yo', { cache: 'no-store' });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; sesion?: string; detalle?: string } | null;
      if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      setMsg(null);
      setEst(d.sesion === 'vendedor' ? 'ok' : 'login');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
      setEst('login');
    }
  }, []);
  useEffect(() => { void revisar(); }, [revisar]);
  const alVencer = useCallback(() => setEst('login'), []);

  if (est === 'ok') return <Panel alVencer={alVencer} />;
  if (est === 'login') return <LoginVendedor alListo={() => void revisar()} />;
  return <div className="grid min-h-dvh place-items-center text-[14px] text-[var(--pv-arena)]" role="status">{msg ?? 'Cargando…'}</div>;
}
