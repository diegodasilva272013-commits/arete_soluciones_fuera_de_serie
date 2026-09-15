'use client';

import { useRef, useState, useEffect } from 'react';
import { Upload } from 'tus-js-client';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Detecta browsers de apps sociales que bloquean acceso a cámara y uploads. */
function isSocialBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|musical_ly|TikTok|Twitter|LinkedInApp/.test(ua);
}

type Paso = 'idle' | 'guardando' | 'subiendo_foto' | 'subiendo_video' | 'listo' | 'error';

const PASO_MSG: Record<Paso, string> = {
  idle:          '',
  guardando:     'Guardando tus datos...',
  subiendo_foto: 'Subiendo tu foto...',
  subiendo_video:'Subiendo tu video...',
  listo:         '¡Listo!',
  error:         '',
};

const MAX_FOTO_MB  = 10;
const MAX_VIDEO_MB = 200; // TUS sube en chunks — nunca hay gateway timeout

/** Foto: fetch PUT directo (archivo pequeño, sin problema de timeout). */
async function uploadFoto(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Error al subir la foto (${res.status})${txt ? ': ' + txt : ''}`);
  }
}

/**
 * Video: TUS resumable upload en chunks de 6 MB.
 *
 * Flujo probado manualmente contra Supabase:
 *  1. Servidor crea la sesión TUS con service role key → devuelve sessionUrl
 *  2. Cliente usa uploadUrl (sesión ya creada) + anon key para los PATCHes
 *  PATCH → 204, Upload-Offset avanza — confirmado sin necesitar RLS policies.
 */
async function uploadVideoTus(
  sessionUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      uploadUrl: sessionUrl,           // sesión ya creada por el servidor
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      onError: (err: Error) => reject(new Error(`Error al subir el video: ${err.message}`)),
      onProgress: (uploaded: number, total: number) => {
        if (total > 0) onProgress(Math.round((uploaded / total) * 100));
      },
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}

export function ReclutamientoForm() {
  const fotoRef  = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [nombre,      setNombre]      = useState('');
  const [apellido,    setApellido]    = useState('');
  const [email,       setEmail]       = useState('');
  const [telefono,    setTelefono]    = useState('');
  const [edad,        setEdad]        = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [motivo,      setMotivo]      = useState('');
  const [motivacion,  setMotivacion]  = useState('');
  const [foto,        setFoto]        = useState<File | null>(null);
  const [video,       setVideo]       = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [paso,     setPaso]     = useState<Paso>('idle');
  const [progreso, setProgreso] = useState(0);
  const [error,    setError]    = useState<string | null>(null);

  const procesando = !['idle', 'listo', 'error'].includes(paso);
  const [socialBrowser, setSocialBrowser] = useState(false);
  useEffect(() => { setSocialBrowser(isSocialBrowser()); }, []);

  // Limpia la URL de objeto de la foto al desmontar
  useEffect(() => {
    return () => { if (fotoPreview) URL.revokeObjectURL(fotoPreview); };
  }, [fotoPreview]);

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('El archivo tiene que ser una imagen'); return; }
    if (f.size > MAX_FOTO_MB * 1024 * 1024) { setError(`La foto no puede pesar más de ${MAX_FOTO_MB} MB`); return; }
    setError(null);
    setFoto(f);
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoPreview(URL.createObjectURL(f));
  }

  function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('El archivo tiene que ser un video'); return; }
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
      const mb = Math.round(f.size / 1024 / 1024);
      setError(`El video pesa ${mb} MB y el límite es ${MAX_VIDEO_MB} MB. Grabalo más corto (1-2 minutos alcanza).`);
      return;
    }
    setError(null);
    setVideo(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!foto)  { setError('Sacate una foto primero'); return; }
    if (!video) { setError('Grabá tu video de presentación primero'); return; }

    try {
      // 1. Crear la postulación (datos de texto)
      setPaso('guardando');
      const createRes = await fetch('/api/reclutamiento/postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, email, telefono, edad: Number(edad), experiencia, motivo, motivacion }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error ?? 'No se pudo guardar la postulación');
      const id = created.id as string;

      // 2. Subir la foto (fetch PUT — archivo chico, sin timeout)
      setPaso('subiendo_foto');
      setProgreso(0);
      const fotoUrlRes = await fetch(`/api/reclutamiento/${id}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'foto', size: foto.size, contentType: foto.type }),
      });
      const fotoData = await fotoUrlRes.json();
      if (!fotoUrlRes.ok) throw new Error(fotoData.error ?? 'No se pudo subir la foto');
      await uploadFoto(fotoData.uploadUrl, foto);
      setProgreso(100);

      // 3. Subir el video con TUS resumable (chunks de 6 MB, sin timeout)
      //    Servidor crea la sesión TUS con service role key → retorna sessionUrl
      //    Cliente PATCHea con anon key — probado: PATCH → 204, funciona.
      setPaso('subiendo_video');
      setProgreso(0);
      const tusInitRes = await fetch(`/api/reclutamiento/${id}/tus-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'video', size: video.size, contentType: video.type }),
      });
      const tusData = await tusInitRes.json();
      if (!tusInitRes.ok) throw new Error(tusData.error ?? 'No se pudo iniciar la subida del video');

      await uploadVideoTus(tusData.sessionUrl, video, setProgreso);

      // Confirmar que el video se subió completo
      await fetch(`/api/reclutamiento/${id}/confirm-video`, { method: 'POST' });

      setPaso('listo');
    } catch (err: any) {
      setPaso('error');
      setError(err.message ?? 'Algo salió mal. Probá de nuevo.');
    }
  }

  /* ── Estados finales ── */
  if (paso === 'listo') {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px solid rgba(47,123,246,.2)', background: 'rgba(47,123,246,.04)' }}>
        <p className={c.sectionTitle} style={{ fontSize: '26px', margin: '0 0 12px' }}>¡Postulación recibida!</p>
        <p className={c.sectionSub} style={{ margin: 0 }}>Revisamos tu video y tu perfil. Si hay match, te contactamos por el email que dejaste.</p>
      </div>
    );
  }

  if (socialBrowser) {
    return (
      <div style={{ border: '1px solid rgba(251,191,36,.35)', background: 'rgba(251,191,36,.06)', borderRadius: '12px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: '16px', color: '#FCD34D' }}>⚠️ Abrí esta página en Chrome o Safari</p>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'rgba(242,239,233,.7)' }}>El browser de Facebook no permite acceder a la cámara ni subir archivos. Copiá el link y abrilo en tu navegador.</p>
        <button
          onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); }}
          style={{ background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.4)', borderRadius: '8px', padding: '10px 18px', color: '#FCD34D', fontFamily: 'var(--f-mono)', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          COPIAR LINK
        </button>
      </div>
    );
  }

  /* ── Formulario ── */
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className={s.formGrid}>
        <Field label="Nombre *">
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={c.formInput} disabled={procesando} />
        </Field>
        <Field label="Apellido *">
          <input required value={apellido} onChange={(e) => setApellido(e.target.value)} className={c.formInput} disabled={procesando} />
        </Field>
        <Field label="Email *">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={c.formInput} disabled={procesando} />
        </Field>
        <Field label="Teléfono / WhatsApp *">
          <input required type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={c.formInput} disabled={procesando} placeholder="+54 9 11 1234-5678" />
        </Field>
        <Field label="Edad *">
          <input required type="number" min={16} max={90} value={edad} onChange={(e) => setEdad(e.target.value)} className={c.formInput} disabled={procesando} />
        </Field>
      </div>

      <Field label="Experiencia previa (ventas, atención al cliente, lo que sea relevante)">
        <textarea rows={3} value={experiencia} onChange={(e) => setExperiencia(e.target.value)} className={`${c.formInput} ${c.formTextarea}`} disabled={procesando} style={{ minHeight: 'auto' }} />
      </Field>
      <Field label="¿Por qué querés ser parte del equipo? *">
        <textarea required minLength={10} rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} className={`${c.formInput} ${c.formTextarea}`} disabled={procesando} style={{ minHeight: 'auto' }} />
      </Field>
      <Field label="¿Qué te motiva a tomar este puesto? *">
        <textarea required minLength={10} rows={3} value={motivacion} onChange={(e) => setMotivacion(e.target.value)} className={`${c.formInput} ${c.formTextarea}`} disabled={procesando} style={{ minHeight: 'auto' }} />
      </Field>

      {/* Cámara */}
      <div className={s.formGrid}>
        {/* Foto — abre cámara frontal directamente en mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className={c.formLabel}>Tu foto *</span>
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={onFoto}
            style={{ display: 'none' }}
            disabled={procesando}
          />
          {fotoPreview ? (
            <div style={{ position: 'relative' }}>
              <img
                src={fotoPreview}
                alt="Tu foto"
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid rgba(47,123,246,.35)', display: 'block' }}
              />
              {!procesando && (
                <button
                  type="button"
                  onClick={() => fotoRef.current?.click()}
                  style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,.65)', border: '1px solid rgba(255,255,255,.2)', borderRadius: '7px', padding: '6px 14px', color: '#fff', fontSize: '12px', cursor: 'pointer', backdropFilter: 'blur(6px)' }}
                >
                  📷 Repetir
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fotoRef.current?.click()}
              disabled={procesando}
              style={{ width: '100%', padding: '28px 20px', background: 'rgba(47,123,246,.07)', border: '1.5px dashed rgba(47,123,246,.4)', borderRadius: '10px', color: '#2F7BF6', fontSize: '16px', fontFamily: 'var(--f-display)', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              📷
              <span>Sacar foto</span>
            </button>
          )}
          <p className={s.fileHint}>Mirá a cámara y sacate una selfie clara</p>
        </div>

        {/* Video — abre cámara frontal para grabar directamente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className={c.formLabel}>Tu video *</span>
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            capture="user"
            onChange={onVideo}
            style={{ display: 'none' }}
            disabled={procesando}
          />
          {video ? (
            <div
              onClick={() => !procesando && videoRef.current?.click()}
              style={{ width: '100%', padding: '28px 20px', background: 'rgba(16,185,129,.07)', border: '1.5px solid rgba(16,185,129,.35)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: procesando ? 'default' : 'pointer', opacity: procesando ? 0.6 : 1 }}
            >
              <span style={{ fontSize: '28px' }}>✅</span>
              <span style={{ fontSize: '13px', color: 'rgba(242,239,233,.7)', textAlign: 'center', wordBreak: 'break-word' }}>{video.name}</span>
              <span style={{ fontSize: '11px', color: 'rgba(16,185,129,.7)', fontFamily: 'var(--f-mono)' }}>{Math.round(video.size / 1024 / 1024)} MB</span>
              {!procesando && <span style={{ fontSize: '11px', color: 'rgba(242,239,233,.35)' }}>Tocá para grabar de nuevo</span>}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              disabled={procesando}
              style={{ width: '100%', padding: '28px 20px', background: 'rgba(47,123,246,.07)', border: '1.5px dashed rgba(47,123,246,.4)', borderRadius: '10px', color: '#2F7BF6', fontSize: '16px', fontFamily: 'var(--f-display)', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              🎥
              <span>Grabar video</span>
            </button>
          )}
          <p className={s.fileHint}>Presentate en 1-2 minutos mirando a cámara. Un video genérico queda descartado automáticamente.</p>
        </div>
      </div>

      {error && (
        <div style={{ border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)', padding: '14px 18px', fontSize: '14px', color: 'rgba(239,68,68,.85)', lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {procesando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className={s.progressRow}>
            <span className={s.spinner} />
            <span>
              {PASO_MSG[paso]}
              {paso === 'subiendo_video' && progreso > 0 ? ` ${progreso}%` : ''}
            </span>
          </div>
          {(paso === 'subiendo_foto' || paso === 'subiendo_video') && (
            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${progreso}%` }} />
            </div>
          )}
        </div>
      )}

      <button type="submit" disabled={procesando} className={c.btn} style={{ width: '100%', justifyContent: 'center' }}>
        {procesando ? 'Enviando...' : 'Postularme'}
      </button>
    </form>
  );
}

/* ── Sub-componentes ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span className={c.formLabel}>{label}</span>
      {children}
    </label>
  );
}
