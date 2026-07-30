'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, XCircle, Plus, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_TIMEZONE } from '@/constants/timezone';

type Module  = { id: string; title: string; order_index: number; courses: { id: string; title: string } | null };
type Student = { id: string; full_name: string | null; avatar_url: string | null; role: string };
type Session = {
  id: string; module_id: string; student_id: string;
  scheduled_at: string; completed_at: string | null; status: string; notes: string | null;
  student: { id: string; full_name: string | null; avatar_url: string | null } | null;
  module: { id: string; title: string; courses: { title: string } | null } | null;
};

const STATUS_MAP = {
  scheduled:  { label: 'Programada',  icon: Clock,         cls: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/40' },
  completed:  { label: 'Completada',  icon: CheckCircle2,  cls: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/40' },
  cancelled:  { label: 'Cancelada',   icon: XCircle,       cls: 'text-zinc-500 bg-zinc-800/40 border-zinc-700/40' },
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString('es-AR', { timeZone: APP_TIMEZONE, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function SessionsManager({ modules, students, sessions: init }: { modules: Module[]; students: Student[]; sessions: Session[] }) {
  const [sessions, setSessions]   = useState<Session[]>(init);
  const [creating,  setCreating]  = useState(false);
  const [form, setForm]           = useState({ module_id: '', student_id: '', scheduled_at: '', notes: '' });
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState<string | null>(null);

  async function markComplete(id: string) {
    const res = await fetch(`/api/admin/course-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSessions(s => s.map(x => x.id === id ? { ...x, ...updated } : x));
    }
  }

  async function createSession() {
    if (!form.module_id || !form.student_id || !form.scheduled_at) {
      setErr('Completá módulo, alumno y fecha'); return;
    }
    setSaving(true); setErr(null);
    const res = await fetch('/api/admin/course-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, notes: form.notes || null }),
    });
    if (res.ok) {
      const sess = await res.json();
      // Buscar el módulo y alumno para el display
      const mod = modules.find(m => m.id === sess.module_id);
      const stu = students.find(s => s.id === sess.student_id);
      setSessions(s => [{ ...sess, module: mod ? { id: mod.id, title: mod.title, courses: mod.courses } : null, student: stu ?? null }, ...s]);
      setCreating(false);
      setForm({ module_id: '', student_id: '', scheduled_at: '', notes: '' });
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? 'Error al crear');
    }
    setSaving(false);
  }

  const scheduled = sessions.filter(s => s.status === 'scheduled');
  const completed = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      {/* New session */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-widest text-brand-gold">Nueva sesión 1-a-1</p>
          <button onClick={() => setCreating(v => !v)} className="flex items-center gap-1.5 rounded-xl border border-[rgba(212,175,55,0.25)] px-3 py-1.5 text-xs font-semibold text-brand-gold hover:bg-[rgba(212,175,55,0.08)] transition">
            <Plus className="h-3.5 w-3.5" />{creating ? 'Cancelar' : 'Agendar sesión'}
          </button>
        </div>

        {creating && (
          <div className="space-y-3 border-t border-[rgba(212,175,55,0.08)] pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Módulo *</label>
                <select
                  value={form.module_id}
                  onChange={e => setForm(f => ({ ...f, module_id: e.target.value }))}
                  className="w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
                >
                  <option value="">Seleccionar módulo…</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.courses?.title ?? '—'} · {m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Alumno *</label>
                <select
                  value={form.student_id}
                  onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                  className="w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
                >
                  <option value="">Seleccionar alumno…</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name ?? s.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Fecha y hora *</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                  className="w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
                />
              </div>
              <div>
                <label className="text-xs text-brand-muted mb-1 block">Notas (opcional)</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tema de la sesión…"
                  className="w-full rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-gold/50"
                />
              </div>
            </div>
            {err && <p className="text-sm text-red-400">{err}</p>}
            <button onClick={createSession} disabled={saving}
              className="rounded-xl bg-brand-gold px-5 py-2 text-sm font-bold text-black hover:bg-brand-gold/90 disabled:opacity-60 transition">
              {saving ? 'Guardando…' : 'Crear sesión'}
            </button>
          </div>
        )}
      </div>

      {/* Programadas */}
      {scheduled.length > 0 && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-3">Programadas ({scheduled.length})</p>
          <div className="space-y-2">
            {scheduled.map(s => <SessionRow key={s.id} session={s} onComplete={() => markComplete(s.id)} />)}
          </div>
        </section>
      )}

      {/* Completadas */}
      {completed.length > 0 && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-3">Completadas ({completed.length})</p>
          <div className="space-y-2">
            {completed.map(s => <SessionRow key={s.id} session={s} />)}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <div className="card-premium text-center py-12">
          <Calendar className="h-8 w-8 text-brand-muted/30 mx-auto mb-3" />
          <p className="text-sm text-brand-muted">No hay sesiones todavía. Agendá la primera arriba.</p>
        </div>
      )}
    </div>
  );
}

function SessionRow({ session: s, onComplete }: { session: Session; onComplete?: () => void }) {
  const st = STATUS_MAP[s.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.scheduled;
  const Icon = st.icon;

  return (
    <div className="card-premium flex items-center gap-4">
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-[#222] border border-[rgba(212,175,55,0.1)] flex items-center justify-center shrink-0 overflow-hidden">
        {s.student?.avatar_url ? (
          <img src={s.student.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className="h-4 w-4 text-brand-muted" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-text truncate">{s.student?.full_name ?? '—'}</p>
        <p className="text-xs text-brand-muted truncate">{s.module?.courses?.title ?? '—'} · {s.module?.title ?? '—'}</p>
      </div>

      {/* Date */}
      <div className="text-right shrink-0">
        <p className="text-xs text-brand-text">{fmt(s.scheduled_at)}</p>
        {s.completed_at && <p className="text-[10px] text-emerald-400">Completada {fmt(s.completed_at)}</p>}
      </div>

      {/* Status */}
      <span className={cn('flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold shrink-0', st.cls)}>
        <Icon className="h-3 w-3" />{st.label}
      </span>

      {/* Action */}
      {onComplete && s.status === 'scheduled' && (
        <button
          onClick={onComplete}
          className="shrink-0 rounded-xl bg-emerald-900/40 border border-emerald-700/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/60 transition"
        >
          Marcar completada
        </button>
      )}
    </div>
  );
}
