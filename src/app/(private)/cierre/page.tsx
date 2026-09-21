'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, X, ChevronDown, Loader2, CheckCircle2,
  TrendingUp, RefreshCw, Clock, XCircle, AlertCircle,
  DollarSign, FileText, User, Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { APP_TIMEZONE } from '@/constants/timezone';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type Lead    = { id: string; first_name: string; last_name: string | null; phone: string; current_status: string };

type Debrief = {
  id: string;
  created_at: string;
  updated_at: string;
  resultado: string;
  monto_usd: number | null;
  notas_closer: string;
  notas_setter: string;
  proximo_paso: string;
  fecha_proximo_paso: string | null;
  lead_id: string | null;
  closer_id: string | null;
  setter_id: string | null;
  creado_por: string;
  lead: Lead | null;
  closer: Profile | null;
  setter: Profile | null;
  creator: Profile | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const RESULTADOS = [
  { value: 'ganado',      label: 'Ganado',      color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40',  icon: CheckCircle2 },
  { value: 'perdido',     label: 'Perdido',     color: 'text-red-400 bg-red-900/30 border-red-700/40',              icon: XCircle },
  { value: 'reagendar',   label: 'Reagendar',   color: 'text-amber-300 bg-amber-900/30 border-amber-700/40',        icon: RefreshCw },
  { value: 'seguimiento', label: 'Seguimiento', color: 'text-sky-400 bg-sky-900/30 border-sky-700/40',              icon: TrendingUp },
  { value: 'no_show',     label: 'No Show',     color: 'text-zinc-400 bg-zinc-800/60 border-zinc-600/40',           icon: AlertCircle },
] as const;

function getResultado(val: string) {
  return RESULTADOS.find(r => r.value === val) ?? RESULTADOS[0];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-VE', {
    timeZone: APP_TIMEZONE,
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Avatar({ p }: { p: Profile | null }) {
  if (!p) return null;
  if (p.avatar_url) return <img src={p.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />;
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1a1a] text-[10px] font-bold text-brand-gold">
      {(p.full_name ?? '?')[0]?.toUpperCase()}
    </div>
  );
}

// ─── New Debrief Modal ────────────────────────────────────────────────────────

function NuevoDebriefModal({
  onClose, onCreated, currentUserId, currentRole,
}: {
  onClose: () => void;
  onCreated: () => void;
  currentUserId: string;
  currentRole: string;
}) {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [profiles, setProfiles]   = useState<Profile[]>([]);
  const [leadId, setLeadId]       = useState('');
  const [closerId, setCloserId]   = useState('');
  const [setterId, setSetterId]   = useState('');
  const [resultado, setResultado] = useState('');
  const [monto, setMonto]         = useState('');
  const [notas, setNotas]         = useState('');
  const [proxPaso, setProxPaso]   = useState('');
  const [fechaProx, setFechaProx] = useState('');
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');

  const isCloser = currentRole === 'closer';
  const isSetter = currentRole === 'setter' || currentRole === 'admin';

  useEffect(() => {
    const sb = createSupabaseBrowserClient();

    // Load leads — setters/closers see different leads, admin sees all
    async function loadLeads() {
      const { data } = await (sb as any)
        .from('leads')
        .select('id, first_name, last_name, phone, current_status')
        .order('created_at', { ascending: false })
        .limit(200);
      setLeads(data ?? []);
    }

    async function loadProfiles() {
      const { data } = await sb
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('role', ['closer', 'setter', 'admin'])
        .order('full_name');
      setProfiles((data as Profile[]) ?? []);
    }

    loadLeads();
    loadProfiles();
  }, []);

  async function submit() {
    if (!resultado) { setErr('Seleccioná un resultado.'); return; }
    setSaving(true);
    setErr('');
    try {
      const body: Record<string, unknown> = {
        lead_id: leadId || null,
        closer_id: closerId || null,
        setter_id: setterId || null,
        resultado,
        monto_usd: resultado === 'ganado' && monto ? parseFloat(monto) : null,
        proximo_paso: proxPaso,
        fecha_proximo_paso: fechaProx
          ? new Date(new Date(fechaProx).getTime() + 3 * 60 * 60 * 1000).toISOString()
          : null,
      };
      if (isCloser) body.notas_closer = notas;
      else body.notas_setter = notas;

      const res = await fetch('/api/cierre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setErr(d.error ?? 'Error al guardar.');
        return;
      }
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#0a0a0a] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(212,175,55,0.12)] bg-[#0a0a0a] px-5 py-4">
          <h2 className="text-base font-bold text-brand-text">Nuevo debrief post-llamada</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Lead */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Lead</label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
            >
              <option value="">— Sin lead específico —</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.first_name}{l.last_name ? ' ' + l.last_name : ''} · {l.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Closer / Setter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Closer</label>
              <select
                value={closerId}
                onChange={e => setCloserId(e.target.value)}
                className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
              >
                <option value="">— Seleccionar —</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Setter</label>
              <select
                value={setterId}
                onChange={e => setSetterId(e.target.value)}
                className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
              >
                <option value="">— Seleccionar —</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultado */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Resultado *</label>
            <div className="flex flex-wrap gap-2">
              {RESULTADOS.map(r => {
                const Icon = r.icon;
                const active = resultado === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setResultado(r.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active ? r.color : 'border-[rgba(212,175,55,0.15)] text-brand-muted hover:border-[rgba(212,175,55,0.4)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monto (solo si ganado) */}
          {resultado === 'ganado' && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Monto USD</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input
                  type="number"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] pl-9 pr-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/50"
                />
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Tus notas {isCloser ? '(Closer)' : '(Setter)'}
            </label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              placeholder="¿Cómo fue la llamada? Objeciones, interés del lead, contexto relevante..."
              className="w-full resize-none rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/50"
            />
          </div>

          {/* Próximo paso */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Próximo paso</label>
            <input
              type="text"
              value={proxPaso}
              onChange={e => setProxPaso(e.target.value)}
              placeholder="Ej: Enviar propuesta, Reagendar para el jueves..."
              className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/50"
            />
          </div>

          {/* Fecha próximo paso */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-muted">Fecha próximo paso</label>
            <input
              type="datetime-local"
              value={fechaProx}
              onChange={e => setFechaProx(e.target.value)}
              className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
            />
          </div>

          {err && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>
          )}

          <button
            disabled={saving || !resultado}
            onClick={submit}
            className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : 'Guardar debrief'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Notes Modal ─────────────────────────────────────────────────────────

function EditNotasModal({
  debrief, role, onClose, onSaved,
}: {
  debrief: Debrief;
  role: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isCloser = role === 'closer';
  const [notas, setNotas] = useState(isCloser ? debrief.notas_closer : debrief.notas_setter);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    setSaving(true);
    setErr('');
    try {
      const field = isCloser ? 'notas_closer' : 'notas_setter';
      const res = await fetch('/api/cierre', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: debrief.id, [field]: notas }),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Error'); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[rgba(212,175,55,0.25)] bg-[#0a0a0a] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-brand-text">Editar notas {isCloser ? 'Closer' : 'Setter'}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition"><X className="h-4 w-4" /></button>
        </div>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={5}
          className="w-full resize-none rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/50"
        />
        {err && <p className="mt-2 text-xs text-red-300">{err}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-brand-muted hover:text-brand-text transition">Cancelar</button>
          <button disabled={saving} onClick={save} className="btn-gold disabled:opacity-60">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Debrief Card ─────────────────────────────────────────────────────────────

function DebriefCard({
  d, currentUserId, currentRole, onEditNotas,
}: {
  d: Debrief;
  currentUserId: string;
  currentRole: string;
  onEditNotas: (d: Debrief) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const r = getResultado(d.resultado);
  const Icon = r.icon;

  const leadName = d.lead
    ? `${d.lead.first_name}${d.lead.last_name ? ' ' + d.lead.last_name : ''}`
    : 'Lead no vinculado';

  const isParticipant = d.closer_id === currentUserId || d.setter_id === currentUserId || d.creado_por === currentUserId;

  return (
    <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] overflow-hidden transition hover:border-[rgba(212,175,55,0.22)]">
      {/* Card header */}
      <div
        className="flex items-start justify-between gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border ${r.color}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-text truncate">{leadName}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-brand-muted">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${r.color}`}>
                {r.label}
              </span>
              {d.monto_usd != null && (
                <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                  <DollarSign className="h-3 w-3" />{d.monto_usd.toLocaleString('es-VE')}
                </span>
              )}
              <span>{fmtDate(d.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Participants */}
          <div className="flex -space-x-1">
            {d.closer && <Avatar p={d.closer} />}
            {d.setter && <Avatar p={d.setter} />}
          </div>
          <ChevronDown className={`h-4 w-4 text-brand-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[rgba(212,175,55,0.08)] px-4 pb-4 pt-3 space-y-3">
          {/* Participants detail */}
          <div className="grid grid-cols-2 gap-2">
            {d.closer && (
              <div className="flex items-center gap-2 rounded-lg border border-[rgba(212,175,55,0.1)] bg-[#111] px-3 py-2">
                <Avatar p={d.closer} />
                <div>
                  <p className="text-[10px] text-brand-muted uppercase tracking-wide">Closer</p>
                  <p className="text-xs font-medium text-brand-text">{d.closer.full_name ?? '—'}</p>
                </div>
              </div>
            )}
            {d.setter && (
              <div className="flex items-center gap-2 rounded-lg border border-[rgba(212,175,55,0.1)] bg-[#111] px-3 py-2">
                <Avatar p={d.setter} />
                <div>
                  <p className="text-[10px] text-brand-muted uppercase tracking-wide">Setter</p>
                  <p className="text-xs font-medium text-brand-text">{d.setter.full_name ?? '—'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notas closer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-brand-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Notas Closer</span>
              </div>
              {(currentRole === 'closer' || currentRole === 'admin') && isParticipant && (
                <button
                  onClick={() => onEditNotas(d)}
                  className="text-[10px] text-brand-muted hover:text-brand-gold transition"
                >
                  Editar
                </button>
              )}
            </div>
            <p className="text-sm text-brand-text/80 leading-relaxed whitespace-pre-wrap">
              {d.notas_closer || <span className="text-brand-muted italic">Sin notas</span>}
            </p>
          </div>

          {/* Notas setter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-brand-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Notas Setter</span>
              </div>
              {(currentRole === 'setter' || currentRole === 'admin') && isParticipant && (
                <button
                  onClick={() => onEditNotas(d)}
                  className="text-[10px] text-brand-muted hover:text-brand-gold transition"
                >
                  Editar
                </button>
              )}
            </div>
            <p className="text-sm text-brand-text/80 leading-relaxed whitespace-pre-wrap">
              {d.notas_setter || <span className="text-brand-muted italic">Sin notas</span>}
            </p>
          </div>

          {/* Próximo paso */}
          {(d.proximo_paso || d.fecha_proximo_paso) && (
            <div className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-[rgba(212,175,55,0.04)] px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-brand-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Próximo paso</span>
              </div>
              {d.proximo_paso && <p className="text-sm text-brand-text/90">{d.proximo_paso}</p>}
              {d.fecha_proximo_paso && (
                <p className="mt-0.5 text-xs text-brand-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" />{fmtDate(d.fecha_proximo_paso)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CierrePage() {
  const [debriefs, setDebriefs]   = useState<Debrief[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [editDebrief, setEdit]    = useState<Debrief | null>(null);
  const [search, setSearch]       = useState('');
  const [filtro, setFiltro]       = useState('');
  const [currentUserId, setUid]   = useState('');
  const [currentRole, setRole]    = useState('setter');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/cierre');
    const data = await res.json();
    setDebriefs(data.debriefs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) setUid(user.id);
    });
    (sb as any).from('profiles').select('role').eq('id', (async () => {
      const { data: { user } } = await sb.auth.getUser();
      return user?.id;
    })()).single().then(({ data }: { data: any }) => {
      if (data?.role) setRole(data.role);
    });
    load();
  }, [load]);

  // Simpler role load
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUid(user.id);
      const { data } = await (sb as any).from('profiles').select('role').eq('id', user.id).single();
      if (data?.role) setRole(data.role);
    });
  }, []);

  const filtered = debriefs.filter(d => {
    if (filtro && d.resultado !== filtro) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = d.lead ? `${d.lead.first_name} ${d.lead.last_name ?? ''}`.toLowerCase() : '';
      const closerName = d.closer?.full_name?.toLowerCase() ?? '';
      const setterName = d.setter?.full_name?.toLowerCase() ?? '';
      if (!name.includes(q) && !closerName.includes(q) && !setterName.includes(q)) return false;
    }
    return true;
  });

  const stats = {
    ganado:      debriefs.filter(d => d.resultado === 'ganado').length,
    perdido:     debriefs.filter(d => d.resultado === 'perdido').length,
    reagendar:   debriefs.filter(d => d.resultado === 'reagendar').length,
    seguimiento: debriefs.filter(d => d.resultado === 'seguimiento').length,
    no_show:     debriefs.filter(d => d.resultado === 'no_show').length,
  };

  return (
    <>
      <PageHeader
        title="Post-Llamada"
        subtitle="Registro compartido de cierres y escaladas"
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-12">
        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {RESULTADOS.map(r => {
            const Icon = r.icon;
            const count = stats[r.value as keyof typeof stats];
            return (
              <button
                key={r.value}
                onClick={() => setFiltro(f => f === r.value ? '' : r.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 transition ${
                  filtro === r.value ? r.color : 'border-[rgba(212,175,55,0.1)] bg-[#0c0c0c] text-brand-muted hover:border-[rgba(212,175,55,0.25)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-lg font-bold leading-none tabular-nums">{count}</span>
                <span className="text-[10px] uppercase tracking-wide">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por lead o nombre..."
            className="flex-1 rounded-lg border border-[rgba(212,175,55,0.18)] bg-[#0c0c0c] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/50"
          />
          <button
            onClick={() => setShowNew(true)}
            className="btn-gold inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-brand-muted">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-brand-muted">
            <FileText className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">
              {debriefs.length === 0
                ? 'Todavía no hay debriefs. ¡Registrá el primero!'
                : 'No hay resultados para este filtro.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => (
              <DebriefCard
                key={d.id}
                d={d}
                currentUserId={currentUserId}
                currentRole={currentRole}
                onEditNotas={setEdit}
              />
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <NuevoDebriefModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
          currentUserId={currentUserId}
          currentRole={currentRole}
        />
      )}

      {editDebrief && (
        <EditNotasModal
          debrief={editDebrief}
          role={currentRole}
          onClose={() => setEdit(null)}
          onSaved={() => { setEdit(null); load(); }}
        />
      )}
    </>
  );
}
