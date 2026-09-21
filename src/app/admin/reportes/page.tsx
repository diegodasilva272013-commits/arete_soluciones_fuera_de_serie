'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import {
  TrendingUp, Users2, FileText, Calendar,
  Activity, Loader2, ChevronDown, ChevronUp,
  Trophy, Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { APP_TIMEZONE } from '@/constants/timezone';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayStats = {
  date: string; contacts: number; notes: number; meetings: number;
  score: number; grade: string; label: string; color: string; total_activities: number;
};

type SetterData = {
  user_id: string; full_name: string; avatar_url: string | null;
  today: DayStats; yesterday: DayStats; history: DayStats[];
};

type TeamData = {
  team_id: string; name: string; score: number;
  setter1: { name: string; score: number; grade: string } | null;
  setter2: { name: string; score: number; grade: string } | null;
};

type AdminReport = {
  setters: SetterData[]; teams: TeamData[]; date: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PALETTE = ['#d4af37','#10b981','#3b82f6','#a855f7','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16','#f97316'];

function fmtDate(d: string) {
  const [y, m, day] = d.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt="" className="h-7 w-7 rounded-full object-cover" />;
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a] text-[10px] font-bold text-brand-gold">
      {(name ?? '?')[0]?.toUpperCase()}
    </div>
  );
}

function GradeChip({ grade, color }: { grade: string; color: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black"
      style={{ background: color + '22', border: `1.5px solid ${color}`, color }}
    >
      {grade}
    </span>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-brand-gold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-bold tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Setter Row (leaderboard) ─────────────────────────────────────────────────

function SetterRow({
  setter, rank, expanded, onToggle,
}: {
  setter: SetterData; rank: number; expanded: boolean; onToggle: () => void;
}) {
  const t = setter.today;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-[rgba(212,175,55,0.03)] transition border-b border-[rgba(212,175,55,0.06)]"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-center">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            rank === 1 ? 'bg-[#d4af37] text-black' :
            rank === 2 ? 'bg-zinc-400 text-black' :
            rank === 3 ? 'bg-amber-700 text-white' :
            'text-brand-muted'
          }`}>{rank}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar name={setter.full_name} url={setter.avatar_url} />
            <span className="text-sm font-medium text-brand-text">{setter.full_name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <GradeChip grade={t.grade} color={t.color} />
        </td>
        <td className="px-4 py-3 text-center tabular-nums">
          <span className="text-sm font-bold" style={{ color: t.color }}>{t.score}</span>
        </td>
        <td className="px-4 py-3 text-center tabular-nums text-sm text-brand-text">{t.contacts}</td>
        <td className="px-4 py-3 text-center tabular-nums text-sm text-brand-text">{t.notes}</td>
        <td className="px-4 py-3 text-center tabular-nums text-sm text-brand-text">{t.meetings}</td>
        <td className="px-4 py-3 text-center tabular-nums text-sm text-brand-muted">{t.total_activities}</td>
        <td className="px-4 py-3 text-center">
          {expanded
            ? <ChevronUp className="h-4 w-4 text-brand-muted mx-auto" />
            : <ChevronDown className="h-4 w-4 text-brand-muted mx-auto" />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#080808]">
          <td colSpan={9} className="px-4 pb-4 pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 30-day score line */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Puntos — 30 días</p>
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={setter.history.map(d => ({ date: fmtDate(d.date), Puntos: d.score }))}
                      margin={{ top: 2, right: 8, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} interval={6} stroke="transparent" />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} stroke="transparent" />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Puntos" stroke={PALETTE[0]} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 7-day bar */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Actividad — 7 días</p>
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={setter.history.slice(-7).map(d => ({
                        date: fmtDate(d.date), C: d.contacts, N: d.notes, R: d.meetings,
                      }))}
                      margin={{ top: 2, right: 8, left: -30, bottom: 0 }} barCategoryGap="40%"
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} stroke="transparent" />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8 }} stroke="transparent" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="C" name="Contactos" fill="#3b82f6" radius={[2,2,0,0]} />
                      <Bar dataKey="N" name="Notas"     fill="#a855f7" radius={[2,2,0,0]} />
                      <Bar dataKey="R" name="Reuniones" fill="#d4af37"  radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminReportesPage() {
  const [data, setData]         = useState<AdminReport | null>(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('es-VE', {
    timeZone: APP_TIMEZONE, weekday: 'long', day: 'numeric', month: 'long',
  });

  useEffect(() => {
    fetch('/api/reportes/admin')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Cargando reportes...
      </div>
    );
  }

  if (!data) return null;
  const { setters, teams } = data;

  // Multi-line score chart (all setters, last 30 days)
  const multiLineData = (() => {
    if (!setters.length) return [];
    return setters[0].history.map((_, i) => {
      const point: Record<string, any> = { date: fmtDate(setters[0].history[i].date) };
      setters.forEach(s => { point[s.full_name] = s.history[i]?.score ?? 0; });
      return point;
    });
  })();

  // Today's grouped bar (contacts, notes, meetings per setter)
  const todayBarData = setters.map(s => ({
    name: s.full_name.split(' ')[0], // first name only for brevity
    Contactos: s.today.contacts,
    Notas: s.today.notes,
    Reuniones: s.today.meetings,
  }));

  // Global totals
  const totals = setters.reduce((acc, s) => ({
    contacts:  acc.contacts + s.today.contacts,
    notes:     acc.notes + s.today.notes,
    meetings:  acc.meetings + s.today.meetings,
    score:     acc.score + s.today.score,
    active:    acc.active + (s.today.score > 0 ? 1 : 0),
  }), { contacts: 0, notes: 0, meetings: 0, score: 0, active: 0 });

  // Score dist for pie
  const scorePie = [
    { name: 'Fuera de serie (S)', value: setters.filter(s => s.today.score >= 250).length, color: '#d4af37' },
    { name: 'Excelente (A)',      value: setters.filter(s => s.today.score >= 150 && s.today.score < 250).length, color: '#10b981' },
    { name: 'Muy Bien (B)',       value: setters.filter(s => s.today.score >= 100 && s.today.score < 150).length, color: '#3b82f6' },
    { name: 'Regular (C)',        value: setters.filter(s => s.today.score >= 50 && s.today.score < 100).length, color: '#f59e0b' },
    { name: 'Bajo (D)',           value: setters.filter(s => s.today.score >= 20 && s.today.score < 50).length, color: '#f97316' },
    { name: 'Sin actividad (F)',  value: setters.filter(s => s.today.score < 20).length, color: '#6b7280' },
  ].filter(x => x.value > 0);

  return (
    <>
      <PageHeader
        title="Reportes Diarios"
        subtitle={<span className="capitalize">{today}</span>}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-12">
        {/* Global KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Setters activos', value: `${totals.active}/${setters.length}`, icon: Users, color: '#d4af37' },
            { label: 'Contactos hoy',   value: totals.contacts,  icon: Users2,   color: '#3b82f6' },
            { label: 'Notas hoy',       value: totals.notes,     icon: FileText, color: '#a855f7' },
            { label: 'Reuniones hoy',   value: totals.meetings,  icon: Calendar, color: '#d4af37' },
            { label: 'Puntos totales',  value: totals.score,     icon: Trophy,   color: '#10b981' },
          ].map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-2" style={{ background: k.color + '22' }}>
                  <Icon className="h-4 w-4" style={{ color: k.color }} />
                </div>
                <p className="text-xl font-black tabular-nums text-brand-text">{k.value}</p>
                <p className="text-[11px] text-brand-muted">{k.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts row 1: multi-line + pie */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Multi-line: all setters 30 days */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-gold" />
              <h3 className="text-sm font-bold text-brand-text">Evolución de todos — 30 días</h3>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiLineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} interval={6} stroke="rgba(255,255,255,0.06)" />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} stroke="rgba(255,255,255,0.06)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
                  {setters.map((s, i) => (
                    <Line
                      key={s.user_id} type="monotone"
                      dataKey={s.full_name} stroke={PALETTE[i % PALETTE.length]}
                      strokeWidth={1.5} dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie: grade distribution today */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-gold" />
              <h3 className="text-sm font-bold text-brand-text">Calificaciones hoy</h3>
            </div>
            {scorePie.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-brand-muted text-sm">Sin datos</div>
            ) : (
              <>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={scorePie} cx="50%" cy="50%" outerRadius={75} dataKey="value" labelLine={false}>
                        {scorePie.map((e, i) => (
                          <Cell key={i} fill={e.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', fontSize: 11, borderRadius: 8 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  {scorePie.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-brand-muted">
                      <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      {p.name} ({p.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Grouped bar: today per setter */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users2 className="h-4 w-4 text-brand-gold" />
            <h3 className="text-sm font-bold text-brand-text">Actividad por setter — hoy</h3>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={todayBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                <Bar dataKey="Contactos" fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="Notas"     fill="#a855f7" radius={[3,3,0,0]} />
                <Bar dataKey="Reuniones" fill="#d4af37"  radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score bar: all setters today */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-brand-gold" />
            <h3 className="text-sm font-bold text-brand-text">Puntaje por setter — hoy</h3>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...setters].sort((a,b) => b.today.score - a.today.score).map(s => ({
                  name: s.full_name.split(' ')[0],
                  Puntos: s.today.score,
                  color: s.today.color,
                }))}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Puntos" radius={[4,4,0,0]}>
                  {[...setters].sort((a,b) => b.today.score - a.today.score).map((s, i) => (
                    <Cell key={i} fill={s.today.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[rgba(212,175,55,0.1)] px-5 py-4">
            <Trophy className="h-4 w-4 text-brand-gold" />
            <h3 className="text-sm font-bold text-brand-text">Ranking setters — hoy (clic para expandir)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[rgba(212,175,55,0.08)]">
                  {['#','Setter','Nota','Pts','Contactos','Notas','Reuniones','Acciones',''].map((h,i) => (
                    <th key={i} className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-brand-muted ${i > 1 ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {setters.map((s, i) => (
                  <SetterRow
                    key={s.user_id}
                    setter={s}
                    rank={i + 1}
                    expanded={expanded === s.user_id}
                    onToggle={() => setExpanded(e => e === s.user_id ? null : s.user_id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teams */}
        {teams.length > 0 && (
          <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-gold" />
              <h3 className="text-sm font-bold text-brand-text">Rendimiento por equipo — hoy</h3>
            </div>

            {/* Bar chart: teams */}
            <div style={{ height: 160 }} className="mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teams.map(t => ({ name: t.name, Puntos: t.score }))}
                  margin={{ top: 2, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.06)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Puntos" fill="#d4af37" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((t, i) => (
                <div key={t.team_id} className="rounded-lg border border-[rgba(212,175,55,0.1)] bg-[#111] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-brand-text">{t.name}</p>
                    <span className="text-xs font-bold text-brand-gold tabular-nums">{t.score} pts</span>
                  </div>
                  <div className="space-y-1">
                    {t.setter1 && (
                      <div className="flex items-center justify-between text-xs text-brand-muted">
                        <span>{t.setter1.name}</span>
                        <span className="tabular-nums text-brand-gold">{t.setter1.score} pts</span>
                      </div>
                    )}
                    {t.setter2 && (
                      <div className="flex items-center justify-between text-xs text-brand-muted">
                        <span>{t.setter2.name}</span>
                        <span className="tabular-nums text-brand-gold">{t.setter2.score} pts</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
