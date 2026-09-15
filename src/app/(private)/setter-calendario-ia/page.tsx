'use client';

/**
 * /setter-calendario-ia
 * Vista de solo lectura del Calendario IA para setters y closers.
 * Muestra: próximas reuniones agendadas por el agente + log de llamadas.
 */

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { RefreshCw, Bot, Calendar, Phone, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { APP_TIMEZONE } from '@/constants/timezone';

const supabase = createSupabaseBrowserClient();

type Tab = 'reuniones' | 'llamadas';

type Reunion = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  empresa: string | null;
  motivo: string;
  inicio: string;
  duracion_min: number;
  estado: string;
  notas_ia: string | null;
  created_at: string;
};

type Contacto = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  empresa: string | null;
  resumen: string;
  transcripcion: string | null;
  audio_url: string | null;
  duracion_seg: number | null;
  created_at: string;
};

const ESTADO_BADGE: Record<string, string> = {
  pendiente:   'bg-yellow-500/15 text-yellow-300',
  confirmada:  'bg-blue-500/15 text-blue-300',
  completada:  'bg-green-500/15 text-green-300',
  cancelada:   'bg-red-500/15 text-red-300',
  no_show:     'bg-gray-500/15 text-gray-400',
};

function fmtLocal(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: APP_TIMEZONE,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDuracion(seg: number) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── LlamadaCard ──────────────────────────────────────────────────────────────

function LlamadaCard({ c }: { c: Contacto }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-premium space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-text">
            {c.nombre ?? 'Sin nombre'}
            {c.empresa ? <span className="ml-2 text-xs text-brand-muted">· {c.empresa}</span> : null}
          </p>
          {c.telefono && (
            <p className="text-xs text-brand-muted">{c.telefono}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-[10px] text-brand-muted">{fmtLocal(c.created_at)}</p>
          {c.duracion_seg != null && (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-brand-muted">
              {fmtDuracion(c.duracion_seg)}
            </span>
          )}
        </div>
      </div>

      {c.resumen && (
        <p className="text-xs leading-relaxed text-brand-muted">{c.resumen}</p>
      )}

      {c.audio_url && (
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2">
          <Play className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
          <audio controls src={c.audio_url} className="h-6 w-full" />
        </div>
      )}

      {c.transcripcion && (
        <>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 text-[11px] text-brand-gold hover:opacity-80"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {open ? 'Ocultar transcripción' : 'Ver transcripción'}
          </button>
          {open && (
            <pre className="max-h-48 overflow-y-auto rounded-lg border border-white/8 bg-white/3 p-3 text-[11px] leading-relaxed whitespace-pre-wrap text-brand-muted">
              {c.transcripcion}
            </pre>
          )}
        </>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SetterCalendarioIAPage() {
  const [tab, setTab] = useState<Tab>('reuniones');
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [llamadas, setLlamadas] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [rRes, lRes] = await Promise.all([
      supabase
        .from('reuniones_externas')
        .select('id,nombre,email,telefono,empresa,motivo,inicio,duracion_min,estado,notas_ia,created_at')
        .order('inicio', { ascending: true })
        .limit(50),
      supabase
        .from('contactos_ia')
        .select('id,nombre,telefono,empresa,resumen,transcripcion,audio_url,duracion_seg,created_at')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    setReuniones((rRes.data as Reunion[]) ?? []);
    setLlamadas((lRes.data as Contacto[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
    { id: 'reuniones', label: 'Reuniones', icon: Calendar },
    { id: 'llamadas',  label: 'Llamadas',  icon: Phone },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-brand-gold">Agente de Voz</p>
          <h1 className="mt-1 text-xl font-bold text-brand-text flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-gold" />
            Calendario IA
          </h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-white/10 p-2 text-brand-muted hover:text-brand-text transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-brand-gold text-black'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-muted" />
        </div>
      ) : (
        <>
          {/* Reuniones */}
          {tab === 'reuniones' && (
            <div className="space-y-3">
              {reuniones.length === 0 ? (
                <p className="py-10 text-center text-sm text-brand-muted">No hay reuniones agendadas.</p>
              ) : reuniones.map(r => (
                <div key={r.id} className="card-premium space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-brand-text">{r.nombre}</p>
                      {r.empresa && <p className="text-xs text-brand-muted">{r.empresa}</p>}
                      {r.telefono && <p className="text-xs text-brand-muted">{r.telefono}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ESTADO_BADGE[r.estado] ?? 'bg-white/10 text-white/50'}`}>
                      {r.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-muted">
                    <Calendar className="h-3.5 w-3.5 text-brand-gold" />
                    <span>{fmtLocal(r.inicio)}</span>
                    <span>· {r.duracion_min} min</span>
                  </div>
                  {r.motivo && (
                    <p className="text-xs text-brand-muted italic">&ldquo;{r.motivo}&rdquo;</p>
                  )}
                  {r.notas_ia && (
                    <p className="text-xs text-brand-muted">{r.notas_ia}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Llamadas */}
          {tab === 'llamadas' && (
            <div className="space-y-3">
              {llamadas.length === 0 ? (
                <p className="py-10 text-center text-sm text-brand-muted">No hay llamadas registradas.</p>
              ) : llamadas.map(c => (
                <LlamadaCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
