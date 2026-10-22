'use client';

/**
 * DEMO PROVIDUS — Sprint 2: pantalla central (centro de operaciones).
 *
 * Los registros que se cargan en el stand aparecen acá solos, en pocos segundos,
 * sin refrescar la página. Los datos llegan por consulta periódica (cada ~1,5 s) a
 * /api/demo-providus/registros: no falla aunque el wifi sea malo y no obliga a abrir
 * la base al navegador (la tabla guarda datos de personas). El merge es por id, así
 * que que un registro llegue dos veces no duplica nada.
 *
 * Regla dura: nada de location.reload() ni router.refresh(): si la pantalla parpadea
 * delante del cliente se arruina el efecto de sistema en vivo.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatoLegible } from '@/lib/demo-providus/telefono';
import { LoginAdmin } from '../_acceso';

interface Registro {
  id: string;
  creado_en: string;
  nombre: string;
  apellido: string;
  telefono: string;
  telefono_e164: string;
  provincia: string;
  localidad: string | null;
  foto_url: string | null;
  evento: string | null;
  promotora: string | null;
  promotora_nombre: string | null;
  promotora_apellido: string | null;
  promotora_edad: number | null;
  promotora_foto_url: string | null;
  sucursal: string | null;
  vendedor_id: string | null;
}
interface Item {
  r: Registro;
  /** Hasta cuándo se muestra como NUEVO (ms epoch), o null. */
  nuevoHasta: number | null;
  saliendo?: boolean;
}
interface Linea {
  id: number;
  hora: string;
  accion: 'INGRESÓ' | 'BAJA';
  detalle: string;
}

const CADA_MS = 1500;
const EN_VIVO_MS = 6000; // sin una respuesta buena en este tiempo → SINCRONIZANDO
const NUEVO_MS = 5000;
const MAX_ITEMS = 50;
const MAX_LINEAS = 30;
const CLAVE_SONIDO = 'pv_central_sonido';

// ── utilidades ──────────────────────────────────────────────────────────

function hhmmss(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
function hhmm(ms: number): string {
  return new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}
/** "hace 4 s" · "hace 3 min" · después de una hora, la hora sola. */
function hace(ts: number, ahora: number): string {
  const s = Math.max(0, Math.floor((ahora - ts) / 1000));
  if (s < 60) return `hace ${s} s`;
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  return hhmm(ts);
}
const iniciales = (n: string, a: string) => `${n.trim()[0] ?? ''}${a.trim()[0] ?? ''}`.toUpperCase();
const abreviado = (n: string, a: string) => `${n.trim()} ${a.trim()[0] ?? ''}.`;
const lugar = (r: Registro) => (r.localidad && r.localidad !== r.provincia ? `${r.provincia}, ${r.localidad}` : r.provincia);
const ts = (r: Registro) => new Date(r.creado_en).getTime();
const quien = (r: Registro) => (r.promotora_nombre ? `${r.promotora_nombre} ${r.promotora_apellido ?? ''}`.trim() : r.promotora || 'Sin identificar');
const nombreCorto = (r: Registro) => (r.promotora_nombre ? `${r.promotora_nombre} ${(r.promotora_apellido ?? '').trim()[0] ?? ''}.`.trim() : r.promotora || 'sin identificar');

// ── piezas ──────────────────────────────────────────────────────────────

/** Una celda de métrica. Cuando el número cambia parpadea al naranja y vuelve en 400 ms. */
function Metrica({ valor, etiqueta, parpadea = true }: { valor: string | number; etiqueta: string; parpadea?: boolean }) {
  const anterior = useRef(valor);
  const [destello, setDestello] = useState(false);
  useEffect(() => {
    if (parpadea && anterior.current !== valor) {
      setDestello(true);
      const t = setTimeout(() => setDestello(false), 400);
      anterior.current = valor;
      return () => clearTimeout(t);
    }
    anterior.current = valor;
  }, [valor, parpadea]);
  return (
    <div className="flex flex-col justify-center gap-1.5 px-4 py-3 max-lg:border-white/[0.08] max-lg:odd:border-r max-lg:[&:nth-child(n+3)]:border-t lg:gap-2 lg:px-8 lg:py-0">
      <span
        className="pv-display pv-num text-[26px] leading-none transition-colors lg:text-[34px]"
        style={{ color: destello ? 'var(--pv-naranja-luz)' : 'var(--pv-aluminio)', transitionDuration: destello ? '0ms' : '400ms' }}
      >
        {valor}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--pv-sec)]">{etiqueta}</span>
    </div>
  );
}

function Foto({ r }: { r: Registro }) {
  const [fallo, setFallo] = useState(false);
  if (!r.foto_url || fallo) {
    return (
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[10px] lg:h-[72px] lg:w-[72px] bg-[var(--pv-bronce-800)] text-[20px] font-semibold text-[var(--pv-sec)] lg:text-[24px]" aria-hidden="true">
        {iniciales(r.nombre, r.apellido)}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={r.foto_url} alt="" onError={() => setFallo(true)} className="h-14 w-14 shrink-0 rounded-[10px] bg-[var(--pv-bronce-800)] object-cover lg:h-[72px] lg:w-[72px]" />;
}

function MiniPromotora({ r }: { r: Registro }) {
  const [fallo, setFallo] = useState(false);
  if (!r.promotora_foto_url || fallo) {
    return <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--pv-bronce-700)] text-[9px] font-semibold text-[var(--pv-aluminio)]" aria-hidden="true">{iniciales(r.promotora_nombre ?? quien(r), r.promotora_apellido ?? '')}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={r.promotora_foto_url} alt="" onError={() => setFallo(true)} className="h-5 w-5 shrink-0 rounded-full bg-[var(--pv-bronce-800)] object-cover" />;
}

function Ficha({ item, ahora, confirmando, errorBaja, onPedir, onCancelar, onConfirmar }: { item: Item; ahora: number; confirmando: boolean; errorBaja: string | null; onPedir: () => void; onCancelar: () => void; onConfirmar: () => void }) {
  const { r } = item;
  const nuevo = item.nuevoHasta !== null && ahora < item.nuevoHasta;
  const [animar] = useState(item.nuevoHasta !== null); // solo anima la entrada si llegó con la pantalla abierta
  return (
    <li className={`group relative flex h-[104px] items-center gap-3 border-b border-white/[0.07] px-4 lg:gap-5 lg:px-6 ${animar ? 'pv-ficha-nueva' : ''} ${item.saliendo ? 'pv-ficha-sale' : ''}`}>
      <Foto r={r} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold leading-tight text-[var(--pv-aluminio)] lg:text-[19px]">{r.nombre} {r.apellido}</p>
        <p className="pv-num mt-1.5 truncate text-[13px] text-[var(--pv-sec)]">{formatoLegible(r.telefono_e164)} · {lugar(r)}</p>
        <p className="mt-1.5 flex items-center gap-2 truncate text-[11.5px] text-[var(--pv-sec)]">
          <MiniPromotora r={r} />
          <span className="truncate">
            <span className="font-semibold text-[var(--pv-aluminio)]/85">{quien(r)}</span>
            {r.promotora_edad ? ` · ${r.promotora_edad} años` : ''}
            {` · ${r.sucursal ?? 'sin sucursal'} · ${r.evento ?? 'sin evento'}`}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="pv-datos text-[13px] text-[var(--pv-aluminio)] max-lg:hidden">{hhmmss(ts(r))}</span>
        <span className="pv-datos text-[11px] text-[var(--pv-sec)]">{hace(ts(r), ahora)}</span>
        {confirmando ? (
          <span className="mt-1 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-[var(--pv-aluminio)]">¿Dar de baja?</span>
            <button type="button" onClick={onConfirmar} className="text-[var(--pv-naranja-luz)] hover:underline max-lg:p-2">Sí</button>
            <button type="button" onClick={onCancelar} className="text-[var(--pv-sec)] hover:underline max-lg:p-2">No</button>
          </span>
        ) : (
          <span className="mt-1 flex items-center gap-3">
            <span
              className={`pv-datos rounded-[3px] px-2 py-[3px] text-[10px] uppercase tracking-[0.18em] ${!nuevo && !r.vendedor_id ? 'max-lg:hidden' : ''} ${
                nuevo ? 'bg-[var(--pv-naranja)] text-[#fff6ef] shadow-[inset_0_0_0_1px_var(--pv-naranja)]' : 'text-[var(--pv-sec)] shadow-[inset_0_0_0_1px_rgba(180,168,146,0.45)]'
              }`}
            >
              {nuevo ? 'Nuevo' : r.vendedor_id ? r.vendedor_id : 'Sin asignar'}
            </span>
            <button type="button" onClick={onPedir} aria-label={`Dar de baja a ${r.nombre} ${r.apellido}`} className="grid h-7 w-7 place-items-center rounded-full text-[var(--pv-sec)] opacity-0 max-lg:opacity-70 max-lg:h-9 max-lg:w-9 transition-opacity duration-200 hover:text-[var(--pv-naranja-luz)] focus-visible:opacity-100 group-hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </span>
        )}
        {errorBaja && <span role="alert" className="max-w-[260px] text-right text-[11px] leading-snug text-[var(--pv-naranja-luz)]">{errorBaja}</span>}
      </div>
    </li>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────

function Panel({ alVencer }: { alVencer: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [cargado, setCargado] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  // 0 hasta que monta: el reloj no se dibuja en el servidor (si no, no coincide con el navegador y React falla al hidratar).
  const [ahora, setAhora] = useState(0);
  const [sonido, setSonido] = useState(false);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [errorBaja, setErrorBaja] = useState<{ id: string; msg: string } | null>(null);

  const itemsRef = useRef<Item[]>([]);
  const ultimoOk = useRef(0);
  const enCurso = useRef(false);
  const primera = useRef(true);
  const idLinea = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const sonidoRef = useRef(false);

  // Reloj: corre cada segundo, y con él los "hace X s".
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const v = localStorage.getItem(CLAVE_SONIDO) === '1';
      setSonido(v);
      sonidoRef.current = v;
    } catch { /* sin almacenamiento: arranca apagado */ }
  }, []);

  // ── sonido: un tick sobrio, generado con AudioContext (sin archivos) ──
  const contexto = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume().catch(() => {});
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);
  const tick = useCallback(() => {
    if (!sonidoRef.current) return;
    const ctx = contexto();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.07);
  }, [contexto]);
  function alternarSonido() {
    const v = !sonido;
    setSonido(v);
    sonidoRef.current = v;
    try { localStorage.setItem(CLAVE_SONIDO, v ? '1' : '0'); } catch { /* nada */ }
    if (v) {
      contexto(); // este toque es el que habilita el audio en el navegador
      setTimeout(tick, 30);
    }
  }

  const anotar = useCallback((accion: Linea['accion'], detalle: string) => {
    setLineas((l) => [{ id: ++idLinea.current, hora: hhmmss(Date.now()), accion, detalle }, ...l].slice(0, MAX_LINEAS));
  }, []);

  /** Saca una ficha con el desvanecido de 250 ms. */
  const sacar = useCallback((id: string) => {
    const actual = itemsRef.current;
    if (!actual.some((i) => i.r.id === id && !i.saliendo)) return;
    itemsRef.current = actual.map((i) => (i.r.id === id ? { ...i, saliendo: true } : i));
    setItems(itemsRef.current);
    setTimeout(() => {
      itemsRef.current = itemsRef.current.filter((i) => i.r.id !== id);
      setItems(itemsRef.current);
    }, 250);
  }, []);

  // ── llegada de datos: idempotente, merge por id ──
  const aplicar = useCallback(
    (registros: Registro[], bajas: string[], inicial: boolean) => {
      const prev = itemsRef.current;
      const conocidos = new Map(prev.map((i) => [i.r.id, i]));
      const bajasSet = new Set(bajas);
      const ahoraMs = Date.now();

      // Bajas (hechas desde el celular o desde otra central).
      for (const i of prev) if (bajasSet.has(i.r.id) && !i.saliendo) {
        anotar('BAJA', abreviado(i.r.nombre, i.r.apellido));
        sacar(i.r.id);
      }

      // Registros nuevos: los que no estaban.
      const nuevos: Item[] = [];
      for (const r of registros) {
        if (bajasSet.has(r.id) || conocidos.has(r.id)) continue;
        nuevos.push({ r, nuevoHasta: inicial ? null : ahoraMs + NUEVO_MS });
      }
      // Existentes: se actualizan en su lugar (sin cambiar la posición).
      const porId = new Map(registros.map((r) => [r.id, r]));
      const actualizados = itemsRef.current.map((i) => (porId.has(i.r.id) ? { ...i, r: porId.get(i.r.id)! } : i));
      const siguiente = [...nuevos, ...actualizados].sort((a, b) => ts(b.r) - ts(a.r)).slice(0, MAX_ITEMS);
      itemsRef.current = siguiente;
      setItems(siguiente);

      if (!inicial && nuevos.length) {
        for (const n of [...nuevos].reverse()) anotar('INGRESÓ', `${abreviado(n.r.nombre, n.r.apellido)} · ${n.r.provincia} · por ${nombreCorto(n.r)}${n.r.evento ? ` · ${n.r.evento}` : ''}`);
        tick();
      }
    },
    [anotar, sacar, tick],
  );

  // ── consulta periódica ──
  useEffect(() => {
    let activo = true;
    const traer = async () => {
      if (enCurso.current) return;
      enCurso.current = true;
      const control = new AbortController();
      const reloj = setTimeout(() => control.abort(), 5000);
      try {
        const r = await fetch('/api/demo-providus/registros', { cache: 'no-store', signal: control.signal });
        const d = (await r.json().catch(() => null)) as { ok?: boolean; registros?: Registro[]; bajas?: string[]; detalle?: string } | null;
        if (r.status === 401) {
          if (activo) alVencer(); // la sesión de administración venció: vuelve al ingreso
          return;
        }
        if (!r.ok || !d?.ok || !d.registros) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
        if (!activo) return;
        ultimoOk.current = Date.now();
        setErrorCarga(null);
        aplicar(d.registros, d.bajas ?? [], primera.current);
        primera.current = false;
        setCargado(true);
      } catch (e) {
        // Se sigue intentando solo; el indicador pasa a SINCRONIZANDO y la pantalla no se rompe.
        if (activo) setErrorCarga(e instanceof DOMException && e.name === 'AbortError' ? 'La consulta tardó demasiado.' : e instanceof Error ? e.message : String(e));
      } finally {
        clearTimeout(reloj);
        enCurso.current = false;
      }
    };
    void traer();
    const t = setInterval(() => void traer(), CADA_MS);
    return () => {
      activo = false;
      clearInterval(t);
    };
  }, [aplicar, alVencer]);

  async function darDeBaja(id: string) {
    setErrorBaja(null);
    const item = itemsRef.current.find((i) => i.r.id === id);
    try {
      const r = await fetch(`/api/demo-providus/registros/${id}`, { method: 'DELETE' });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; detalle?: string } | null;
      if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      setConfirmando(null);
      if (item) anotar('BAJA', abreviado(item.r.nombre, item.r.apellido));
      sacar(id);
    } catch (e) {
      setErrorBaja({ id, msg: e instanceof Error ? e.message : String(e) });
    }
  }

  // ── métricas: se calculan sobre lo que ya está en memoria ──
  const vivos = useMemo(() => items.filter((i) => !i.saliendo), [items]);
  const inicioDia = useMemo(() => { const d = new Date(ahora || Date.now()); d.setHours(0, 0, 0, 0); return d.getTime(); }, [Math.floor(ahora / 60000)]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoy = vivos.filter((i) => ts(i.r) >= inicioDia).length;
  const diezMin = vivos.filter((i) => ts(i.r) >= ahora - 600_000).length;
  const sinAsignar = vivos.filter((i) => !i.r.vendedor_id).length;
  const ultimo = vivos[0] ? hace(ts(vivos[0].r), ahora) : '—';

  const enVivo = cargado && ahora - ultimoOk.current < EN_VIVO_MS;

  return (
    <div className="flex h-dvh flex-col overflow-hidden text-[var(--pv-aluminio)]">
      {/* BARRA SUPERIOR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] px-4 lg:h-16 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="pv-display text-[18px] text-[var(--pv-aluminio)]">PROVIDUS</span>
          <span className="h-5 w-px bg-white/15 max-lg:hidden" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pv-sec)] max-lg:hidden">Centro de operaciones</span>
        </div>
        <div className="flex items-center gap-3 lg:gap-7">
          <span className="flex items-center gap-2.5" role="status">
            <span className={`h-2 w-2 rounded-full ${enVivo ? 'pv-pulso bg-[#4ade80]' : 'bg-[#f5b942]'}`} aria-hidden="true" />
            <span className="pv-datos text-[10px] uppercase tracking-[0.18em]" style={{ color: enVivo ? '#4ade80' : '#f5b942' }}>
              {enVivo ? 'En vivo' : 'Sincronizando'}
            </span>
          </span>
          <button
            type="button"
            onClick={alternarSonido}
            aria-pressed={sonido}
            className={`pv-datos rounded-[3px] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors duration-300 ${sonido ? 'bg-[var(--pv-naranja)] text-[#fff6ef]' : 'text-[var(--pv-sec)] shadow-[inset_0_0_0_1px_rgba(180,168,146,0.45)] hover:text-[var(--pv-aluminio)]'}`}
          >
            ♪ Sonido
          </button>
          <a href="/demo_providus/admin" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--pv-sec)] transition-colors hover:text-[var(--pv-aluminio)]">Panel</a>
          <span className="pv-datos text-[15px] text-[var(--pv-aluminio)] max-sm:hidden" aria-label="Hora">{ahora ? hhmmss(ahora) : '--:--:--'}</span>
        </div>
      </header>

      {/* MÉTRICAS */}
      <section className="grid shrink-0 grid-cols-2 border-b border-white/[0.08] lg:h-24 lg:grid-cols-4 lg:divide-x lg:divide-white/[0.08]" aria-label="Métricas">
        <Metrica valor={hoy} etiqueta="Registros hoy" />
        <Metrica valor={diezMin} etiqueta="Últimos 10 min" />
        <Metrica valor={sinAsignar} etiqueta="Sin asignar" />
        <Metrica valor={ultimo} etiqueta="Último ingreso" parpadea={false} />
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[68fr_32fr]">
        {/* LISTA DE REGISTROS */}
        <section className="min-h-0 overflow-y-auto" aria-label="Registros">
          {!cargado ? (
            <p className="pv-datos p-8 text-[12px] uppercase tracking-[0.2em] text-[var(--pv-sec)]">{errorCarga ? '' : 'Conectando…'}</p>
          ) : vivos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="pv-pulso h-2.5 w-2.5 rounded-full bg-[var(--pv-naranja)]" aria-hidden="true" />
              <p className="pv-datos text-[12px] uppercase tracking-[0.2em] text-[var(--pv-sec)]">Esperando registros del stand</p>
              <p className="text-[13px] text-[var(--pv-sec)]/60">La pantalla se actualiza sola. No hace falta refrescar.</p>
            </div>
          ) : (
            <ul>
              {items.map((i) => (
                <Ficha
                  key={i.r.id}
                  item={i}
                  ahora={ahora}
                  confirmando={confirmando === i.r.id}
                  errorBaja={errorBaja?.id === i.r.id ? errorBaja.msg : null}
                  onPedir={() => { setErrorBaja(null); setConfirmando(i.r.id); }}
                  onCancelar={() => setConfirmando(null)}
                  onConfirmar={() => void darDeBaja(i.r.id)}
                />
              ))}
            </ul>
          )}
          {errorCarga && (
            <p role="alert" className="pv-datos sticky bottom-0 bg-[var(--pv-bronce-950)]/90 px-6 py-3 text-[11px] leading-snug text-[var(--pv-sec)]">
              Sin conexión con el servidor ({errorCarga}) — reintentando solo.
            </p>
          )}
        </section>

        {/* ACTIVIDAD */}
        <aside className="hidden min-h-0 flex-col border-l border-white/[0.08] bg-black/15 lg:flex" aria-label="Actividad">
          <h2 className="shrink-0 border-b border-white/[0.08] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--pv-sec)]">Actividad</h2>
          <ol className="pv-datos min-h-0 flex-1 overflow-y-auto px-6 py-4 text-[11px] leading-relaxed">
            {lineas.length === 0 && <li className="text-[var(--pv-sec)]/50">Sin actividad todavía.</li>}
            {lineas.map((l) => (
              <li key={l.id} className="pv-linea mb-3">
                <span className="text-[var(--pv-naranja-luz)]">{l.hora}</span>
                <span className="ml-3 text-[var(--pv-aluminio)]">{l.accion}</span>
                <span className="mt-0.5 block pl-[calc(8ch+0.75rem)] text-[var(--pv-sec)]">{l.detalle}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

/** Protege la central: hace falta la clave de administración (los datos incluyen personas y promotoras). */
export function Central() {
  const [est, setEst] = useState<'cargando' | 'login' | 'ok'>('cargando');
  const [msg, setMsg] = useState<string | null>(null);
  const revisar = useCallback(async () => {
    try {
      const r = await fetch('/api/demo-providus/auth/yo', { cache: 'no-store' });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; sesion?: string; detalle?: string } | null;
      if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      setMsg(null);
      setEst(d.sesion === 'admin' ? 'ok' : 'login');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
      setEst('login');
    }
  }, []);
  useEffect(() => { void revisar(); }, [revisar]);
  const alVencer = useCallback(() => setEst('login'), []);

  if (est === 'ok') return <Panel alVencer={alVencer} />;
  if (est === 'login') return <LoginAdmin titulo="Centro de operaciones" alListo={() => void revisar()} />;
  return <div className="grid h-dvh place-items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--pv-arena)]">{msg ?? 'Cargando…'}</div>;
}
