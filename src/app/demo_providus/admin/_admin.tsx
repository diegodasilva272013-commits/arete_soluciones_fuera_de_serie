'use client';

/**
 * DEMO PROVIDUS — panel de administración.
 * Alta, edición y baja (activar/desactivar) de promotoras, eventos y sucursales, y el
 * resumen de cargas por evento y promotora con descarga a CSV. Todo pasa por
 * /api/demo-providus/admin/*, que exige la sesión de administración.
 */

import { useCallback, useEffect, useState } from 'react';
import { LoginAdmin } from '../_acceso';

type Pestana = 'promotoras' | 'eventos' | 'sucursales' | 'cargas';

interface Promotora { id: string; usuario: string; nombre: string; apellido: string; edad: number | null; foto_url: string | null; sucursal_id: string | null; sucursal: string | null; activa: boolean; ultimo_ingreso: string | null; cargas: number }
interface Evento { id: string; nombre: string; lugar: string | null; fecha: string | null; activo: boolean; cargas: number }
interface Sucursal { id: string; nombre: string; ciudad: string | null; activa: boolean; cargas: number }
interface FilaResumen { evento: string; promotora: string; sucursal: string; cargas: number; ultima: string }

const ETIQUETA = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pv-tinta-2)]';
const ENTRADA = 'h-[46px] w-full min-w-0 rounded-[12px] bg-[var(--pv-aluminio-claro)] px-3.5 text-[15px] font-medium text-[var(--pv-tinta)] shadow-[inset_0_0_0_1px_rgba(38,29,20,0.1)] outline-none transition-shadow duration-300 placeholder:text-[var(--pv-tinta-3)] focus:bg-white focus:shadow-[inset_0_0_0_1.5px_var(--pv-naranja)] disabled:opacity-60';
const BTN = 'rounded-[10px] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-[transform,background-color] duration-300 ease-[var(--pv-ease)] active:scale-[0.98] disabled:opacity-50';
const BTN_PRINCIPAL = `${BTN} pv-boton text-[#fff6ef]`;
const BTN_SEC = `${BTN} text-[var(--pv-tinta)] shadow-[inset_0_0_0_1px_rgba(38,29,20,0.22)] hover:bg-[var(--pv-aluminio-sombra)]`;

const fechaCorta = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '—');
const iniciales = (n: string, a: string) => `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase();

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: 'no-store', ...init });
  const d = (await r.json().catch(() => null)) as ({ ok?: boolean; detalle?: string } & T) | null;
  if (r.status === 401) throw new Error('SESION');
  if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
  return d as T;
}

function Aviso({ mensaje, error }: { mensaje: string | null; error: string | null }) {
  if (!mensaje && !error) return null;
  return (
    <p role={error ? 'alert' : 'status'} className={`mb-4 rounded-[12px] px-4 py-3 text-[13px] font-medium leading-snug ${error ? 'bg-[#f3d9d4] text-[var(--pv-error)]' : 'bg-[#e0e6d4] text-[#3f4d27]'}`}>
      {error ?? mensaje}
    </p>
  );
}

function Interruptor({ activo, alCambiar, etiqueta }: { activo: boolean; alCambiar: () => void; etiqueta: string }) {
  return (
    <button type="button" onClick={alCambiar} role="switch" aria-checked={activo} aria-label={etiqueta} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${activo ? 'bg-[var(--pv-naranja)]' : 'bg-[var(--pv-aluminio-sombra)]'}`}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ease-[var(--pv-ease)] ${activo ? 'translate-x-5' : ''}`} />
    </button>
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
      <section aria-label="Promotoras">
        <Aviso mensaje={aviso} error={error} />
        {filas.length === 0 ? (
          <p className="rounded-[14px] bg-[var(--pv-aluminio-claro)] px-5 py-8 text-center text-[14px] text-[var(--pv-tinta-2)]">Todavía no hay promotoras. Creá la primera con el formulario.</p>
        ) : (
          <ul className="overflow-hidden rounded-[14px] bg-[var(--pv-aluminio-claro)] shadow-[inset_0_0_0_1px_rgba(38,29,20,0.08)]">
            {filas.map((p) => (
              <li key={p.id} className={`flex items-center gap-3.5 border-b border-[var(--pv-aluminio-sombra)] px-4 py-3.5 last:border-b-0 ${p.activa ? '' : 'opacity-55'}`}>
                {p.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.foto_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--pv-bronce-800)] text-[14px] font-semibold text-[var(--pv-aluminio)]" aria-hidden="true">{iniciales(p.nombre, p.apellido)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[var(--pv-tinta)]">{p.nombre} {p.apellido}{p.edad ? <span className="font-medium text-[var(--pv-tinta-2)]"> · {p.edad} años</span> : null}</p>
                  <p className="truncate text-[12px] font-medium text-[var(--pv-tinta-2)]">@{p.usuario} · {p.sucursal ?? 'sin sucursal'} · último ingreso {fechaCorta(p.ultimo_ingreso)}</p>
                </div>
                <span className="pv-num shrink-0 text-right text-[12px] font-semibold text-[var(--pv-tinta-2)]">{p.cargas}<span className="block text-[10px] font-medium uppercase tracking-[0.12em]">cargas</span></span>
                <Interruptor activo={p.activa} alCambiar={() => void alternar(p)} etiqueta={`${p.activa ? 'Desactivar' : 'Activar'} a ${p.nombre} ${p.apellido}`} />
                <button type="button" onClick={() => { setEditando(p); setVista(p.foto_url); setClave(''); setAviso(null); setError(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={BTN_SEC}>Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={guardar} className="h-fit rounded-[14px] bg-[var(--pv-aluminio-claro)] p-5 shadow-[inset_0_0_0_1px_rgba(38,29,20,0.08)]" aria-label={editando ? 'Editar promotora' : 'Nueva promotora'}>
        <h2 className="pv-display mb-4 text-[18px] text-[var(--pv-tinta)]">{editando ? `Editar a ${editando.nombre}` : 'Nueva promotora'}</h2>
        <div className="flex flex-col gap-3.5">
          <label><span className={ETIQUETA}>Foto{editando ? ' (dejá vacío para mantener)' : ''}</span>
            <span className="flex items-center gap-3">
              {vista ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vista} alt="Foto de la promotora" className="h-14 w-14 shrink-0 rounded-full object-cover" />
              ) : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--pv-aluminio-sombra)] text-[11px] font-medium text-[var(--pv-tinta-3)]">sin foto</span>}
              <input name="foto" type="file" accept="image/*" className="w-full text-[13px] text-[var(--pv-tinta-2)] file:mr-3 file:rounded-[10px] file:border-0 file:bg-[var(--pv-bronce-800)] file:px-4 file:py-2.5 file:text-[12px] file:font-semibold file:text-[var(--pv-aluminio)]" onChange={(e) => { const f = e.target.files?.[0]; if (f) setVista(URL.createObjectURL(f)); }} />
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label><span className={ETIQUETA}>Nombre</span><input className={ENTRADA} name="nombre" required key={`n${editando?.id}`} defaultValue={editando?.nombre ?? ''} autoComplete="off" /></label>
            <label><span className={ETIQUETA}>Apellido</span><input className={ENTRADA} name="apellido" required key={`a${editando?.id}`} defaultValue={editando?.apellido ?? ''} autoComplete="off" /></label>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <label><span className={ETIQUETA}>Edad</span><input className={ENTRADA} name="edad" type="number" min={16} max={99} required key={`e${editando?.id}`} defaultValue={editando?.edad ?? ''} inputMode="numeric" /></label>
            <label><span className={ETIQUETA}>Sucursal</span>
              <select className={ENTRADA} name="sucursal_id" required key={`s${editando?.id}`} defaultValue={editando?.sucursal_id ?? ''}>
                <option value="" disabled>Elegí…</option>
                {activas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </label>
          </div>
          {!editando && (
            <label><span className={ETIQUETA}>Usuario (para ingresar)</span><input className={ENTRADA} name="usuario" required placeholder="laura.perez" autoCapitalize="none" autoCorrect="off" autoComplete="off" /></label>
          )}
          <label><span className={ETIQUETA}>{editando ? 'Nueva clave (dejá vacío para no cambiarla)' : 'Clave (mínimo 6 caracteres)'}</span>
            <input className={ENTRADA} name="clave" type="text" required={!editando} minLength={editando ? undefined : 6} value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="off" placeholder={editando ? 'sin cambios' : 'la ve solo quien la crea'} />
          </label>
        </div>
        {sucursales.filter((s) => s.activa).length === 0 && <p role="alert" className="mt-3 text-[12px] font-medium text-[var(--pv-error)]">Primero creá una sucursal en la pestaña Sucursales.</p>}
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={guardando} className={`${BTN_PRINCIPAL} flex-1`}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear promotora'}</button>
          {editando && <button type="button" onClick={limpiar} className={BTN_SEC}>Cancelar</button>}
        </div>
      </form>
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
      <section aria-label={titulo}>
        <Aviso mensaje={aviso} error={error} />
        {filas.length === 0 ? (
          <p className="rounded-[14px] bg-[var(--pv-aluminio-claro)] px-5 py-8 text-center text-[14px] text-[var(--pv-tinta-2)]">{vacio}</p>
        ) : (
          <ul className="overflow-hidden rounded-[14px] bg-[var(--pv-aluminio-claro)] shadow-[inset_0_0_0_1px_rgba(38,29,20,0.08)]">
            {filas.map((f) => (
              <li key={f.id} className={`flex items-center gap-3.5 border-b border-[var(--pv-aluminio-sombra)] px-4 py-3.5 last:border-b-0 ${activo(f) ? '' : 'opacity-55'}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[var(--pv-tinta)]">{f.nombre}</p>
                  <p className="truncate text-[12px] font-medium text-[var(--pv-tinta-2)]">{subtitulo(f) || '—'}</p>
                </div>
                <span className="pv-num shrink-0 text-right text-[12px] font-semibold text-[var(--pv-tinta-2)]">{f.cargas}<span className="block text-[10px] font-medium uppercase tracking-[0.12em]">cargas</span></span>
                <Interruptor activo={activo(f)} alCambiar={() => void alternar(f)} etiqueta={`${activo(f) ? 'Desactivar' : 'Activar'} ${f.nombre}`} />
                <button type="button" onClick={() => { setEditando(f); setAviso(null); setError(null); }} className={BTN_SEC}>Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <form onSubmit={guardar} className="h-fit rounded-[14px] bg-[var(--pv-aluminio-claro)] p-5 shadow-[inset_0_0_0_1px_rgba(38,29,20,0.08)]">
        <h2 className="pv-display mb-4 text-[18px] text-[var(--pv-tinta)]">{editando ? `Editar ${editando.nombre}` : titulo}</h2>
        <div className="flex flex-col gap-3.5">
          {campos.map((c) => (
            <label key={`${c.nombre}${editando?.id}`}><span className={ETIQUETA}>{c.etiqueta}</span>
              <input className={ENTRADA} name={c.nombre} type={c.tipo ?? 'text'} required={c.nombre === 'nombre'} placeholder={c.placeholder} autoComplete="off" defaultValue={editando ? String((editando as unknown as Record<string, unknown>)[c.nombre] ?? '') : ''} />
            </label>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={guardando} className={`${BTN_PRINCIPAL} flex-1`}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear'}</button>
          {editando && <button type="button" onClick={() => setEditando(null)} className={BTN_SEC}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

// ── cargas: resumen por evento y promotora ──────────────────────────────

function Cargas({ alVencer }: { alVencer: () => void }) {
  const [datos, setDatos] = useState<{ total: number; filas: FilaResumen[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cargar = useCallback(async () => {
    try { setDatos(await pedir<{ total: number; filas: FilaResumen[] }>('/api/demo-providus/admin/resumen')); setError(null); }
    catch (e) { if (e instanceof Error && e.message === 'SESION') alVencer(); else setError(e instanceof Error ? e.message : String(e)); }
  }, [alVencer]);
  useEffect(() => { void cargar(); }, [cargar]);
  return (
    <section aria-label="Cargas">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-[var(--pv-tinta-2)]">{datos ? <><span className="pv-display pv-num text-[26px] text-[var(--pv-tinta)]">{datos.total}</span> cargas en total, agrupadas por evento y promotora.</> : 'Cargando…'}</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => void cargar()} className={BTN_SEC}>Actualizar</button>
          <a href="/api/demo-providus/admin/export" className={`${BTN_PRINCIPAL} inline-block`} download>Descargar todo (CSV)</a>
        </div>
      </div>
      <Aviso mensaje={null} error={error} />
      {datos && datos.filas.length === 0 && <p className="rounded-[14px] bg-[var(--pv-aluminio-claro)] px-5 py-8 text-center text-[14px] text-[var(--pv-tinta-2)]">Todavía no hay cargas.</p>}
      {datos && datos.filas.length > 0 && (
        <div className="overflow-x-auto rounded-[14px] bg-[var(--pv-aluminio-claro)] shadow-[inset_0_0_0_1px_rgba(38,29,20,0.08)]">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--pv-aluminio-sombra)] text-[11px] uppercase tracking-[0.14em] text-[var(--pv-tinta-2)]">
                <th className="px-4 py-3 font-semibold">Evento</th><th className="px-4 py-3 font-semibold">Promotora</th><th className="px-4 py-3 font-semibold">Sucursal</th><th className="px-4 py-3 text-right font-semibold">Cargas</th><th className="px-4 py-3 text-right font-semibold">Última</th>
              </tr>
            </thead>
            <tbody>
              {datos.filas.map((f, i) => (
                <tr key={i} className="border-b border-[var(--pv-aluminio-sombra)] last:border-b-0 text-[var(--pv-tinta)]">
                  <td className="px-4 py-3 font-semibold">{f.evento}</td><td className="px-4 py-3">{f.promotora}</td><td className="px-4 py-3 text-[var(--pv-tinta-2)]">{f.sucursal}</td>
                  <td className="pv-num px-4 py-3 text-right font-semibold">{f.cargas}</td><td className="pv-num px-4 py-3 text-right text-[var(--pv-tinta-2)]">{fechaCorta(f.ultima)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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

  return (
    <div className="min-h-dvh">
      <header className="flex h-16 items-center justify-between px-5 lg:px-10">
        <div className="flex items-center gap-4">
          <span className="pv-display text-[18px] text-[var(--pv-aluminio)]">PROVIDUS</span>
          <span className="h-5 w-px bg-white/15" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pv-sec)]">Administración</span>
        </div>
        <nav className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.16em]">
          <a href="/demo_providus/central" className="text-[var(--pv-sec)] transition-colors hover:text-[var(--pv-aluminio)]">Central</a>
          <button type="button" onClick={() => void salir()} className="text-[var(--pv-sec)] transition-colors hover:text-[var(--pv-aluminio)]">Salir</button>
        </nav>
      </header>
      <main className="pv-hoja mx-auto min-h-[calc(100dvh-64px)] max-w-[1180px] rounded-t-[32px] px-5 pb-16 pt-8 lg:px-10">
        <div role="tablist" className="mb-8 flex gap-1.5 overflow-x-auto">
          {pestanas.map(([id, t]) => (
            <button key={id} role="tab" aria-selected={pestana === id} type="button" onClick={() => setPestana(id)} className={`shrink-0 rounded-[10px] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${pestana === id ? 'bg-[var(--pv-bronce-800)] text-[var(--pv-aluminio)]' : 'text-[var(--pv-tinta-2)] hover:bg-[var(--pv-aluminio-sombra)]'}`}>{t}</button>
          ))}
        </div>
        {pestana === 'promotoras' && <Promotoras sucursales={sucursales} alVencer={alVencer} />}
        {pestana === 'eventos' && (
          <ListaSimple<Evento> recurso="eventos" titulo="Nuevo evento" vacio="Todavía no hay eventos. Creá el primero." alVencer={alVencer}
            campos={[{ nombre: 'nombre', etiqueta: 'Nombre del evento' }, { nombre: 'lugar', etiqueta: 'Lugar' }, { nombre: 'fecha', etiqueta: 'Fecha', tipo: 'date' }]}
            activo={(f) => f.activo} subtitulo={(f) => [f.lugar, f.fecha].filter(Boolean).join(' · ')} />
        )}
        {pestana === 'sucursales' && (
          <ListaSimple<Sucursal> recurso="sucursales" titulo="Nueva sucursal" vacio="Todavía no hay sucursales. Creá la primera: cada promotora pertenece a una." alVencer={alVencer} alCambiar={() => void recargarSucursales()}
            campos={[{ nombre: 'nombre', etiqueta: 'Nombre de la sucursal' }, { nombre: 'ciudad', etiqueta: 'Ciudad' }]}
            activo={(f) => f.activa} subtitulo={(f) => f.ciudad ?? ''} />
        )}
        {pestana === 'cargas' && <Cargas alVencer={alVencer} />}
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
  return <div className="grid min-h-dvh place-items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--pv-arena)]">{msg ?? 'Cargando…'}</div>;
}
