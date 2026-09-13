'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp, Camera, Video, ExternalLink } from 'lucide-react';

interface Postulante {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  edad: number;
  experiencia: string | null;
  motivo: string;
  motivacion: string;
  foto_url: string | null;
  video_url: string | null;
  estado: string | null;
  notas_admin: string | null;
  created_at: string;
}

const ESTADOS = ['nuevo', 'revisando', 'entrevista', 'aceptado', 'rechazado'];

const ESTADO_COLORS: Record<string, string> = {
  nuevo:       'text-white/50   bg-white/5     border-white/10',
  revisando:   'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  entrevista:  'text-blue-400   bg-blue-500/10   border-blue-500/20',
  aceptado:    'text-green-400  bg-green-500/10  border-green-500/20',
  rechazado:   'text-red-400    bg-red-500/10    border-red-500/20',
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

function Card({ p: init, index }: { p: Postulante; index: number }) {
  const [p, setP]       = useState(init);
  const [open, setOpen] = useState(false);
  const [notas, setNotas]       = useState(init.notas_admin ?? '');
  const [savingE, setSavingE]   = useState(false);
  const [savingN, setSavingN]   = useState(false);

  const estado = p.estado ?? 'nuevo';
  const colorClass = ESTADO_COLORS[estado] ?? ESTADO_COLORS.nuevo;
  const initials = `${p.nombre[0]}${p.apellido[0]}`.toUpperCase();

  async function patchEstado(e: string) {
    setSavingE(true);
    await fetch(`/api/admin/reclutamiento/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: e }),
    });
    setP(v => ({ ...v, estado: e }));
    setSavingE(false);
  }

  async function patchNotas() {
    setSavingN(true);
    await fetch(`/api/admin/reclutamiento/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas_admin: notas }),
    });
    setP(v => ({ ...v, notas_admin: notas }));
    setSavingN(false);
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${open ? 'border-[rgba(212,175,55,0.25)]' : 'border-white/8'} bg-[#0d0d0d]`}>
      {/* Row */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition"
      >
        <span className="hidden sm:flex w-7 h-7 items-center justify-center rounded-full bg-white/5 text-[11px] font-bold text-white/30 shrink-0">
          {index + 1}
        </span>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
          {p.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#D4AF37]">{initials}</span>
          )}
        </div>
        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{p.nombre} {p.apellido}</p>
          <p className="text-xs text-white/40 truncate">{p.email}</p>
        </div>
        {/* Estado badge */}
        <span className={`hidden sm:block rounded-full border px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${colorClass}`}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
        {/* Media icons */}
        <div className="flex gap-1.5 shrink-0">
          {p.foto_url  && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-400"><Camera size={11} /></span>}
          {p.video_url && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-400"><Video size={11} /></span>}
        </div>
        <span className="hidden lg:block text-[10px] text-white/25 shrink-0">{timeAgo(p.created_at)}</span>
        <span className="text-white/20 shrink-0">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {/* Detail */}
      {open && (
        <div className="border-t border-white/6 px-5 py-5 space-y-4">

          {/* Datos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-white/3 border border-white/6 p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Email</p>
              <p className="text-white break-all">{p.email}</p>
            </div>
            <div className="rounded-xl bg-white/3 border border-white/6 p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Edad</p>
              <p className="text-white">{p.edad} años</p>
            </div>
            <div className="rounded-xl bg-white/3 border border-white/6 p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Experiencia</p>
              <p className="text-white">{p.experiencia ?? 'No indicada'}</p>
            </div>
          </div>

          {/* Textos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/3 border border-white/6 p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-2">¿Por qué quiere ser parte del equipo?</p>
              <p className="text-sm text-white/80 leading-relaxed">{p.motivo}</p>
            </div>
            <div className="rounded-xl bg-white/3 border border-white/6 p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-2">¿Qué te motiva?</p>
              <p className="text-sm text-white/80 leading-relaxed">{p.motivacion}</p>
            </div>
          </div>

          {/* Media */}
          {(p.foto_url || p.video_url) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {p.foto_url && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-amber-500/10">
                    <Camera size={12} className="text-amber-400" />
                    <span className="text-[10px] text-amber-400/70 uppercase tracking-wide">Foto</span>
                    <a href={p.foto_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-amber-400/50 hover:text-amber-400">
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  <div className="h-48 bg-black flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.foto_url} alt="foto" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}
              {p.video_url && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-blue-500/10">
                    <Video size={12} className="text-blue-400" />
                    <span className="text-[10px] text-blue-400/70 uppercase tracking-wide">Video</span>
                    <a href={p.video_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-400/50 hover:text-blue-400">
                      <ExternalLink size={11} />
                    </a>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={p.video_url} controls playsInline className="w-full max-h-64 bg-black" preload="metadata" />
                </div>
              )}
            </div>
          )}

          {/* Estado + Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/3 border border-white/6 p-4 space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wide">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => patchEstado(e)}
                    disabled={savingE}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold transition disabled:opacity-40 ${
                      estado === e
                        ? (ESTADO_COLORS[e] ?? '') + ' ring-1 ring-white/20'
                        : 'bg-transparent border-white/10 text-white/30 hover:border-white/25 hover:text-white/60'
                    }`}
                  >
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white/3 border border-white/6 p-4 space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wide">Notas internas</p>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={3}
                placeholder="Notas sobre este postulante..."
                className="w-full rounded-lg bg-white/5 border border-white/8 px-3 py-2 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/20"
              />
              <button
                type="button"
                onClick={patchNotas}
                disabled={savingN}
                className="rounded-lg bg-white/8 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/12 transition disabled:opacity-30"
              >
                {savingN ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-white/20 text-right">Postulado el {formatDate(p.created_at)}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminReclutamientoPage() {
  const [rows, setRows]     = useState<Postulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/reclutamiento');
      if (res.status === 403) { setError('Solo administradores pueden acceder.'); return; }
      if (!res.ok) throw new Error();
      setRows(await res.json());
    } catch {
      setError('No se pudieron cargar los postulantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Admin</p>
          <h1 className="text-2xl font-black text-white">Reclutamiento</h1>
        </div>
        <button onClick={load} disabled={loading} className="rounded-xl bg-white/5 border border-white/8 p-2.5 text-white/40 hover:text-white transition disabled:opacity-30">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Postulantes', v: rows.length,                           c: 'text-white'      },
            { label: 'Con foto',    v: rows.filter(r => r.foto_url).length,   c: 'text-amber-400'  },
            { label: 'Con video',   v: rows.filter(r => r.video_url).length,  c: 'text-blue-400'   },
          ].map(m => (
            <div key={m.label} className="rounded-xl border border-white/8 bg-white/3 py-3">
              <p className={`text-2xl font-black ${m.c}`}>{m.v}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <RefreshCw size={22} className="animate-spin text-white/20" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-4 min-h-[40vh] justify-center text-center">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-white/50">{error}</p>
          <button onClick={load} className="rounded-xl bg-white/8 px-4 py-2 text-sm text-white hover:bg-white/12 transition">Reintentar</button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 min-h-[40vh] justify-center text-center">
          <p className="text-sm text-white/40">Todavía no hay postulantes.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r, i) => <Card key={r.id} p={r} index={i} />)}
        </div>
      )}
    </div>
  );
}
