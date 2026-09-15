'use client';

import { useState } from 'react';

export type Postulante = {
  id: string;
  created_at: string;
  nombre: string;
  apellido: string;
  email: string;
  edad: number | null;
  experiencia: string | null;
  motivo: string | null;
  motivacion: string | null;
  estado: string;
  notas_admin: string | null;
  fotoUrl: string | null;
  videoUrl: string | null;
  video_completado: boolean;
};

const ESTADOS = ['nuevo', 'revisando', 'entrevista', 'aceptado', 'rechazado'] as const;

const ESTADO_COLOR: Record<string, string> = {
  nuevo: 'text-[#D4AF37] border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.1)]',
  revisando: 'text-amber-300 border-amber-700/40 bg-amber-900/20',
  entrevista: 'text-blue-300 border-blue-700/40 bg-blue-900/20',
  aceptado: 'text-emerald-300 border-emerald-700/40 bg-emerald-900/20',
  rechazado: 'text-red-400 border-red-900/40 bg-red-950/20',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function PostulanteCard({ p }: { p: Postulante }) {
  const [estado, setEstado] = useState(p.estado);
  const [notas, setNotas] = useState(p.notas_admin ?? '');
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch(`/api/admin/reclutamiento/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-premium">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {p.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.fotoUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-[#181818]" />
          )}
          <div>
            <p className="font-medium text-brand-text">{p.nombre} {p.apellido}</p>
            <p className="text-xs text-brand-muted">{p.email} · {p.edad ?? '—'} años</p>
            <p className="text-[11px] text-brand-muted/70">{fmtDate(p.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!p.video_completado && (
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-400">
              ⚠ Sin video
            </span>
          )}
          <select
            value={estado}
            disabled={saving}
            onChange={(e) => { setEstado(e.target.value); patch({ estado: e.target.value }); }}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${ESTADO_COLOR[estado] ?? ESTADO_COLOR.nuevo}`}
          >
            {ESTADOS.map((e) => <option key={e} value={e} className="bg-[#050505] text-brand-text">{e}</option>)}
          </select>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-[rgba(212,175,55,0.2)] px-3 py-1 text-xs text-brand-muted transition hover:border-[rgba(212,175,55,0.4)]"
          >
            {expanded ? 'Ocultar' : 'Ver más'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 space-y-4 border-t border-[rgba(212,175,55,0.1)] pt-5">
          {p.videoUrl && (
            <video src={p.videoUrl} controls className="w-full max-w-md rounded-lg bg-black" />
          )}

          {p.experiencia && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.6)]">Experiencia</p>
              <p className="mt-1 text-sm text-brand-muted">{p.experiencia}</p>
            </div>
          )}
          {p.motivo && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.6)]">Por qué quiere ser parte del equipo</p>
              <p className="mt-1 text-sm text-brand-muted">{p.motivo}</p>
            </div>
          )}
          {p.motivacion && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.6)]">Qué lo motiva</p>
              <p className="mt-1 text-sm text-brand-muted">{p.motivacion}</p>
            </div>
          )}

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[rgba(212,175,55,0.6)]">Notas internas</p>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => patch({ notas_admin: notas })}
              rows={2}
              placeholder="Notas para el equipo (no las ve el postulante)"
              className="w-full rounded-lg border border-[rgba(212,175,55,0.15)] bg-[#0d0d0d] px-3 py-2 text-sm text-brand-text placeholder-brand-muted/40 outline-none focus:border-[rgba(212,175,55,0.4)]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
