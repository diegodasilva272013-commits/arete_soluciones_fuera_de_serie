'use client';

/**
 * DEMO PROVIDUS — pantallas de ingreso. Misma identidad que el stand: el video del logo
 * arriba y una hoja de aluminio con el formulario. Dos variantes:
 *  - LoginPromotora: usuario + clave de cada promotora.
 *  - LoginAdmin: una sola clave, para la central y el panel de administración.
 */

import { useState } from 'react';
import { PanelMarca } from './_orbita';

const ETIQUETA = 'mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--pv-tinta-2)]';
const CAMPO = 'group flex h-[54px] items-center gap-3 rounded-[14px] bg-[var(--pv-aluminio-claro)] px-4 shadow-[inset_0_0_0_1px_rgba(38,29,20,0.09)] transition-[background-color,box-shadow] duration-500 ease-[var(--pv-ease)] focus-within:bg-white focus-within:shadow-[inset_0_0_0_1.5px_var(--pv-naranja)]';
const ENTRADA = 'h-full w-full min-w-0 bg-transparent text-[17px] font-medium text-[var(--pv-tinta)] outline-none focus-visible:outline-none disabled:opacity-60';

const ico = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const IcoPersona = () => (<svg {...ico}><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 19.6c1-3.4 3.9-5.3 7.2-5.3s6.2 1.9 7.2 5.3" /></svg>);
const IcoCandado = () => (<svg {...ico}><rect x="5" y="10.4" width="14" height="10" rx="2.4" /><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" /></svg>);
const IcoOjo = ({ tachado }: { tachado: boolean }) => (<svg {...ico}><path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12Z" /><circle cx="12" cy="12" r="2.8" />{tachado && <path d="M4 4l16 16" />}</svg>);
const IcoFlecha = () => (<svg {...ico} width="18" height="18" strokeWidth="1.4"><path d="M4.5 12h14.2M13.2 6.5 18.7 12l-5.5 5.5" /></svg>);

export function PantallaAcceso({ titulo, bajada, children }: { titulo: string; bajada: string; children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1.15fr)_minmax(500px,0.85fr)]">
      <aside className="relative aspect-[4/3] w-full lg:sticky lg:top-0 lg:aspect-auto lg:h-dvh">
        <PanelMarca />
      </aside>
      <main className="pv-hoja relative -mt-8 flex w-full flex-col rounded-t-[32px] px-5 pb-10 pt-9 lg:mt-0 lg:min-h-dvh lg:justify-center lg:rounded-l-[40px] lg:rounded-tr-none lg:px-14 lg:py-14">
        <div className="mx-auto w-full max-w-[460px]">
          <h1 className="pv-display pv-in text-[32px] leading-[1.02] text-[var(--pv-tinta)] lg:text-[40px]" style={{ ['--i' as string]: 0 }}>{titulo}</h1>
          <p className="pv-in mb-9 mt-3 max-w-[34ch] text-[15px] leading-relaxed text-[var(--pv-tinta-2)]" style={{ ['--i' as string]: 1 }}>{bajada}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

function CampoClave({ valor, alCambiar, deshabilitado, placeholder }: { valor: string; alCambiar: (v: string) => void; deshabilitado: boolean; placeholder: string }) {
  const [ver, setVer] = useState(false);
  return (
    <span className={CAMPO}>
      <span className="text-[var(--pv-tinta-3)] group-focus-within:text-[var(--pv-naranja)]"><IcoCandado /></span>
      <input className={ENTRADA} name="clave" type={ver ? 'text' : 'password'} placeholder={placeholder} autoComplete="current-password" value={valor} onChange={(e) => alCambiar(e.target.value)} disabled={deshabilitado} />
      <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar clave' : 'Mostrar clave'} aria-pressed={ver} className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-[var(--pv-tinta-3)] transition-colors hover:bg-[var(--pv-aluminio-sombra)] hover:text-[var(--pv-tinta)]"><IcoOjo tachado={ver} /></button>
    </span>
  );
}

function Cambio({ href, texto }: { href: string; texto: string }) {
  return (
    <a href={href} className="pv-in mt-7 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--pv-tinta-2)] transition-colors hover:text-[var(--pv-naranja)]" style={{ ['--i' as string]: 5 }}>{texto}<IcoFlecha /></a>
  );
}

function Boton({ cargando, deshabilitado, texto }: { cargando: boolean; deshabilitado: boolean; texto: string }) {
  return (
    <button type="submit" disabled={deshabilitado || cargando} className="pv-boton group mt-2 flex h-14 w-full items-center justify-between rounded-[14px] pl-6 pr-2 text-[#fff6ef] transition-[transform,background] duration-500 ease-[var(--pv-ease)] active:scale-[0.985] disabled:cursor-default disabled:text-[var(--pv-tinta-3)] disabled:active:scale-100">
      <span className="pv-display text-[13px] uppercase tracking-[0.2em]">{cargando ? 'Ingresando…' : texto}</span>
      <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#1a140d]/20 group-disabled:bg-transparent"><IcoFlecha /></span>
    </button>
  );
}

/** Usuario + clave de la promotora. `alListo` se llama cuando el servidor ya dejó la sesión abierta. */
export function LoginPromotora({ alListo }: { alListo: () => void }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError(null);
    try {
      const r = await fetch('/api/demo-providus/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario, clave }) });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; detalle?: string } | null;
      if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      alListo();
    } catch (err) {
      setError(err instanceof TypeError ? `No se pudo conectar con el servidor (${err.message}).` : err instanceof Error ? err.message : String(err));
      setClave('');
    } finally {
      setCargando(false);
    }
  }

  return (
    <PantallaAcceso titulo="Ingreso de promotoras" bajada="Entrá con tu usuario y tu clave. Cada carga queda a tu nombre.">
      <form onSubmit={entrar} className="flex flex-col gap-5">
        <label className="pv-in block" style={{ ['--i' as string]: 2 }}>
          <span className={ETIQUETA}>Usuario</span>
          <span className={CAMPO}>
            <span className="text-[var(--pv-tinta-3)] group-focus-within:text-[var(--pv-naranja)]"><IcoPersona /></span>
            <input className={ENTRADA} name="usuario" placeholder="tu.usuario" autoComplete="username" autoCapitalize="none" autoCorrect="off" value={usuario} onChange={(e) => setUsuario(e.target.value)} disabled={cargando} />
          </span>
        </label>
        <label className="pv-in block" style={{ ['--i' as string]: 3 }}>
          <span className={ETIQUETA}>Clave</span>
          <CampoClave valor={clave} alCambiar={setClave} deshabilitado={cargando} placeholder="••••••" />
        </label>
        {error && <p role="alert" className="rounded-[14px] bg-[#f3d9d4] px-4 py-3 text-[13px] font-medium leading-snug text-[var(--pv-error)]">{error}</p>}
        <Boton cargando={cargando} deshabilitado={!usuario.trim() || !clave} texto="Ingresar" />
      </form>
      <Cambio href="/demo_providus/admin" texto="Soy del equipo de Providus" />
    </PantallaAcceso>
  );
}

/** Clave de administración (central y panel). */
export function LoginAdmin({ titulo, alListo }: { titulo: string; alListo: () => void }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setError(null);
    try {
      const r = await fetch('/api/demo-providus/auth/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clave }) });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; detalle?: string } | null;
      if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      alListo();
    } catch (err) {
      setError(err instanceof TypeError ? `No se pudo conectar con el servidor (${err.message}).` : err instanceof Error ? err.message : String(err));
      setClave('');
    } finally {
      setCargando(false);
    }
  }

  return (
    <PantallaAcceso titulo={titulo} bajada="Acceso para el equipo de Providus. Pedí la clave de administración.">
      <form onSubmit={entrar} className="flex flex-col gap-5">
        <label className="pv-in block" style={{ ['--i' as string]: 2 }}>
          <span className={ETIQUETA}>Clave de administración</span>
          <CampoClave valor={clave} alCambiar={setClave} deshabilitado={cargando} placeholder="••••••••" />
        </label>
        {error && <p role="alert" className="rounded-[14px] bg-[#f3d9d4] px-4 py-3 text-[13px] font-medium leading-snug text-[var(--pv-error)]">{error}</p>}
        <Boton cargando={cargando} deshabilitado={!clave} texto="Ingresar" />
      </form>
      <Cambio href="/demo_providus" texto="Soy promotora" />
    </PantallaAcceso>
  );
}
