'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  Image as ImageIcon,
  Video,
  Youtube,
  Type,
  Loader2,
  X,
  FileText,
  Mic,
  Square,
  Upload,
} from 'lucide-react';
import { COMMUNITY_CATEGORIES } from '@/constants/categories';
import { createPostAction } from '../actions';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const BUCKET = 'community-media';
const MAX_BYTES = 50 * 1024 * 1024;

async function uploadFileDirect(
  file: File
): Promise<{ url: string; type: string; error?: string }> {
  if (file.size > MAX_BYTES) return { url: '', type: '', error: 'El archivo supera 50 MB.' };

  const supabase = createSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: '', type: '', error: 'Sesión expirada. Recargá la página.' };

  const type = file.type.startsWith('image/') ? 'image'
    : file.type.startsWith('video/') ? 'video'
    : file.type.startsWith('audio/') ? 'audio'
    : 'document';

  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase();
  const path = `${user.id}/posts/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (upErr) return { url: '', type, error: `No se pudo subir el archivo: ${upErr.message}` };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, type };
}

type Tab = 'text' | 'image' | 'video' | 'document' | 'youtube' | 'audio';

const tabs: {
  id: Tab;
  label: string;
  icon: typeof Type;
  accept?: string;
}[] = [
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'image', label: 'Foto', icon: ImageIcon, accept: 'image/*' },
  { id: 'video', label: 'Video', icon: Video, accept: 'video/*' },
  { id: 'audio', label: 'Audio', icon: Mic, accept: 'audio/*' },
  {
    id: 'document',
    label: 'Documento',
    icon: FileText,
    accept:
      '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf',
  },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
];

function fmtSecs(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function PostComposer({ userName }: { userName: string }) {
  const [tab, setTab] = useState<Tab>('text');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(COMMUNITY_CATEGORIES[0]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // ── Audio recording state ────────────────────────────────────────────────
  const [recording, setRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startRecording() {
    if (!navigator.mediaDevices) { setError('Tu navegador no soporta grabación de audio.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSecs(0);
      timerRef.current = setInterval(() => setRecordingSecs((s) => s + 1), 1000);
    }).catch(() => setError('No se pudo acceder al micrófono. Verificá los permisos.'));
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function discardAudio() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingSecs(0);
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function wrapSelection(prefix: string, suffix: string) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const before = content.slice(0, start);
    const sel = content.slice(start, end);
    const after = content.slice(end);
    const next = `${before}${prefix}${sel || 'texto'}${suffix}${after}`;
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length + (sel || 'texto').length;
      el.setSelectionRange(pos, pos);
    });
  }

  function insertAtLineStart(token: string) {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const next = `${content.slice(0, lineStart)}${token}${content.slice(lineStart)}`;
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function reset() {
    setContent('');
    setTitle('');
    setYoutubeUrl('');
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    setTab('text');
    if (fileRef.current) fileRef.current.value = '';
    discardAudio();
  }

  function handleFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    // if uploading audio file, clear any recorded blob
    if (f && f.type.startsWith('audio/')) {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      setAudioBlob(null);
      setAudioPreviewUrl(null);
    }
  }

  function selectTab(t: Tab) {
    setError(null);
    setTab(t);
    if (t !== 'image' && t !== 'video' && t !== 'document' && t !== 'audio') handleFile(null);
    if (t !== 'youtube') setYoutubeUrl('');
    // discard any recording when switching away from audio
    if (t !== 'audio') discardAudio();
    if (t === 'image' || t === 'video' || t === 'document') {
      const acc = tabs.find((x) => x.id === t)?.accept ?? '';
      if (fileRef.current) {
        fileRef.current.value = '';
        fileRef.current.accept = acc;
        setTimeout(() => fileRef.current?.click(), 0);
      }
    }
    // audio tab: don't auto-open picker — show recording UI instead
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    let uploadedUrl = '';
    let uploadedType = '';

    if (tab === 'audio') {
      // priority: recorded blob, then uploaded file
      const audioFile = audioBlob
        ? new File([audioBlob], `nota-de-voz-${Date.now()}.webm`, { type: 'audio/webm' })
        : file;
      if (audioFile) {
        setUploading(true);
        const result = await uploadFileDirect(audioFile).catch((err) => ({
          url: '', type: '', error: `Error inesperado: ${err?.message ?? 'desconocido'}`,
        }));
        setUploading(false);
        if (result.error) { setError(result.error); return; }
        uploadedUrl = result.url;
        uploadedType = 'audio';
      }
    } else if ((tab === 'image' || tab === 'video' || tab === 'document') && file) {
      setUploading(true);
      const result = await uploadFileDirect(file).catch((err) => ({
        url: '', type: '', error: `Error inesperado: ${err?.message ?? 'desconocido'}`,
      }));
      setUploading(false);
      if (result.error) { setError(result.error); return; }
      uploadedUrl = result.url;
      uploadedType = result.type;
    }

    const fd = new FormData();
    fd.set('content', content);
    fd.set('title', title);
    fd.set('category', category);
    if (tab === 'youtube') fd.set('youtube_url', youtubeUrl);
    if (uploadedUrl) {
      fd.set('media_url', uploadedUrl);
      fd.set('media_type', uploadedType);
    }

    startTransition(async () => {
      try {
        const res = await createPostAction({}, fd);
        if (res.error) setError(res.error);
        else reset();
      } catch (err: any) {
        setError(`Error al publicar: ${err?.message ?? 'intentá de nuevo'}`);
      }
    });
  }

  const hasAudio = !!(audioBlob || (tab === 'audio' && file));
  const activeAudioUrl = audioPreviewUrl ?? (tab === 'audio' && file && preview ? preview : null);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-[#0c0c0c] p-5 shadow-[0_20px_60px_-30px_rgba(212,175,55,0.25)]"
    >
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,175,55,0.35)] bg-[#111] text-sm font-semibold text-brand-gold">
          {userName.slice(0, 1).toUpperCase()}
        </div>
        <p className="text-sm text-brand-muted">
          ¿Qué quieres compartir hoy,{' '}
          <span className="text-brand-text">{userName.split(' ')[0]}</span>?
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(t.id)}
              className={
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ' +
                (active
                  ? 'border border-brand-gold bg-[#1a1408] text-brand-gold'
                  : 'border border-[rgba(212,175,55,0.18)] text-brand-muted hover:border-[rgba(212,175,55,0.4)] hover:text-brand-text')
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (opcional)"
          className="w-full rounded-md border border-[rgba(212,175,55,0.18)] bg-[#0a0a0a] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-gold focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-[rgba(212,175,55,0.18)] bg-[#0a0a0a] px-3 py-2 text-sm text-brand-text focus:border-brand-gold focus:outline-none"
        >
          {COMMUNITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder={
          tab === 'youtube'
            ? 'Cuéntales por qué deben verlo…'
            : tab === 'audio'
            ? 'Descripción del audio (opcional)…'
            : 'Comparte tu experiencia, resultados o pregunta… (soporta **negrita**, *cursiva*, `código`, [link](url) y listas con -)'
        }
        className="mt-3 w-full resize-none rounded-md border border-[rgba(212,175,55,0.18)] bg-[#0a0a0a] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-gold focus:outline-none"
      />

      <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-brand-muted">
        <span className="mr-1">Formato:</span>
        {[
          { label: 'B', wrap: '**' },
          { label: 'I', wrap: '*' },
          { label: '`', wrap: '`' },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => wrapSelection(b.wrap, b.wrap)}
            className="rounded border border-white/10 px-2 py-0.5 hover:border-brand-gold hover:text-brand-gold"
            title={`Envolver con ${b.wrap}`}
          >
            <span className={b.label === 'B' ? 'font-bold' : b.label === 'I' ? 'italic' : 'font-mono'}>
              {b.label}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const url = prompt('URL (https://…)');
            if (!url) return;
            wrapSelection('[', `](${url})`);
          }}
          className="rounded border border-white/10 px-2 py-0.5 hover:border-brand-gold hover:text-brand-gold"
          title="Insertar enlace"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => insertAtLineStart('- ')}
          className="rounded border border-white/10 px-2 py-0.5 hover:border-brand-gold hover:text-brand-gold"
          title="Lista"
        >
          • lista
        </button>
      </div>

      {tab === 'youtube' && (
        <input
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          className="mt-3 w-full rounded-md border border-[rgba(212,175,55,0.18)] bg-[#0a0a0a] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-gold focus:outline-none"
        />
      )}

      {/* ── Audio tab UI ── */}
      {tab === 'audio' && (
        <div className="mt-3 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#0a0a0a] p-4">
          {!hasAudio ? (
            <div className="flex flex-col items-center gap-3">
              {/* Record button */}
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={
                  'flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all ' +
                  (recording
                    ? 'animate-pulse border-red-500 bg-red-500/20 text-red-400'
                    : 'border-brand-gold bg-[#1a1408] text-brand-gold hover:bg-[#221b0a]')
                }
              >
                {recording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <p className="text-xs text-brand-muted">
                {recording ? (
                  <span className="font-mono text-red-400">{fmtSecs(recordingSecs)} — grabando…</span>
                ) : (
                  'Grabá una nota de voz'
                )}
              </p>
              {/* Alternative: upload audio file */}
              {!recording && (
                <button
                  type="button"
                  onClick={() => {
                    if (fileRef.current) {
                      fileRef.current.value = '';
                      fileRef.current.accept = 'audio/*';
                      fileRef.current.click();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-gold"
                >
                  <Upload className="h-3.5 w-3.5" />
                  o subí un archivo de audio
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <audio src={activeAudioUrl ?? undefined} controls className="w-full" />
              <div className="flex items-center justify-between text-xs text-brand-muted">
                <span>{audioBlob ? `Nota de voz · ${fmtSecs(recordingSecs)}` : file?.name}</span>
                <button
                  type="button"
                  onClick={discardAudio}
                  className="inline-flex items-center gap-1 hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" /> Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {file && (tab === 'image' || tab === 'video' || tab === 'document') && (
        <div className="relative mt-3 overflow-hidden rounded-lg border border-[rgba(212,175,55,0.2)]">
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1 text-brand-text hover:text-brand-gold"
            aria-label="Quitar"
          >
            <X className="h-4 w-4" />
          </button>
          {tab === 'image' && preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="max-h-80 w-full bg-[#050505] object-contain"
            />
          )}
          {tab === 'video' && preview && (
            <video src={preview} controls className="max-h-80 w-full bg-black" />
          )}
          {tab === 'document' && (
            <div className="flex items-center gap-3 bg-[#0a0a0a] px-4 py-3 text-sm text-brand-text">
              <FileText className="h-5 w-5 text-brand-gold" />
              <span className="truncate">{file.name}</span>
              <span className="ml-auto text-xs text-brand-muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="btn-gold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo archivo…</>
          ) : isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Publicando…</>
          ) : (
            'Publicar'
          )}
        </button>
      </div>
    </form>
  );
}
