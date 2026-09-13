'use client';

import { useRef, useState } from 'react';
import c from '../empresa/corp.module.css';
import s from './recl.module.css';

type Paso =
  | 'idle'
  | 'guardando'
  | 'subiendo_foto'
  | 'comprimiendo_video'
  | 'subiendo_video'
  | 'listo'
  | 'error';

const PASO_MSG: Record<Paso, string> = {
  idle: '',
  guardando: 'Guardando tus datos...',
  subiendo_foto: 'Subiendo tu foto...',
  comprimiendo_video: 'Procesando tu video...',
  subiendo_video: 'Subiendo tu video...',
  listo: '¡Listo!',
  error: '',
};

const FOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/webp': 'image/webp',
};
const MAX_FOTO_MB = 5;
const MAX_VIDEO_MB_ORIGINAL = 300;

async function putSigned(
  uploadUrl: string,
  body: Blob | File,
  contentType: string,
  onProgress?: (pct: number) => void,
) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`Falló la subida (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(body);
  });
}

export function ReclutamientoForm() {
  const fotoRef  = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [nombre,     setNombre]     = useState('');
  const [apellido,   setApellido]   = useState('');
  const [email,      setEmail]      = useState('');
  const [edad,       setEdad]       = useState('');
  const [experiencia,setExperiencia]= useState('');
  const [motivo,     setMotivo]     = useState('');
  const [motivacion, setMotivacion] = useState('');
  const [foto,       setFoto]       = useState<File | null>(null);
  const [video,      setVideo]      = useState<File | null>(null);
  const [website,    setWebsite]    = useState(''); // honeypot

  const [paso,    setPaso]    = useState<Paso>('idle');
  const [progreso,setProgreso]= useState(0);
  const [error,   setError]   = useState<string | null>(null);

  const procesando = !['idle', 'listo', 'error'].includes(paso);

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!FOTO_TYPES[f.type]) { setError('La foto tiene que ser JPG, PNG o WEBP'); return; }
    if (f.size > MAX_FOTO_MB * 1024 * 1024) { setError(`La foto no puede pesar más de ${MAX_FOTO_MB} MB`); return; }
    setError(null);
    setFoto(f);
  }

  function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { setError('El archivo tiene que ser un video'); return; }
    if (f.size > MAX_VIDEO_MB_ORIGINAL * 1024 * 1024) { setError(`El video no puede pesar más de ${MAX_VIDEO_MB_ORIGINAL} MB`); return; }
    setError(null);
    setVideo(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!foto)  { setError('Subí una foto tuya'); return; }
    if (!video) { setError('Subí tu video de presentación'); return; }

    try {
      // 1. Crear la postulación con los datos de texto.
      setPaso('guardando');
      const createRes = await fetch('/api/reclutamiento/postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, email, edad: Number(edad), experiencia, motivo, motivacion, website }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error ?? 'No se pudo guardar la postulación');
      const id = created.id as string;

      // 2. Subir la foto.
      setPaso('subiendo_foto');
      setProgreso(0);
      const fotoUrlRes  = await fetch(`/api/reclutamiento/${id}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'foto', size: foto.size, contentType: foto.type }),
      });
      const fotoUrlData = await fotoUrlRes.json();
      if (!fotoUrlRes.ok) throw new Error(fotoUrlData.error ?? 'No se pudo subir la foto');
      await putSigned(fotoUrlData.uploadUrl, foto, foto.type, setProgreso);

      // 3. Comprimir el video en el browser.
      setPaso('comprimiendo_video');
      setProgreso(0);
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm', 'application/wasm'),
      });
      ffmpeg.on('progress', ({ progress }: { progress: number }) => setProgreso(Math.round(progress * 100)));
      await ffmpeg.writeFile('input', await fetchFile(video));
      await ffmpeg.exec(['-i','input','-vf','scale=-2:720','-c:v','libx264','-preset','fast','-crf','26','-c:a','aac','-b:a','128k','-movflags','+faststart','output.mp4']);
      const outputData = await ffmpeg.readFile('output.mp4');
      const videoBlob  = new Blob([outputData as unknown as BlobPart], { type: 'video/mp4' });
      await ffmpeg.deleteFile('input');
      await ffmpeg.deleteFile('output.mp4');

      // 4. Subir el video comprimido.
      setPaso('subiendo_video');
      setProgreso(0);
      const videoUrlRes  = await fetch(`/api/reclutamiento/${id}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'video' }),
      });
      const videoUrlData = await videoUrlRes.json();
      if (!videoUrlRes.ok) throw new Error(videoUrlData.error ?? 'No se pudo subir el video');
      await putSigned(videoUrlData.uploadUrl, videoBlob, 'video/mp4', setProgreso);

      setPaso('listo');
    } catch (err: any) {
      setPaso('error');
      setError(err.message ?? 'Algo salió mal. Probá de nuevo.');
    }
  }

  if (paso === 'listo') {
    return (
      <div
        style={{
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid rgba(47,123,246,.2)',
          background: 'rgba(47,123,246,.04)',
        }}
      >
        <p className={c.sectionTitle} style={{ fontSize: '26px', margin: '0 0 12px' }}>
          ¡Postulación recibida!
        </p>
        <p className={c.sectionSub} style={{ margin: 0 }}>
          Revisamos tu video y tu perfil. Si hay match, te contactamos por el email que dejaste.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Honeypot */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

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

      <div className={s.formGrid}>
        <FileField
          label="Tu foto *"
          hint="JPG, PNG o WEBP — hasta 5 MB"
          inputRef={fotoRef}
          accept="image/jpeg,image/png,image/webp"
          file={foto}
          onChange={onFoto}
          disabled={procesando}
        />
        <FileField
          label="Tu video de presentación *"
          hint="Grabate hablando a cámara. Un video genérico queda descartado automáticamente."
          inputRef={videoRef}
          accept="video/*"
          file={video}
          onChange={onVideo}
          disabled={procesando}
        />
      </div>

      {error && (
        <div
          style={{
            border: '1px solid rgba(239,68,68,.3)',
            background: 'rgba(239,68,68,.06)',
            padding: '14px 18px',
            fontSize: '14px',
            color: 'rgba(239,68,68,.85)',
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      {procesando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className={s.progressRow}>
            <span className={s.spinner} />
            {PASO_MSG[paso]}
          </div>
          {progreso > 0 && (
            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${progreso}%` }} />
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={procesando}
        className={c.btn}
        style={{ width: '100%', justifyContent: 'center' }}
      >
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

function FileField({
  label, hint, inputRef, accept, file, onChange, disabled,
}: {
  label: string;
  hint: string;
  inputRef: React.RefObject<HTMLInputElement>;
  accept: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span className={c.formLabel}>{label}</span>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={`${s.fileZone} ${file ? s.fileZoneActive : ''}`}
        style={disabled ? { opacity: 0.45, pointerEvents: 'none' } : {}}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} style={{ display: 'none' }} disabled={disabled} />
        <p className={s.fileZoneLabel}>
          {file ? file.name : 'Click para elegir archivo'}
        </p>
      </div>
      <p className={s.fileHint}>{hint}</p>
    </label>
  );
}
