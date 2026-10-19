'use client';

/**
 * DEMO PROVIDUS — Sprint 1: captura móvil en el stand.
 * Una sola pantalla con tres estados (formulario → enviando → listo) en un mismo
 * componente: la transición es instantánea, no hay rutas de por medio.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { caracteresValidos, formatoLegible, normalizarTelefono, soloDigitos } from '@/lib/demo-providus/telefono';
import { HeroLogo } from './_hero';

type Estado = 'formulario' | 'enviando' | 'listo';

const PROVINCIAS = [
  'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

const VACIO = { nombre: '', apellido: '', telefono: '', email: '', instagram: '', provincia: 'Córdoba', localidad: '' };
type Form = typeof VACIO;
type Campo = keyof Form;

interface Cargado {
  id: string;
  nombre: string;
  apellido: string;
  hora: string;
  foto: string;
}

const CLAVE_HISTORIAL = 'pv_demo_stand_historial';
const SEIS_SEGUNDOS = 6000;

// ── utilidades ──────────────────────────────────────────────────────────

/** Achica la foto en el navegador: lado mayor 1080 px, JPEG calidad 0.82 (~200 KB). */
async function achicar(archivo: File): Promise<Blob> {
  const LADO = 1080;
  let fuente: CanvasImageSource;
  let w: number;
  let h: number;
  try {
    const bmp = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    fuente = bmp;
    w = bmp.width;
    h = bmp.height;
  } catch {
    const url = URL.createObjectURL(archivo);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      fuente = img;
      w = img.naturalWidth;
      h = img.naturalHeight;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const escala = Math.min(1, LADO / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * escala));
  canvas.height = Math.max(1, Math.round(h * escala));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('El navegador no pudo procesar la foto.');
  ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo comprimir la foto.'))), 'image/jpeg', 0.82));
}

function validar(f: Form): Partial<Record<Campo, string>> {
  const e: Partial<Record<Campo, string>> = {};
  if (f.nombre.trim().length < 2) e.nombre = 'Mínimo 2 letras.';
  if (f.apellido.trim().length < 2) e.apellido = 'Mínimo 2 letras.';
  const tel = f.telefono.trim();
  if (!tel) e.telefono = 'Falta el teléfono.';
  else if (!caracteresValidos(tel)) e.telefono = 'Solo números, espacios, guiones y paréntesis.';
  else if (soloDigitos(tel).length < 10) e.telefono = 'Faltan dígitos: mínimo 10.';
  else if (!normalizarTelefono(tel)) e.telefono = 'Revisá el código de área: no se pudo armar el número para llamar.';
  const mail = f.email.trim();
  if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) e.email = 'Tiene que llevar @ y un punto después.';
  return e;
}

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ── iconos: líneas finas, un solo trazo ─────────────────────────────────

const ico = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const IcoPersona = () => (
  <svg {...ico}><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 19.6c1-3.4 3.9-5.3 7.2-5.3s6.2 1.9 7.2 5.3" /></svg>
);
const IcoTelefono = () => (
  <svg {...ico}><rect x="7" y="2.8" width="10" height="18.4" rx="2.4" /><path d="M10.6 18.2h2.8" /></svg>
);
const IcoCorreo = () => (
  <svg {...ico}><rect x="3" y="5.4" width="18" height="13.2" rx="2.2" /><path d="m3.6 7.2 8.4 6.2 8.4-6.2" /></svg>
);
const IcoInstagram = () => (
  <svg {...ico}><rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" /></svg>
);
const IcoUbicacion = () => (
  <svg {...ico}><path d="M12 21.2s6.6-5.6 6.6-11.2a6.6 6.6 0 0 0-13.2 0c0 5.6 6.6 11.2 6.6 11.2Z" /><circle cx="12" cy="10" r="2.4" /></svg>
);
const IcoCiudad = () => (
  <svg {...ico}><path d="M4 20.4V9.2l6-2.6v13.8M10 20.4V4l10 3.6v12.8M3 20.4h18" /><path d="M13.4 10.4h3.2M13.4 13.6h3.2" /></svg>
);
const IcoCamara = () => (
  <svg {...ico} width="28" height="28" strokeWidth="1.1"><path d="M3.4 8.6h3.6l1.6-2.6h6.8l1.6 2.6h3.6v10.8H3.4z" /><circle cx="12" cy="13.6" r="3.5" /></svg>
);
const IcoFlecha = () => (
  <svg {...ico} width="18" height="18" strokeWidth="1.4"><path d="M4.5 12h14.2M13.2 6.5 18.7 12l-5.5 5.5" /></svg>
);
const IcoCerrar = () => (
  <svg {...ico} width="16" height="16"><path d="M6 6l12 12M18 6 6 18" /></svg>
);
const IcoFlechaAbajo = () => (
  <svg {...ico} width="16" height="16"><path d="m6.4 9.6 5.6 5.6 5.6-5.6" /></svg>
);

// ── piezas de interfaz ──────────────────────────────────────────────────

const ETIQUETA = 'mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--pv-tinta-2)]';
const ENTRADA = 'h-full w-full min-w-0 bg-transparent text-[17px] font-medium text-[var(--pv-tinta)] outline-none focus-visible:outline-none disabled:opacity-60';

function Campo({ etiqueta, icono, error, ayuda, i, children }: { etiqueta: string; icono: React.ReactNode; error?: string; ayuda?: string; i: number; children: React.ReactNode }) {
  return (
    <label className="pv-in block" style={{ ['--i' as string]: i }}>
      <span className={ETIQUETA}>{etiqueta}</span>
      <span
        className={`group flex h-[54px] items-center gap-3 rounded-[14px] px-4 transition-[background-color,box-shadow] duration-500 ease-[var(--pv-ease)] ${
          error
            ? 'bg-[var(--pv-aluminio-claro)] shadow-[inset_0_0_0_1.5px_var(--pv-error)]'
            : 'bg-[var(--pv-aluminio-claro)] shadow-[inset_0_0_0_1px_rgba(38,29,20,0.09)] focus-within:bg-white focus-within:shadow-[inset_0_0_0_1.5px_var(--pv-naranja)]'
        }`}
      >
        <span className="shrink-0 text-[var(--pv-tinta-3)] transition-colors duration-500 group-focus-within:text-[var(--pv-naranja)]">{icono}</span>
        {children}
      </span>
      {error ? (
        <span role="alert" className="mt-2 block text-[12px] font-medium leading-snug text-[var(--pv-error)]">{error}</span>
      ) : ayuda ? (
        <span className="pv-num mt-2 block text-[12px] font-medium leading-snug text-[var(--pv-tinta-2)]">{ayuda}</span>
      ) : null}
    </label>
  );
}

/** Cuatro esquinas finas: el encuadre de un visor. */
function Esquinas() {
  const base = 'absolute h-6 w-6 border-[var(--pv-arena)]/55';
  return (
    <>
      <span className={`${base} left-5 top-5 rounded-tl-lg border-l-[1.5px] border-t-[1.5px]`} aria-hidden="true" />
      <span className={`${base} right-5 top-5 rounded-tr-lg border-r-[1.5px] border-t-[1.5px]`} aria-hidden="true" />
      <span className={`${base} bottom-5 left-5 rounded-bl-lg border-b-[1.5px] border-l-[1.5px]`} aria-hidden="true" />
      <span className={`${base} bottom-5 right-5 rounded-br-lg border-b-[1.5px] border-r-[1.5px]`} aria-hidden="true" />
    </>
  );
}

// ── pantalla ────────────────────────────────────────────────────────────

export function Stand() {
  const [estado, setEstado] = useState<Estado>('formulario');
  const [form, setForm] = useState<Form>(VACIO);
  const [tocado, setTocado] = useState<Partial<Record<Campo, boolean>>>({});
  const [foto, setFoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<{ nombre: string; foto: string } | null>(null);
  const [historial, setHistorial] = useState<Cargado[]>([]);
  const [errorBaja, setErrorBaja] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const errores = useMemo(() => validar(form), [form]);
  const e164 = useMemo(() => (errores.telefono ? null : normalizarTelefono(form.telefono)), [errores.telefono, form.telefono]);
  const valido = Object.keys(errores).length === 0 && !!foto && !procesandoFoto;

  // Qué falta, dicho en voz baja encima del botón mientras está apagado.
  const falta = useMemo(() => {
    const l: string[] = [];
    if (!foto) l.push('la foto');
    if (errores.nombre) l.push('el nombre');
    if (errores.apellido) l.push('el apellido');
    if (errores.telefono) l.push('el teléfono');
    if (errores.email) l.push('el correo');
    return l;
  }, [foto, errores]);

  // Historial de esta sesión: vive en localStorage, sin consultar la base.
  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL) ?? '[]');
      if (Array.isArray(guardado)) setHistorial(guardado);
    } catch { /* sin almacenamiento: la lista arranca vacía */ }
  }, []);
  const guardarHistorial = useCallback((lista: Cargado[]) => {
    setHistorial(lista);
    try { localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(lista.slice(0, 20))); } catch { /* nada */ }
  }, []);

  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);
  useEffect(() => () => { if (foto) URL.revokeObjectURL(foto.url); }, [foto]);

  function cambiar(campo: Campo, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (valor) setTocado((t) => ({ ...t, [campo]: true }));
  }
  const ver = (campo: Campo) => (tocado[campo] ? errores[campo] : undefined);

  async function alElegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir la misma foto con "Repetir"
    if (!archivo) return;
    setErrorFoto(null);
    setProcesandoFoto(true);
    try {
      const blob = await achicar(archivo);
      setFoto({ blob, url: URL.createObjectURL(blob) });
    } catch (err) {
      setErrorFoto(`No se pudo procesar la foto: ${(err as Error).message}`);
    } finally {
      setProcesandoFoto(false);
    }
  }

  function limpiar() {
    if (temporizador.current) clearTimeout(temporizador.current);
    setForm(VACIO);
    setTocado({});
    setFoto(null);
    setErrorEnvio(null);
    setErrorFoto(null);
    setEstado('formulario');
    window.scrollTo({ top: 0 });
  }

  async function enviar() {
    if (!valido || !foto || estado !== 'formulario') return;
    setEstado('enviando');
    setErrorEnvio(null);
    try {
      const fd = new FormData();
      fd.append('foto', foto.blob, 'foto.jpg');
      (Object.keys(form) as Campo[]).forEach((k) => fd.append(k, form[k].trim()));
      const r = await fetch('/api/demo-providus/registros', { method: 'POST', body: fd });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; id?: string; foto_url?: string; detalle?: string } | null;
      if (!r.ok || !d?.ok || !d.id) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      guardarHistorial([{ id: d.id, nombre: form.nombre.trim(), apellido: form.apellido.trim(), hora: new Date().toISOString(), foto: d.foto_url ?? foto.url }, ...historial]);
      setUltimo({ nombre: form.nombre.trim(), foto: foto.url });
      setEstado('listo');
      temporizador.current = setTimeout(limpiar, SEIS_SEGUNDOS);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Los datos del formulario NO se borran: se vuelve a la pantalla con el motivo real.
      setErrorEnvio(err instanceof TypeError ? `No se pudo conectar con el servidor (${msg}). Revisá la conexión; lo cargado sigue acá.` : msg);
      setEstado('formulario');
    }
  }

  async function darDeBaja(id: string) {
    setErrorBaja(null);
    try {
      const r = await fetch(`/api/demo-providus/registros/${id}`, { method: 'DELETE' });
      const d = (await r.json().catch(() => null)) as { ok?: boolean; detalle?: string } | null;
      if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
      guardarHistorial(historial.filter((x) => x.id !== id));
    } catch (err) {
      setErrorBaja(err instanceof Error ? err.message : String(err));
    }
  }

  const enviando = estado === 'enviando';

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1.15fr)_minmax(500px,0.85fr)]">
      {/* MARCA: el video del logo. En el celular es el encabezado; en la PC, el panel izquierdo. */}
      <aside className="relative aspect-[4/3] w-full lg:sticky lg:top-0 lg:aspect-auto lg:h-dvh">
        <HeroLogo />
        <span className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-[var(--pv-bronce-950)]/65 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--pv-aluminio)] lg:left-8 lg:right-auto lg:top-8">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--pv-naranja-luz)]" style={{ animation: 'pv-latido 1.8s ease-in-out infinite' }} aria-hidden="true" />
          Stand 1 · en vivo
        </span>
      </aside>

      {/* HOJA DE ALUMINIO: el formulario */}
      <main className="pv-hoja relative -mt-8 flex w-full flex-col rounded-t-[32px] px-5 pb-6 pt-9 lg:mt-0 lg:min-h-dvh lg:justify-center lg:rounded-l-[40px] lg:rounded-tr-none lg:px-14 lg:py-14">
        <div className="mx-auto flex w-full max-w-[500px] flex-col">
          <div className="mb-8 lg:mb-10">
            <h1 className="pv-display pv-in text-[32px] leading-[1.02] text-[var(--pv-tinta)] lg:text-[40px]" style={{ ['--i' as string]: 0 }}>
              Nuevo participante
            </h1>
            <p className="pv-in mt-3 max-w-[34ch] text-[15px] leading-relaxed text-[var(--pv-tinta-2)]" style={{ ['--i' as string]: 1 }}>
              Sacá la foto y completá los datos. Queda registrado al instante.
            </p>
          </div>

          {/* FOTO */}
          <input id="pv-foto" type="file" accept="image/*" capture="environment" className="sr-only" onChange={alElegirFoto} disabled={enviando} />
          <label
            htmlFor="pv-foto"
            className="pv-in pv-bisel group mb-3 block cursor-pointer rounded-[22px] p-1.5 transition-transform duration-500 ease-[var(--pv-ease)] active:scale-[0.995]"
            style={{ ['--i' as string]: 2 }}
          >
            <span className="pv-visor relative block aspect-square w-full overflow-hidden rounded-2xl">
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto.url} alt="Foto cargada" className="h-full w-full object-cover" />
              ) : (
                <>
                  <Esquinas />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-[var(--pv-aluminio)] transition-transform duration-500 ease-[var(--pv-ease)] group-hover:scale-105">
                      <IcoCamara />
                    </span>
                    <span className="text-center">
                      <span className="block text-[15px] font-semibold text-[var(--pv-aluminio)]">
                        {procesandoFoto ? 'Procesando…' : 'Tocar para sacar la foto'}
                      </span>
                      <span className="mt-1 block text-[12px] text-[var(--pv-arena-oscura)]">Se abre la cámara del celular</span>
                    </span>
                  </span>
                </>
              )}
              {foto && (
                <span className="absolute bottom-3 right-3 rounded-full bg-[var(--pv-bronce-950)]/80 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--pv-aluminio)]">
                  {procesandoFoto ? 'Procesando…' : 'Repetir'}
                </span>
              )}
            </span>
          </label>
          {errorFoto && <p role="alert" className="mb-3 text-[12px] font-medium text-[var(--pv-error)]">{errorFoto}</p>}

          {/* DATOS */}
          <div className="mt-7 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <Campo etiqueta="Nombre" icono={<IcoPersona />} error={ver('nombre')} i={3}>
                <input className={ENTRADA} type="text" name="nombre" placeholder="Nombre" autoComplete="off" autoCapitalize="words" required value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, nombre: true }))} disabled={enviando} />
              </Campo>
              <Campo etiqueta="Apellido" icono={<IcoPersona />} error={ver('apellido')} i={3}>
                <input className={ENTRADA} type="text" name="apellido" placeholder="Apellido" autoComplete="off" autoCapitalize="words" required value={form.apellido} onChange={(e) => cambiar('apellido', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, apellido: true }))} disabled={enviando} />
              </Campo>
            </div>
            <Campo etiqueta="Teléfono" icono={<IcoTelefono />} error={ver('telefono')} ayuda={e164 ? `Se llamará a ${formatoLegible(e164)}` : undefined} i={4}>
              <input className={ENTRADA} type="tel" name="telefono" placeholder="0351 15 123-4567" inputMode="numeric" autoComplete="off" required value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, telefono: true }))} disabled={enviando} />
            </Campo>
            <Campo etiqueta="Correo" icono={<IcoCorreo />} error={ver('email')} i={5}>
              <input className={ENTRADA} type="email" name="email" placeholder="nombre@correo.com" inputMode="email" autoComplete="off" autoCapitalize="none" value={form.email} onChange={(e) => cambiar('email', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, email: true }))} disabled={enviando} />
            </Campo>
            <Campo etiqueta="Instagram" icono={<IcoInstagram />} i={6}>
              <span className="-mr-1.5 text-[17px] font-medium text-[var(--pv-tinta-3)]">@</span>
              <input className={ENTRADA} type="text" name="instagram" placeholder="usuario" autoComplete="off" autoCapitalize="none" autoCorrect="off" value={form.instagram} onChange={(e) => cambiar('instagram', e.target.value.replace(/^@+/, '').replace(/\s/g, ''))} disabled={enviando} />
            </Campo>
            <Campo etiqueta="Provincia" icono={<IcoUbicacion />} i={7}>
              <select className={`${ENTRADA} pr-6`} name="provincia" required value={form.provincia} onChange={(e) => cambiar('provincia', e.target.value)} disabled={enviando}>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p} className="bg-[#f6f3ee] text-[#261d14]">{p}</option>
                ))}
              </select>
              <span className="pointer-events-none -ml-6 shrink-0 text-[var(--pv-tinta-3)]"><IcoFlechaAbajo /></span>
            </Campo>
            <Campo etiqueta="Localidad" icono={<IcoCiudad />} i={8}>
              <input className={ENTRADA} type="text" name="localidad" placeholder="Localidad" autoComplete="off" autoCapitalize="words" value={form.localidad} onChange={(e) => cambiar('localidad', e.target.value)} disabled={enviando} />
            </Campo>
          </div>

          {/* CARGADOS EN ESTE DISPOSITIVO */}
          {historial.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-2 text-[13px] font-semibold text-[var(--pv-tinta-2)]">Cargados en este dispositivo</h2>
              <ul>
                {historial.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 border-b border-[var(--pv-aluminio-sombra)] py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.foto} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[var(--pv-tinta)]">{c.nombre} {c.apellido}</span>
                    <span className="pv-num text-[12px] font-medium text-[var(--pv-tinta-3)]">{horaCorta(c.hora)}</span>
                    <button type="button" onClick={() => void darDeBaja(c.id)} aria-label={`Dar de baja a ${c.nombre} ${c.apellido}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--pv-tinta-3)] transition-colors duration-300 hover:bg-[var(--pv-aluminio-sombra)] hover:text-[var(--pv-error)]">
                      <IcoCerrar />
                    </button>
                  </li>
                ))}
              </ul>
              {errorBaja && <p role="alert" className="mt-3 text-[12px] font-medium text-[var(--pv-error)]">{errorBaja}</p>}
            </section>
          )}

          {/* ACCIÓN: queda fija abajo mientras se desplaza el formulario */}
          <div className="sticky bottom-0 z-20 -mx-5 mt-10 bg-gradient-to-t from-[#e6e0d6] from-70% to-transparent px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-10 lg:mx-0 lg:px-0">
            {errorEnvio && (
              <div role="alert" className="mb-3 rounded-[14px] bg-[#f3d9d4] px-4 py-3 text-[13px] font-medium leading-snug text-[var(--pv-error)]">
                {errorEnvio}
              </div>
            )}
            {!valido && !enviando && falta.length > 0 && (
              <p className="mb-3 text-center text-[12px] font-medium text-[var(--pv-tinta-2)]">Falta {falta.join(', ').replace(/, ([^,]*)$/, ' y $1')}.</p>
            )}
            <button
              type="button"
              onClick={() => void enviar()}
              disabled={!valido || enviando}
              className="pv-boton group flex h-14 w-full items-center justify-between rounded-[14px] pl-6 pr-2 text-[#fff6ef] transition-[transform,background] duration-500 ease-[var(--pv-ease)] active:scale-[0.985] disabled:cursor-default disabled:text-[var(--pv-tinta-3)] disabled:active:scale-100"
            >
              <span className="pv-display text-[13px] uppercase tracking-[0.2em]">{enviando ? 'Enviando…' : 'Registrar'}</span>
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#1a140d]/20 transition-transform duration-500 ease-[var(--pv-ease)] group-enabled:group-hover:translate-x-0.5 group-disabled:bg-transparent">
                <IcoFlecha />
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* CONFIRMACIÓN */}
      {estado === 'listo' && ultimo && (
        <div
          className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
          role="status"
          style={{ background: 'radial-gradient(75% 45% at 15% 0%, rgba(227,197,142,0.4), transparent 68%), linear-gradient(180deg, #1a140d 0%, #33281c 55%, #43362a 100%)' }}
        >
          <div className="pv-luz" aria-hidden="true" />
          <div style={{ animation: 'pv-aparece 0.9s var(--pv-ease) both' }} className="relative flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ultimo.foto} alt="" className="mb-9 h-[132px] w-[132px] rounded-full object-cover outline outline-1 outline-offset-[7px] outline-[var(--pv-arena)]/60" />
            <h1 className="pv-display mb-3 text-[34px] leading-[1.05] text-[var(--pv-aluminio)]">Listo, {ultimo.nombre}.</h1>
            <p className="mb-11 max-w-[30ch] text-[16px] leading-relaxed text-[var(--pv-arena)]">Ya estás participando. Te vamos a contactar.</p>
            <button type="button" onClick={limpiar} className="rounded-[14px] px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--pv-aluminio)] shadow-[inset_0_0_0_1px_var(--pv-arena-oscura)] transition-[background-color,transform] duration-500 ease-[var(--pv-ease)] hover:bg-white/5 active:scale-[0.98]">
              Cargar otro
            </button>
          </div>
          <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--pv-naranja)]" style={{ animation: `pv-cuenta ${SEIS_SEGUNDOS}ms linear both` }} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
