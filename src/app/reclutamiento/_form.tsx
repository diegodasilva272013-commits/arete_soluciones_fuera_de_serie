'use client';

import { useRef, useState } from 'react';

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
const MAX_VIDEO_MB_ORIGINAL = 300; // límite razonable del archivo original, antes de comprimir

async function putSigned(uploadUrl: string, body: Blob | File, contentType: string, onProgress?: (pct: number) => void) {
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
  const fotoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [edad, setEdad] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [motivo, setMotivo] = useState('');
  const [motivacion, setMotivacion] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [website, setWebsite] = useState(''); // honeypot

  const [paso, setPaso] = useState<Paso>('idle');
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

    if (!foto) { setError('Subí una foto tuya'); return; }
    if (!video) { setError('Subí tu video de presentación'); return; }

    try {
      // 1. Crear la postulación con los datos de texto.
      setPaso('guardando');
      const createRes = await fetch('/api/reclutamiento/postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre, apellido, email,
          edad: Number(edad),
          experiencia, motivo, motivacion,
          website,
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error ?? 'No se pudo guardar la postulación');
      const id = created.id as string;

      // 2. Subir la foto directo a Storage.
      setPaso('subiendo_foto');
      setProgreso(0);
      const fotoUrlRes = await fetch(`/api/reclutamiento/${id}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'foto', size: foto.size, contentType: foto.type }),
      });
      const fotoUrlData = await fotoUrlRes.json();
      if (!fotoUrlRes.ok) throw new Error(fotoUrlData.error ?? 'No se pudo subir la foto');
      await putSigned(fotoUrlData.uploadUrl, foto, foto.type, setProgreso);

      // 3. Comprimir el video en el browser (mismo pipeline que usa el
      //    resto de la app para grabaciones) — evita subir archivos
      //    enormes y deja el video listo para reproducirse al toque.
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
      await ffmpeg.exec([
        '-i', 'input',
        '-vf', 'scale=-2:720',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '26',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4',
      ]);
      const outputData = await ffmpeg.readFile('output.mp4');
      const videoBlob = new Blob([outputData as unknown as BlobPart], { type: 'video/mp4' });
      await ffmpeg.deleteFile('input');
      await ffmpeg.deleteFile('output.mp4');

      // 4. Subir el video comprimido directo a Storage.
      setPaso('subiendo_video');
      setProgreso(0);
      const videoUrlRes = await fetch(`/api/reclutamiento/${id}/upload-url`, {
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
      <div className="rounded-2xl border border-brand-gold/25 bg-brand-surface/70 p-10 text-center">
        <p className="text-2xl font-semibold text-brand-text">¡Postulación recibida!</p>
        <p className="mt-3 text-sm text-brand-muted">
          Revisamos tu video y tu perfil. Si hay match, te contactamos por el email que dejaste.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — invisible para una persona, un bot que rellena todo el DOM sí lo completa */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre *">
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} disabled={procesando} />
        </Field>
        <Field label="Apellido *">
          <input required value={apellido} onChange={(e) => setApellido(e.target.value)} className={inputCls} disabled={procesando} />
        </Field>
        <Field label="Email *">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} disabled={procesando} />
        </Field>
        <Field label="Edad *">
          <input required type="number" min={16} max={90} value={edad} onChange={(e) => setEdad(e.target.value)} className={inputCls} disabled={procesando} />
        </Field>
      </div>

      <Field label="Experiencia previa (ventas, atención al cliente, lo que sea relevante)">
        <textarea rows={3} value={experiencia} onChange={(e) => setExperiencia(e.target.value)} className={inputCls} disabled={procesando} />
      </Field>

      <Field label="¿Por qué querés ser parte del equipo? *">
        <textarea required minLength={10} rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputCls} disabled={procesando} />
      </Field>

      <Field label="¿Qué te motiva a tomar este puesto? *">
        <textarea required minLength={10} rows={3} value={motivacion} onChange={(e) => setMotivacion(e.target.value)} className={inputCls} disabled={procesando} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
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
          hint="Contanos quién sos y por qué encajás. Grabate hablando a cámara — nada de guiones leídos ni videos armados con IA: un video genérico queda automáticamente descartado."
          inputRef={videoRef}
          accept="video/*"
          file={video}
          onChange={onVideo}
          disabled={procesando}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-400">{error}</div>
      )}

      {procesando && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-brand-muted">
            <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold" />
            {PASO_MSG[paso]}
          </div>
          {progreso > 0 && (
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-surface">
              <div className="h-full rounded-full bg-brand-gold transition-all duration-200" style={{ width: `${progreso}%` }} />
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={procesando}
        className="w-full rounded-xl bg-brand-gold py-3.5 text-sm font-semibold text-white transition hover:bg-brand-goldSoft disabled:opacity-40"
      >
        {procesando ? 'Enviando...' : 'Postularme'}
      </button>
    </form>
  );
}

const inputCls =
  'w-full rounded-lg border border-brand-gold/20 bg-brand-surface px-3.5 py-2.5 text-sm text-brand-text placeholder-brand-muted/50 outline-none transition focus:border-brand-gold/60 disabled:opacity-50';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-brand-muted">{label}</span>
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
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-brand-muted">{label}</span>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition ${
          file ? 'border-emerald-700/50 bg-emerald-950/10' : 'border-brand-gold/20 hover:border-brand-gold/40'
        } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" disabled={disabled} />
        {file ? (
          <p className="text-sm text-emerald-400">{file.name}</p>
        ) : (
          <p className="text-sm text-brand-muted">Click para elegir archivo</p>
        )}
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-brand-muted/70">{hint}</p>
    </label>
  );
}
