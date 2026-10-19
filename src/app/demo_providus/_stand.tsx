'use client';

/**
 * DEMO PROVIDUS — Sprint 1: captura móvil en el stand.
 * Una sola pantalla con tres estados (formulario → enviando → listo) en un mismo
 * componente: la transición es instantánea, no hay rutas de por medio.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { caracteresValidos, formatoLegible, normalizarTelefono, soloDigitos } from '@/lib/demo-providus/telefono';

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

// ── piezas de interfaz ──────────────────────────────────────────────────

const ETIQUETA = 'block font-[family-name:var(--pv-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--pv-ceniza)]';
const LINEA = 'w-full bg-transparent border-0 border-b py-2 text-[20px] leading-tight text-[var(--pv-hueso)] outline-none placeholder:text-[#3a3a3a] transition-colors rounded-none';

function Campo({ etiqueta, error, ayuda, children }: { etiqueta: string; error?: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <span className={ETIQUETA}>{etiqueta}</span>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[11px] text-[var(--pv-rojo)]">{error}</p>
      ) : ayuda ? (
        <p className="mt-1.5 font-[family-name:var(--pv-mono)] text-[11px] text-[var(--pv-ceniza)]">{ayuda}</p>
      ) : null}
    </div>
  );
}

function IconoCamara() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" aria-hidden="true">
      <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
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
  const claseLinea = (campo: Campo) => `${LINEA} ${ver(campo) ? 'border-[var(--pv-rojo)]' : 'border-[var(--pv-linea)] focus:border-[var(--pv-azul)]'}`;

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
    <>
      {/* ENCABEZADO */}
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--pv-linea)] bg-[var(--pv-negro)] px-4">
        <div className="flex items-center gap-3">
          <span className="text-[18px] font-extrabold tracking-[-0.02em] text-[var(--pv-hueso)]">PROVIDUS</span>
          <span className="h-5 w-px bg-[var(--pv-linea)]" aria-hidden="true" />
          <span className="text-[10px] leading-tight text-[var(--pv-ceniza)]">Capitalización<br />y Renta</span>
        </div>
        <div className="flex items-center gap-2 font-[family-name:var(--pv-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--pv-ceniza)]">
          <span className="h-1.5 w-1.5 bg-[var(--pv-verde)]" style={{ borderRadius: '50%', animation: 'pv-latido 1.6s ease-in-out infinite' }} aria-hidden="true" />
          Stand 1 · en vivo
        </div>
      </header>

      <main className="mx-auto w-full max-w-[480px] px-4 pb-[calc(56px+env(safe-area-inset-bottom)+40px)] pt-[72px]">
        {/* BLOQUE FOTO */}
        <input id="pv-foto" type="file" accept="image/*" capture="environment" className="sr-only" onChange={alElegirFoto} disabled={enviando} />
        <label htmlFor="pv-foto" className={`relative mb-2 block aspect-square w-full cursor-pointer overflow-hidden ${foto ? '' : 'border border-dashed border-[#3a3a3a]'}`}>
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto.url} alt="Foto cargada" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-4 text-[var(--pv-ceniza)]">
              <IconoCamara />
              <span className="font-[family-name:var(--pv-mono)] text-[10px] uppercase tracking-[0.2em]">
                {procesandoFoto ? 'Procesando…' : 'Tocar para sacar la foto'}
              </span>
            </span>
          )}
          {foto && (
            <span className="absolute right-0 top-0 border-b border-l border-[var(--pv-linea)] bg-[var(--pv-negro)] px-3 py-2 font-[family-name:var(--pv-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--pv-hueso)]">
              {procesandoFoto ? 'Procesando…' : 'Repetir'}
            </span>
          )}
        </label>
        {errorFoto && <p role="alert" className="mb-4 text-[11px] text-[var(--pv-rojo)]">{errorFoto}</p>}
        <div className="mb-8" />

        {/* CAMPOS */}
        <Campo etiqueta="Nombre" error={ver('nombre')}>
          <input className={claseLinea('nombre')} type="text" name="nombre" autoComplete="off" autoCapitalize="words" required value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, nombre: true }))} disabled={enviando} />
        </Campo>
        <Campo etiqueta="Apellido" error={ver('apellido')}>
          <input className={claseLinea('apellido')} type="text" name="apellido" autoComplete="off" autoCapitalize="words" required value={form.apellido} onChange={(e) => cambiar('apellido', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, apellido: true }))} disabled={enviando} />
        </Campo>
        <Campo etiqueta="Teléfono" error={ver('telefono')} ayuda={e164 ? `Se llamará a ${formatoLegible(e164)}` : undefined}>
          <input className={claseLinea('telefono')} type="tel" name="telefono" inputMode="numeric" autoComplete="off" required value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, telefono: true }))} disabled={enviando} />
        </Campo>
        <Campo etiqueta="Correo" error={ver('email')}>
          <input className={claseLinea('email')} type="email" name="email" inputMode="email" autoComplete="off" autoCapitalize="none" value={form.email} onChange={(e) => cambiar('email', e.target.value)} onBlur={() => setTocado((t) => ({ ...t, email: true }))} disabled={enviando} />
        </Campo>
        <Campo etiqueta="Instagram">
          <div className="flex items-end gap-1">
            <span className="border-b border-[var(--pv-linea)] py-2 text-[20px] leading-tight text-[var(--pv-ceniza)]">@</span>
            <input className={`${LINEA} border-[var(--pv-linea)] focus:border-[var(--pv-azul)]`} type="text" name="instagram" autoComplete="off" autoCapitalize="none" autoCorrect="off" value={form.instagram} onChange={(e) => cambiar('instagram', e.target.value.replace(/^@+/, '').replace(/\s/g, ''))} disabled={enviando} />
          </div>
        </Campo>
        <Campo etiqueta="Provincia">
          <div className="relative">
            <select className={`${LINEA} border-[var(--pv-linea)] focus:border-[var(--pv-azul)] pr-8`} name="provincia" required value={form.provincia} onChange={(e) => cambiar('provincia', e.target.value)} disabled={enviando}>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p} className="bg-[#0d0d0d] text-[#f2efe9]">{p}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute bottom-3 right-0 text-[var(--pv-ceniza)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M5 9l7 7 7-7" />
            </svg>
          </div>
        </Campo>
        <Campo etiqueta="Localidad">
          <input className={`${LINEA} border-[var(--pv-linea)] focus:border-[var(--pv-azul)]`} type="text" name="localidad" autoComplete="off" autoCapitalize="words" value={form.localidad} onChange={(e) => cambiar('localidad', e.target.value)} disabled={enviando} />
        </Campo>

        {/* CARGADOS EN ESTE DISPOSITIVO */}
        {historial.length > 0 && (
          <section className="mt-10 border-t border-[var(--pv-linea)] pt-6">
            <span className={`${ETIQUETA} mb-4`}>Cargados en este dispositivo</span>
            <ul>
              {historial.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-3 border-b border-[var(--pv-linea)] py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.foto} alt="" className="h-10 w-10 shrink-0 object-cover" style={{ borderRadius: '50%' }} />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{c.nombre} {c.apellido}</span>
                  <span className="font-[family-name:var(--pv-mono)] text-[10px] tracking-[0.2em] text-[var(--pv-ceniza)]">{horaCorta(c.hora)}</span>
                  <button type="button" onClick={() => void darDeBaja(c.id)} aria-label={`Dar de baja a ${c.nombre} ${c.apellido}`} className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--pv-ceniza)] transition-colors hover:text-[var(--pv-rojo)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                      <path d="M5 5l14 14M19 5L5 19" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            {errorBaja && <p role="alert" className="mt-3 text-[11px] text-[var(--pv-rojo)]">{errorBaja}</p>}
          </section>
        )}
      </main>

      {/* ERROR DE ENVÍO: arriba del botón, con el motivo real */}
      {errorEnvio && (
        <div role="alert" className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-[var(--pv-rojo)] bg-[#1a0a0b] px-4 py-3 text-[13px] leading-snug text-[var(--pv-rojo)]">
          {errorEnvio}
        </div>
      )}

      {/* BOTÓN */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-[var(--pv-azul)] pb-[env(safe-area-inset-bottom)]">
        <button type="button" onClick={() => void enviar()} disabled={!valido || enviando} className="block h-14 w-full font-[family-name:var(--pv-mono)] text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--pv-hueso)] disabled:cursor-default disabled:opacity-40">
          {enviando ? 'Enviando…' : 'Registrar'}
        </button>
      </div>

      {/* CONFIRMACIÓN */}
      {estado === 'listo' && ultimo && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-[var(--pv-negro)] px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ultimo.foto} alt="" className="mb-8 h-[120px] w-[120px] object-cover" style={{ borderRadius: '50%' }} />
          <h1 className="mb-3 text-[32px] font-extrabold leading-tight tracking-[-0.02em]">Listo, {ultimo.nombre}.</h1>
          <p className="mb-10 text-[15px] text-[var(--pv-ceniza)]">Ya estás participando. Te vamos a contactar.</p>
          <button type="button" onClick={limpiar} className="border border-[var(--pv-hueso)] px-8 py-4 font-[family-name:var(--pv-mono)] text-[12px] uppercase tracking-[0.3em] text-[var(--pv-hueso)]">
            Cargar otro
          </button>
        </div>
      )}
    </>
  );
}
