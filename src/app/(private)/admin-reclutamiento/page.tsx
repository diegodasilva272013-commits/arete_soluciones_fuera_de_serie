'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  RefreshCw, AlertCircle, User, Mail,
  Calendar, Video, Camera, FileText, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Postulante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  edad: number;
  experiencia: string | null;
  motivo: string;
  motivacion: string;
  foto_path: string | null;
  video_path: string | null;
  foto_url: string | null;
  video_url: string | null;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EXPERIENCIA_LABELS: Record<string, string> = {
  ninguna:   'Sin experiencia',
  poca:      'Poca (<1 año)',
  media:     'Media (1-3 años)',
  bastante:  'Bastante (3-5 años)',
  mucha:     'Mucha (>5 años)',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(iso));
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ─── Card expandible por postulante ──────────────────────────────────────────

function PostulanteCard({ p, index }: { p: Postulante; index: number }) {
  const [open, setOpen] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const fullName = `${p.nombre} ${p.apellido}`;
  const initials = `${p.nombre[0]}${p.apellido[0]}`.toUpperCase();

  return (
    <div
      className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden transition-all"
      style={{ borderColor: open ? 'rgba(212,175,55,0.25)' : undefined }}
    >
      {/* ── Fila principal (siempre visible) ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/3 transition"
      >
        {/* Índice */}
        <span className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/5 text-[11px] font-bold text-white/30 shrink-0">
          {index + 1}
        </span>

        {/* Avatar/foto */}
        <div className="relative w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 overflow-hidden shrink-0">
          {p.foto_url && !imgErr ? (
            <Image
              src={p.foto_url}
              alt={fullName}
              fill
              className="object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-brand-gold">
              {initials}
            </span>
          )}
        </div>

        {/* Nombre + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{fullName}</p>
          <p className="text-xs text-white/40 truncate">{p.email}</p>
        </div>

        {/* Edad */}
        <span className="hidden sm:block text-xs text-white/30 shrink-0">{p.edad} años</span>

        {/* Experiencia badge */}
        <span className="hidden md:block rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/50 shrink-0 whitespace-nowrap">
          {EXPERIENCIA_LABELS[p.experiencia ?? ''] ?? p.experiencia ?? '—'}
        </span>

        {/* Media badges */}
        <div className="flex gap-1.5 shrink-0">
          {p.foto_url && (
            <span title="Tiene foto" className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Camera size={11} />
            </span>
          )}
          {p.video_url && (
            <span title="Tiene video" className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <Video size={11} />
            </span>
          )}
        </div>

        {/* Fecha */}
        <span className="hidden lg:block text-[10px] text-white/25 shrink-0">{timeAgo(p.created_at)}</span>

        {/* Chevron */}
        <span className="text-white/20 shrink-0">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* ── Detalle expandible ── */}
      {open && (
        <div className="border-t border-white/6 px-5 py-5 space-y-5">

          {/* Datos básicos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: User,     label: 'Nombre completo', value: fullName },
              { icon: Mail,     label: 'Email',           value: p.email  },
              { icon: Calendar, label: 'Edad',            value: `${p.edad} años` },
              { icon: FileText, label: 'Experiencia',     value: EXPERIENCIA_LABELS[p.experiencia ?? ''] ?? p.experiencia ?? 'No indicada' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white/3 border border-white/6 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-white/30">
                  <Icon size={11} />
                  <span className="text-[10px] uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-sm font-medium text-white leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Textos libres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/3 border border-white/6 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-white/30">¿Por qué querés ser parte del equipo?</p>
              <p className="text-sm text-white/80 leading-relaxed">{p.motivo}</p>
            </div>
            <div className="rounded-xl bg-white/3 border border-white/6 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-white/30">¿Qué te motiva a tomar este puesto?</p>
              <p className="text-sm text-white/80 leading-relaxed">{p.motivacion}</p>
            </div>
          </div>

          {/* Media */}
          {(p.foto_url || p.video_url) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Foto */}
              {p.foto_url ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/10">
                    <Camera size={12} className="text-amber-400" />
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/70">Foto de perfil</span>
                    <a
                      href={p.foto_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-amber-400/50 hover:text-amber-400 transition"
                      title="Abrir en nueva pestaña"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="relative h-48 sm:h-64 bg-black">
                    <Image
                      src={p.foto_url}
                      alt={`Foto de ${fullName}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/6 bg-white/2 flex items-center justify-center h-32 text-white/15">
                  <div className="text-center space-y-1">
                    <Camera size={20} className="mx-auto" />
                    <p className="text-xs">Sin foto</p>
                  </div>
                </div>
              )}

              {/* Video */}
              {p.video_url ? (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-blue-500/10">
                    <Video size={12} className="text-blue-400" />
                    <span className="text-[10px] uppercase tracking-wider text-blue-400/70">Video de presentación</span>
                    <a
                      href={p.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-blue-400/50 hover:text-blue-400 transition"
                      title="Abrir en nueva pestaña"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={p.video_url}
                    controls
                    playsInline
                    className="w-full max-h-64 bg-black"
                    preload="metadata"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-white/6 bg-white/2 flex items-center justify-center h-32 text-white/15">
                  <div className="text-center space-y-1">
                    <Video size={20} className="mx-auto" />
                    <p className="text-xs">Sin video</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer: fecha exacta */}
          <p className="text-[10px] text-white/20 text-right">
            Postulado el {formatDate(p.created_at)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminReclutamientoPage() {
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reclutamiento');
      if (res.status === 401) { setError('Sesión expirada. Recargá la página.'); return; }
      if (res.status === 403) { setError('Solo los administradores pueden ver esta sección.'); return; }
      if (!res.ok) throw new Error();
      setPostulantes(await res.json());
    } catch {
      setError('No se pudieron cargar los postulantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Totales para el header strip
  const total    = postulantes.length;
  const conFoto  = postulantes.filter(p => p.foto_url).length;
  const conVideo = postulantes.filter(p => p.video_url).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 pb-28">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest">Admin</p>
          <h1 className="text-2xl font-black text-white">Reclutamiento</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl bg-white/5 border border-white/8 p-2.5 text-white/40 hover:text-white transition disabled:opacity-30"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Strip de métricas ── */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Postulantes', value: total,    color: 'text-white'       },
            { label: 'Con foto',    value: conFoto,  color: 'text-amber-400'   },
            { label: 'Con video',   value: conVideo, color: 'text-blue-400'    },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-white/8 bg-white/3 py-3">
              <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Estados ── */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <RefreshCw size={22} className="animate-spin text-white/20" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-4 min-h-[40vh] justify-center text-center">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-white/50">{error}</p>
          <button onClick={load} className="rounded-xl bg-white/8 px-4 py-2 text-sm text-white hover:bg-white/12 transition">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && postulantes.length === 0 && (
        <div className="flex flex-col items-center gap-3 min-h-[40vh] justify-center text-center">
          <User size={28} className="text-white/15" />
          <p className="text-sm text-white/40">Todavía no hay postulantes.</p>
        </div>
      )}

      {/* ── Lista ── */}
      {!loading && !error && postulantes.length > 0 && (
        <div className="space-y-3">
          {postulantes.map((p, i) => (
            <PostulanteCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
