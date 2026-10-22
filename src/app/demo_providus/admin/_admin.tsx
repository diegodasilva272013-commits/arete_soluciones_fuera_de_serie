'use client';

/**
 * DEMO PROVIDUS — panel de administración.
 * Alta, edición y baja (activar/desactivar) de promotoras, eventos y sucursales, y el
 * resumen de cargas por evento y promotora con descarga a CSV. Todo pasa por
 * /api/demo-providus/admin/*, que exige la sesión de administración.
 *
 * Estética: la del ingreso (negro profundo, brillo naranja y arena del logo). Los bloques
 * son de doble bisel (carcasa + núcleo), la barra superior es una píldora flotante y los
 * campos son los del formulario animado del ingreso, con el brillo que sigue al mouse.
 */

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/modern-animated-sign-in';
import { LoginAdmin } from '../_acceso';

type Pestana = 'promotoras' | 'eventos' | 'sucursales' | 'cargas';

interface Promotora { id: string; usuario: string; nombre: string; apellido: string; edad: number | null; foto_url: string | null; sucursal_id: string | null; sucursal: string | null; activa: boolean; ultimo_ingreso: string | null; cargas: number }
interface Evento { id: string; nombre: string; lugar: string | null; fecha: string | null; activo: boolean; cargas: number }
interface Sucursal { id: string; nombre: string; ciudad: string | null; activa: boolean; cargas: number }
interface FilaResumen { evento: string; promotora: string; sucursal: string; cargas: number; ultima: string }

const CURVA = 'ease-[cubic-bezier(0.32,0.72,0,1)]';
const ETIQUETA = 'mb-2 block text-[13px] font-medium text-[#b4a892]';
const CAMPO = 'h-12 dark:bg-[#17120e] dark:text-[#ebe6dd] dark:placeholder:text-[#6f6252] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none';
const SELECT = `h-12 w-full min-w-0 rounded-[10px] border-0 bg-[#17120e] px-3.5 text-[15px] text-[#ebe6dd] shadow-[inset_0_0_0_1px_rgba(227,197,142,0.14)] [color-scheme:dark] outline-none transition-shadow duration-500 ${CURVA} focus-visible:shadow-[inset_0_0_0_1.5px_#e3c58e] disabled:opacity-60`;
const GHOST = `inline-flex h-9 touch-manipulation items-center rounded-full px-4 text-[13px] font-medium text-[#ebe6dd] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] transition-[background-color,box-shadow,transform] duration-500 ${CURVA} hover:bg-white/[0.05] hover:shadow-[inset_0_0_0_1px_rgba(227,197,142,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] active:scale-[0.97]`;

const fechaCorta = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '—');
const iniciales = (n: string, a: string) => `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase();

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: 'no-store', ...init });
  const d = (await r.json().catch(() => null)) as ({ ok?: boolean; detalle?: string } & T) | null;
  if (r.status === 401) throw new Error('SESION');
  if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
  return d as T;
}

// ── piezas ──────────────────────────────────────────────────────────────

/** Doble bisel: una carcasa con filo naranja y, adentro, el núcleo oscuro con luz superior. */
function Bisel({ children, className = '', etiqueta }: { children: React.ReactNode; className?: string; etiqueta?: string }) {
  return (
    <div className={`rounded-[30px] bg-white/[0.025] p-1.5 shadow-[0_0_0_1px_rgba(224,96,58,0.16),0_40px_80px_-40px_rgba(0,0,0,0.9)] ${className}`} role={etiqueta ? 'group' : undefined} aria-label={etiqueta}>
      <div className="rounded-[24px] bg-[#0d0b09] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">{children}</div>
    </div>
  );
}

function Aviso({ mensaje, error }: { mensaje: string | null; error: string | null }) {
  if (!mensaje && !error) return null;
  return (
    <p role={error ? 'alert' : 'status'} aria-live="polite" className={`mb-4 rounded-2xl px-4 py-3 text-[13px] font-medium leading-snug ${error ? 'bg-[#4a1f18] text-[#f6b9a8]' : 'bg-[#1d2614] text-[#c9dba0]'}`}>
      {error ?? mensaje}
    </p>
  );
}

function Interruptor({ activo, alCambiar, etiqueta }: { activo: boolean; alCambiar: () => void; etiqueta: string }) {
  return (
    <button type="button" onClick={alCambiar} role="switch" aria-checked={activo} aria-label={etiqueta} className={`relative h-7 w-12 shrink-0 touch-manipulation rounded-full transition-[background,box-shadow] duration-500 ${CURVA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] ${activo ? 'bg-[linear-gradient(145deg,#f0562a,#c23a14)] shadow-[0_0_22px_-4px_rgba(224,96,58,0.7),inset_0_1px_0_rgba(255,255,255,0.3)]' : 'bg-[#241e18] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'}`}>
      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-[#fff6ef] shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform duration-500 ${CURVA} ${activo ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/** Botón principal: píldora naranja con la flecha en su propio círculo. */
function BotonPrincipal({ children, deshabilitado, className = '' }: { children: React.ReactNode; deshabilitado?: boolean; className?: string }) {
  return (
    <button type="submit" disabled={deshabilitado} className={`pv-boton group inline-flex h-12 touch-manipulation items-center justify-between rounded-full pl-6 pr-1.5 text-[#fff6ef] transition-[transform,filter] duration-500 ${CURVA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] active:scale-[0.98] disabled:cursor-wait ${className}`}>
      <span className="text-[14px] font-semibold">{children}</span>
      <span className={`grid h-9 w-9 place-items-center rounded-full bg-black/25 transition-transform duration-500 ${CURVA} group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105`} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13.500M13 6l5.500 6-5.500 6" /></svg>
      </span>
    </button>
  );
}

function Avatar({ foto, nombre, apellido, tam = 52 }: { foto: string | null; nombre: string; apellido: string; tam?: number }) {
  const caja = { width: tam, height: tam };
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={foto} alt="" width={tam} height={tam} style={caja} className="shrink-0 rounded-full object-cover shadow-[0_0_0_2px_rgba(224,96,58,0.55),0_0_22px_-4px_rgba(224,96,58,0.55)]" />
  ) : (
    <span style={caja} className="grid shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#f0562a,#9c2f10)] text-[15px] font-semibold text-[#fff6ef] shadow-[0_0_22px_-4px_rgba(224,96,58,0.55),inset_0_1px_0_rgba(255,255,255,0.35)]" aria-hidden="true">{iniciales(nombre, apellido)}</span>
  );
}

function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-14 text-center text-[14px] leading-relaxed text-[#8a7a64]">{children}</p>;
}

function Cabecera({ titulo, cuenta }: { titulo: string; cuenta?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-6 pb-3 pt-6">
      <h2 className="pv-display text-[19px] text-[#ebe6dd]">{titulo}</h2>
      {cuenta && <span className="pv-num text-[13px] text-[#8a7a64]">{cuenta}</span>}
    </div>
  );
}

function Cargas({ n }: { n: number }) {
  return (
    <span className="pv-num shrink-0 text-right leading-none">
      <span className="pv-display block text-[22px] text-[#ebe6dd]">{n}</span>
      <span className="mt-1 block text-[12px] text-[#8a7a64]">{n === 1 ? 'carga' : 'cargas'}</span>
    </span>
  );
}

// ── promotoras ──────────────────────────────────────────────────────────

function Promotoras({ sucursales, alVencer }: { sucursales: Sucursal[]; alVencer: () => void }) {
  const [filas, setFilas] = useState<Promotora[]>([]);
  const [editando, setEditando] = useState<Promotora | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [vista, setVista] = useState<string | null>(null);
  const [clave, setClave] = useState('');

  const cargar = useCallback(async () => {
    try { setFilas((await pedir<{ filas: Promotora[] }>('/api/demo-providus/admin/promotoras')).filas); }
    catch (e) { if (e instanceof Error && e.message === 'SESION') alVencer(); else setError(e instanceof Error ? e.message : String(e)); }
  }, [alVencer]);
  useEffect(() => { void cargar(); }, [cargar]);

  function limpiar() { setEditando(null); setVista(null); setClave(''); }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setAviso(null); setGuardando(true);
    const form = e.currentTarget;
    try {
      const fd = new FormData(form);
      if (editando) { fd.set('id', editando.id); if (!fd.get('clave')) fd.delete('clave'); const f = fd.get('foto'); if (f instanceof File && f.size === 0) fd.delete('foto'); fd.delete('usuario'); }
      await pedir(`/api/demo-providus/admin/promotoras`, { method: editando ? 'PATCH' : 'POST', body: fd });
      setAviso(editando ? 'Cambios guardados.' : 'Promotora creada. Ya puede ingresar con su usuario y su clave.');
      form.reset(); limpiar();
      await cargar();
    } catch (err) { if (err instanceof Error && err.message === 'SESION') alVencer(); else setError(err instanceof Error ? err.message : String(err)); }
    finally { setGuardando(false); }
  }

  async function alternar(p: Promotora) {
    setError(null); setAviso(null);
    const fd = new FormData(); fd.set('id', p.id); fd.set('activa', String(!p.activa));
    try { await pedir('/api/demo-providus/admin/promotoras', { method: 'PATCH', body: fd }); await cargar(); }
    catch (err) { if (err instanceof Error && err.message === 'SESION') alVencer(); else setError(err instanceof Error ? err.message : String(err)); }
  }

  const activas = sucursales.filter((s) => s.activa || s.id === editando?.sucursal_id);
  const habilitadas = filas.filter((p) => p.activa).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)] lg:items-start">
      <Bisel etiqueta="Promotoras">
        <Cabecera titulo="Promotoras" cuenta={filas.length ? `${filas.length} en total, ${habilitadas} activas` : undefined} />
        <div className="px-3 pb-3">
          <div className="px-3"><Aviso mensaje={aviso} error={error} /></div>
          {filas.length === 0 ? (
            <Vacio>Todavía no hay promotoras. Creá la primera con el formulario y ya puede ingresar desde el celular.</Vacio>
          ) : (
            <ul>
              {filas.map((p) => (
                <li key={p.id} className={`flex items-center gap-4 rounded-[20px] px-3 py-3.5 transition-[background-color,opacity] duration-500 ${CURVA} hover:bg-white/[0.03] ${p.activa ? '' : 'opacity-50'}`}>
                  <Avatar foto={p.foto_url} nombre={p.nombre} apellido={p.apellido} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15.5px] font-semibold text-[#ebe6dd]">{p.nombre} {p.apellido}{p.edad ? <span className="pv-num font-normal text-[#8a7a64]">, {p.edad} años</span> : null}</p>
                    <p className="truncate text-[13px] text-[#8a7a64]">@{p.usuario} en {p.sucursal ?? 'sin sucursal'}. Último ingreso: {fechaCorta(p.ultimo_ingreso)}</p>
                  </div>
                  <Cargas n={p.cargas} />
                  <Interruptor activo={p.activa} alCambiar={() => void alternar(p)} etiqueta={`${p.activa ? 'Desactivar' : 'Activar'} a ${p.nombre} ${p.apellido}`} />
                  <button type="button" onClick={() => { setEditando(p); setVista(p.foto_url); setClave(''); setAviso(null); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={GHOST}>Editar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Bisel>

      <Bisel className="lg:sticky lg:top-28" etiqueta={editando ? 'Editar promotora' : 'Nueva promotora'}>
        <form onSubmit={guardar} className="p-6" autoComplete="off">
          <h2 className="pv-display mb-6 text-[19px] text-[#ebe6dd]">{editando ? `Editar a ${editando.nombre}` : 'Nueva promotora'}</h2>
          <div className="flex flex-col gap-5">
            <div>
              <span className={ETIQUETA}>Foto{editando ? ' (dejala vacía para mantener la actual)' : ''}</span>
              <label className={`group flex cursor-pointer items-center gap-4 rounded-[20px] bg-[#17120e] p-3 shadow-[inset_0_0_0_1px_rgba(227,197,142,0.14)] transition-[box-shadow] duration-500 ${CURVA} hover:shadow-[inset_0_0_0_1px_rgba(227,197,142,0.4)] focus-within:shadow-[inset_0_0_0_1.5px_#e3c58e]`}>
                {vista ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vista} alt="Foto de la promotora" width={60} height={60} className="h-[60px] w-[60px] shrink-0 rounded-full object-cover shadow-[0_0_0_2px_rgba(224,96,58,0.55),0_0_22px_-4px_rgba(224,96,58,0.55)]" />
                ) : (
                  <span className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-full bg-[#241e18] text-[#8a7a64] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.500A2.500 2.500 0 0 1 6.500 6h1.300l1.300-2h5.800l1.300 2h1.300A2.500 2.500 0 0 1 20 8.500v8A2.500 2.500 0 0 1 17.500 19h-11A2.500 2.500 0 0 1 4 16.500v-8Z" /><circle cx="12" cy="12.500" r="3.200" /></svg>
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-[#ebe6dd]">{vista ? 'Cambiar foto' : 'Subir una foto'}</span>
                  <span className="block text-[12.5px] text-[#8a7a64]">Se ve en la central junto a cada carga.</span>
                </span>
                <input name="foto" type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setVista(URL.createObjectURL(f)); }} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label><span className={ETIQUETA}>Nombre</span><Input className={CAMPO} name="nombre" required key={`n${editando?.id}`} defaultValue={editando?.nombre ?? ''} autoComplete="off" placeholder="Laura…" /></label>
              <label><span className={ETIQUETA}>Apellido</span><Input className={CAMPO} name="apellido" required key={`a${editando?.id}`} defaultValue={editando?.apellido ?? ''} autoComplete="off" placeholder="Pérez…" /></label>
            </div>
            <div className="grid grid-cols-[110px_1fr] gap-4">
              <label><span className={ETIQUETA}>Edad</span><Input className={CAMPO} name="edad" type="number" min={16} max={99} required key={`e${editando?.id}`} defaultValue={editando?.edad ?? ''} inputMode="numeric" autoComplete="off" placeholder="28…" /></label>
              <label><span className={ETIQUETA}>Sucursal</span>
                <select className={SELECT} name="sucursal_id" required key={`s${editando?.id}`} defaultValue={editando?.sucursal_id ?? ''}>
                  <option value="" disabled>Elegí una…</option>
                  {activas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
            </div>
            {!editando && (
              <label><span className={ETIQUETA}>Usuario para ingresar</span><Input className={CAMPO} name="usuario" required placeholder="Ej. laura.perez…" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" /></label>
            )}
            <label><span className={ETIQUETA}>{editando ? 'Nueva clave (vacía para no cambiarla)' : 'Clave, mínimo 6 caracteres'}</span>
              <Input className={CAMPO} name="clave" type="text" required={!editando} minLength={editando ? undefined : 6} value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="off" spellCheck={false} placeholder={editando ? 'Sin cambios…' : 'Ej. laura2026…'} />
            </label>
          </div>
          {sucursales.filter((s) => s.activa).length === 0 && <p role="alert" className="mt-4 text-[13px] font-medium text-[#f08a73]">Primero creá una sucursal en la pestaña Sucursales.</p>}
          <div className="mt-7 flex items-center gap-3">
            <BotonPrincipal deshabilitado={guardando} className="flex-1">{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear promotora'}</BotonPrincipal>
            {editando && <button type="button" onClick={limpiar} className={GHOST}>Cancelar</button>}
          </div>
        </form>
      </Bisel>
    </div>
  );
}

// ── eventos y sucursales (misma mecánica) ───────────────────────────────

function ListaSimple<T extends { id: string; nombre: string; cargas: number }>({ recurso, titulo, vacio, campos, activo, subtitulo, alVencer, alCambiar }: {
  recurso: 'eventos' | 'sucursales';
  titulo: string;
  vacio: string;
  campos: { nombre: string; etiqueta: string; tipo?: string; placeholder?: string }[];
  activo: (f: T) => boolean;
  subtitulo: (f: T) => string;
  alVencer: () => void;
  alCambiar?: () => void;
}) {
  const [filas, setFilas] = useState<T[]>([]);
  const [editando, setEditando] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const flagActivo = recurso === 'eventos' ? 'activo' : 'activa';
  const plural = recurso === 'eventos' ? 'Eventos' : 'Sucursales';

  const cargar = useCallback(async () => {
    try { setFilas((await pedir<{ filas: T[] }>(`/api/demo-providus/admin/${recurso}`)).filas); }
    catch (e) { if (e instanceof Error && e.message === 'SESION') alVencer(); else setError(e instanceof Error ? e.message : String(e)); }
  }, [recurso, alVencer]);
  useEffect(() => { void cargar(); }, [cargar]);

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setAviso(null); setGuardando(true);
    const form = e.currentTarget;
    try {
      const cuerpo: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());
      if (editando) cuerpo.id = editando.id;
      await pedir(`/api/demo-providus/admin/${recurso}`, { method: editando ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      setAviso(editando ? 'Cambios guardados.' : 'Creado.');
      form.reset(); setEditando(null);
      await cargar(); alCambiar?.();
    } catch (err) { if (err instanceof Error && err.message === 'SESION') alVencer(); else setError(err instanceof Error ? err.message : String(err)); }
    finally { setGuardando(false); }
  }

  async function alternar(f: T) {
    setError(null); setAviso(null);
    try {
      await pedir(`/api/demo-providus/admin/${recurso}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: f.id, [flagActivo]: !activo(f) }) });
      await cargar(); alCambiar?.();
    } catch (err) { if (err instanceof Error && err.message === 'SESION') alVencer(); else setError(err instanceof Error ? err.message : String(err)); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)] lg:items-start">
      <Bisel etiqueta={plural}>
        <Cabecera titulo={plural} cuenta={filas.length ? `${filas.length} en total` : undefined} />
        <div className="px-3 pb-3">
          <div className="px-3"><Aviso mensaje={aviso} error={error} /></div>
          {filas.length === 0 ? (
            <Vacio>{vacio}</Vacio>
          ) : (
            <ul>
              {filas.map((f) => (
                <li key={f.id} className={`flex items-center gap-4 rounded-[20px] px-3 py-3.5 transition-[background-color,opacity] duration-500 ${CURVA} hover:bg-white/[0.03] ${activo(f) ? '' : 'opacity-50'}`}>
                  <div className="min-w-0 flex-1 pl-1">
                    <p className="truncate text-[15.5px] font-semibold text-[#ebe6dd]">{f.nombre}</p>
                    <p className="truncate text-[13px] text-[#8a7a64]">{subtitulo(f) || 'Sin más datos'}</p>
                  </div>
                  <Cargas n={f.cargas} />
                  <Interruptor activo={activo(f)} alCambiar={() => void alternar(f)} etiqueta={`${activo(f) ? 'Desactivar' : 'Activar'} ${f.nombre}`} />
                  <button type="button" onClick={() => { setEditando(f); setAviso(null); setError(null); }} className={GHOST}>Editar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Bisel>
      <Bisel className="lg:sticky lg:top-28" etiqueta={titulo}>
        <form onSubmit={guardar} className="p-6" autoComplete="off">
          <h2 className="pv-display mb-6 text-[19px] text-[#ebe6dd]">{editando ? `Editar ${editando.nombre}` : titulo}</h2>
          <div className="flex flex-col gap-5">
            {campos.map((c) => (
              <label key={`${c.nombre}${editando?.id}`}><span className={ETIQUETA}>{c.etiqueta}</span>
                <Input className={`${CAMPO} [color-scheme:dark]`} name={c.nombre} type={c.tipo ?? 'text'} required={c.nombre === 'nombre'} placeholder={c.placeholder} autoComplete="off" defaultValue={editando ? String((editando as unknown as Record<string, unknown>)[c.nombre] ?? '') : ''} />
              </label>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-3">
            <BotonPrincipal deshabilitado={guardando} className="flex-1">{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear'}</BotonPrincipal>
            {editando && <button type="button" onClick={() => setEditando(null)} className={GHOST}>Cancelar</button>}
          </div>
        </form>
      </Bisel>
    </div>
  );
}

// ── cargas: resumen por evento y promotora ──────────────────────────────

function ResumenCargas({ alVencer }: { alVencer: () => void }) {
  const [datos, setDatos] = useState<{ total: number; filas: FilaResumen[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cargar = useCallback(async () => {
    try { setDatos(await pedir<{ total: number; filas: FilaResumen[] }>('/api/demo-providus/admin/resumen')); setError(null); }
    catch (e) { if (e instanceof Error && e.message === 'SESION') alVencer(); else setError(e instanceof Error ? e.message : String(e)); }
  }, [alVencer]);
  useEffect(() => { void cargar(); }, [cargar]);
  return (
    <Bisel etiqueta="Cargas">
      <div className="flex flex-wrap items-end justify-between gap-5 px-6 pb-4 pt-7">
        <div>
          <p className="pv-display pv-num text-[56px] leading-none text-[#ebe6dd] [text-shadow:0_0_40px_rgba(224,96,58,0.35)]">{datos ? datos.total : '…'}</p>
          <p className="mt-2 text-[14px] text-[#8a7a64]">cargas en total, agrupadas por evento y promotora</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void cargar()} className={GHOST}>Actualizar</button>
          <a href="/api/demo-providus/admin/export" download className={`pv-boton group inline-flex h-12 touch-manipulation items-center gap-3 rounded-full pl-6 pr-1.5 text-[14px] font-semibold text-[#fff6ef] transition-transform duration-500 ${CURVA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] active:scale-[0.98]`}>
            Descargar CSV
            <span className={`grid h-9 w-9 place-items-center rounded-full bg-black/25 transition-transform duration-500 ${CURVA} group-hover:translate-y-0.5`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
            </span>
          </a>
        </div>
      </div>
      <div className="px-3 pb-3"><div className="px-3"><Aviso mensaje={null} error={error} /></div>
        {datos && datos.filas.length === 0 && <Vacio>Todavía no hay cargas. Aparecen acá apenas una promotora cargue un cliente.</Vacio>}
        {datos && datos.filas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[14px]">
              <thead>
                <tr className="text-[13px] text-[#8a7a64]">
                  <th scope="col" className="px-3 py-3 font-medium">Evento</th><th scope="col" className="px-3 py-3 font-medium">Promotora</th><th scope="col" className="px-3 py-3 font-medium">Sucursal</th><th scope="col" className="px-3 py-3 text-right font-medium">Cargas</th><th scope="col" className="px-3 py-3 text-right font-medium">Última</th>
                </tr>
              </thead>
              <tbody>
                {datos.filas.map((f, i) => (
                  <tr key={i} className={`border-t border-white/[0.06] text-[#ebe6dd] transition-colors duration-500 ${CURVA} hover:bg-white/[0.03]`}>
                    <td className="px-3 py-3.5 font-semibold">{f.evento}</td><td className="px-3 py-3.5">{f.promotora}</td><td className="px-3 py-3.5 text-[#8a7a64]">{f.sucursal}</td>
                    <td className="pv-num px-3 py-3.5 text-right font-semibold">{f.cargas}</td><td className="pv-num px-3 py-3.5 text-right text-[#8a7a64]">{fechaCorta(f.ultima)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Bisel>
  );
}

// ── panel ───────────────────────────────────────────────────────────────

function Panel({ alVencer }: { alVencer: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('promotoras');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const recargarSucursales = useCallback(async () => {
    try { setSucursales((await pedir<{ filas: Sucursal[] }>('/api/demo-providus/admin/sucursales')).filas); } catch { /* el aviso lo muestra la pestaña de sucursales */ }
  }, []);
  useEffect(() => { void recargarSucursales(); }, [recargarSucursales]);

  async function salir() {
    await fetch('/api/demo-providus/auth/salir', { method: 'POST' }).catch(() => {});
    alVencer();
  }
  const pestanas: [Pestana, string][] = [['promotoras', 'Promotoras'], ['eventos', 'Eventos'], ['sucursales', 'Sucursales'], ['cargas', 'Cargas']];
  const enlace = `rounded-full px-4 py-2 text-[13.5px] font-medium text-[#b4a892] transition-colors duration-500 ${CURVA} hover:text-[#ebe6dd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e]`;

  return (
    <div className="pv-login dark relative min-h-dvh overflow-x-clip bg-[#070605] pb-24 [color-scheme:dark]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(55%_70%_at_50%_0%,rgba(224,96,58,0.2),transparent_72%)]" aria-hidden="true" />

      <header className="sticky top-4 z-30 mx-auto mt-5 flex w-[min(1180px,calc(100%-32px))] items-center justify-between rounded-full bg-[rgba(13,11,9,0.72)] py-2 pl-5 pr-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo-providus/logo-app.jpg" alt="Providus, S.A. de Capitalización y Renta" width={1086} height={268} className="pv-logo-app h-9 w-auto" />
        <nav className="flex items-center gap-1" aria-label="Navegación del panel">
          <a href="/demo_providus/central" className={enlace}>Central en vivo</a>
          <button type="button" onClick={() => void salir()} className={enlace}>Salir</button>
        </nav>
      </header>

      <main className="relative mx-auto w-[min(1180px,calc(100%-32px))] pt-14">
        <div className="pv-in" style={{ ['--i' as string]: 0 }}>
          <h1 className="pv-display max-w-[18ch] text-[clamp(30px,4.6vw,48px)] leading-[1.02] text-[#ebe6dd] [text-wrap:balance]">Panel de administración</h1>
          <p className="mt-3 max-w-[52ch] text-[15.5px] leading-relaxed text-[#b4a892]">Cada carga queda con su promotora, su sucursal y su evento. Acá armás ese equipo y ves lo que llegó.</p>

          <div role="tablist" aria-label="Secciones" className="mt-9 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {pestanas.map(([id, t]) => (
              <button key={id} id={`tab-${id}`} role="tab" aria-selected={pestana === id} aria-controls={`panel-${id}`} type="button" onClick={() => setPestana(id)} className={`relative shrink-0 touch-manipulation rounded-full px-5 py-2.5 text-[14px] font-medium transition-[background,color,box-shadow] duration-500 ${CURVA} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3c58e] ${pestana === id ? 'bg-[linear-gradient(145deg,#4a3c2d,#2a2119)] text-[#ebe6dd] shadow-[0_0_26px_-6px_rgba(224,96,58,0.7),inset_0_1px_0_rgba(255,255,255,0.18)]' : 'text-[#9c8c75] hover:text-[#ebe6dd]'}`}>
                {t}
                {pestana === id && <span className="absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-transparent via-[#e0603a] to-transparent" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        <div id={`panel-${pestana}`} role="tabpanel" aria-labelledby={`tab-${pestana}`} className="mt-8">
          {pestana === 'promotoras' && <Promotoras sucursales={sucursales} alVencer={alVencer} />}
          {pestana === 'eventos' && (
            <ListaSimple<Evento> recurso="eventos" titulo="Nuevo evento" vacio="Todavía no hay eventos. Creá el primero: cada carga queda registrada en uno." alVencer={alVencer}
              campos={[{ nombre: 'nombre', etiqueta: 'Nombre del evento', placeholder: 'Ej. Expo Rosario…' }, { nombre: 'lugar', etiqueta: 'Lugar', placeholder: 'Ej. Predio Ferial…' }, { nombre: 'fecha', etiqueta: 'Fecha', tipo: 'date' }]}
              activo={(f) => f.activo} subtitulo={(f) => [f.lugar, f.fecha].filter(Boolean).join(', ')} />
          )}
          {pestana === 'sucursales' && (
            <ListaSimple<Sucursal> recurso="sucursales" titulo="Nueva sucursal" vacio="Todavía no hay sucursales. Creá la primera: cada promotora pertenece a una." alVencer={alVencer} alCambiar={() => void recargarSucursales()}
              campos={[{ nombre: 'nombre', etiqueta: 'Nombre de la sucursal', placeholder: 'Ej. Casa Central…' }, { nombre: 'ciudad', etiqueta: 'Ciudad', placeholder: 'Ej. Paraná…' }]}
              activo={(f) => f.activa} subtitulo={(f) => f.ciudad ?? ''} />
          )}
          {pestana === 'cargas' && <ResumenCargas alVencer={alVencer} />}
        </div>
      </main>
    </div>
  );
}

/** Protege el panel con la clave de administración. */
export function Admin() {
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
  if (est === 'login') return <LoginAdmin titulo="Administración" alListo={() => void revisar()} />;
  return <div className="grid min-h-dvh place-items-center text-[14px] text-[var(--pv-arena)]" role="status">{msg ?? 'Cargando…'}</div>;
}
