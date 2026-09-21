'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import {
  TrendingUp, Users2, FileText, Calendar,
  Star, ArrowUp, ArrowDown, Minus, Activity,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { APP_TIMEZONE } from '@/constants/timezone';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayStats = {
  date: string; contacts: number; notes: number; meetings: number;
  score: number; grade: string; label: string; color: string;
  total_activities: number; breakdown?: Record<string, number>;
};

type StatusDist = { name: string; value: number; pts: number };

type ReportData = {
  today: DayStats;
  yesterday: DayStats;
  history: DayStats[];
  recentActivities: Array<{ id: string; type: string; new_status: string | null; note: string | null; time: string; created_at: string }>;
  statusDist: StatusDist[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = {
  gold:    '#d4af37',
  green:   '#10b981',
  blue:    '#3b82f6',
  purple:  '#a855f7',
  orange:  '#f59e0b',
  red:     '#ef4444',
  cyan:    '#06b6d4',
  pink:    '#ec4899',
};

const STATUS_LABELS: Record<string, string> = {
  APERTURA_ENVIADA: 'Apertura', CONTACTADO: 'Contactado', NO_RESPONDE: 'No responde',
  RESPONDIO: 'Respondió', INTERES_DETECTADO: 'Interés', INVITADO_AL_GRUPO: 'Inv. al grupo',
  INGRESO_AL_GRUPO: 'Ingresó', ACTIVO_EN_GRUPO: 'Activo', DIAGNOSTICO_INICIADO: 'Diagnóstico',
  DIAGNOSTICO_PROFUNDO: 'Diag. profundo', REUNION_PROPUESTA: 'Reunión propuesta',
  REUNION_AGENDADA: 'Reunión agendada',
};

const STATUS_COLORS: Record<string, string> = {
  APERTURA_ENVIADA: '#6b7280', CONTACTADO: '#3b82f6', NO_RESPONDE: '#ef4444',
  RESPONDIO: '#10b981', INTERES_DETECTADO: '#f59e0b', INVITADO_AL_GRUPO: '#a855f7',
  INGRESO_AL_GRUPO: '#8b5cf6', ACTIVO_EN_GRUPO: '#06b6d4', DIAGNOSTICO_INICIADO: '#0ea5e9',
  DIAGNOSTICO_PROFUNDO: '#d4af37', REUNION_PROPUESTA: '#f97316', REUNION_AGENDADA: '#d4af37',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  const [y, m, day] = d.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

function Delta({ curr, prev, field }: { curr: DayStats; prev: DayStats; field: keyof DayStats }) {
  const a = curr[field] as number;
  const b = prev[field] as number;
  const diff = a - b;
  if (diff === 0) return <span className="flex items-center gap-0.5 text-[10px] text-zinc-500"><Minus className="h-3 w-3" />igual</span>;
  const up = diff > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(diff)}
    </span>
  );
}

function GradeBadge({ grade, label, color }: { grade: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black"
        style={{ background: color + '22', border: `2px solid ${color}`, color }}
      >
        {grade}
      </div>
      <div>
        <p className="text-xs text-brand-muted">Calificación hoy</p>
        <p className="text-sm font-bold" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

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

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, delta, color, today, yesterday, field }: {
  icon: React.ElementType; label: string; value: number; delta?: boolean;
  color: string; today?: DayStats; yesterday?: DayStats; field?: keyof DayStats;
}) {
  return (
    <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-4">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: color + '22' }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        {delta && today && yesterday && field && (
          <Delta curr={today} prev={yesterday} field={field} />
        )}
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums text-brand-text">{value}</p>
      <p className="mt-0.5 text-xs text-brand-muted">{label}</p>
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ activities }: { activities: ReportData['recentActivities'] }) {
  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-brand-muted">
        <Activity className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-sm">Sin actividad registrada hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {activities.map(a => {
        const isStatus = a.type === 'STATUS_CHANGE';
        const isNote = a.type === 'NOTE_ADDED';
        const color = isStatus && a.new_status ? STATUS_COLORS[a.new_status] ?? '#6b7280' : '#d4af37';
        const label = isStatus && a.new_status
          ? STATUS_LABELS[a.new_status] ?? a.new_status
          : isNote ? 'Nota agregada' : a.type;

        return (
          <div key={a.id} className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#111] px-3 py-2">
            <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-brand-text">{label}</p>
              {a.note && <p className="mt-0.5 text-[11px] text-brand-muted truncate">{a.note}</p>}
            </div>
            <span className="flex-shrink-0 text-[10px] text-brand-muted tabular-nums">{a.time}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MiReportePage() {
  const [data, setData]     = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('es-VE', {
    timeZone: APP_TIMEZONE, weekday: 'long', day: 'numeric', month: 'long',
  });

  useEffect(() => {
    fetch('/api/reportes/setter')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Cargando reporte...
      </div>
    );
  }

  if (!data) return null;
  const { today: t, yesterday: y, history, recentActivities, statusDist } = data;

  // Last 7 days for bar chart
  const last7 = history.slice(-7).map(d => ({
    date: fmtDate(d.date),
    Contactos: d.contacts,
    Notas: d.notes,
    Reuniones: d.meetings,
    score: d.score,
  }));

  // Score history for line chart
  const scoreHistory = history.map(d => ({
    date: fmtDate(d.date),
    Puntos: d.score,
  }));

  // Pie data
  const pieData = statusDist.map(s => ({
    name: STATUS_LABELS[s.name] ?? s.name,
    value: s.value,
    color: STATUS_COLORS[s.name] ?? '#6b7280',
  }));

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <PageHeader
        title="Mi Reporte Diario"
        subtitle={<span className="capitalize">{today}</span>}
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12">
        {/* Grade + KPIs */}
        <div className="flex flex-wrap items-start gap-4">
          {/* Grade badge */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.04)] p-5 flex items-center gap-4 flex-shrink-0">
            <GradeBadge grade={t.grade} label={t.label} color={t.color} />
            <div className="border-l border-[rgba(212,175,55,0.15)] pl-4">
              <p className="text-3xl font-black text-brand-gold tabular-nums">{t.score}</p>
              <p className="text-xs text-brand-muted">puntos hoy</p>
              <Delta curr={t} prev={y} field="score" />
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 min-w-0">
            <KpiCard icon={Users2}   label="Contactos"  value={t.contacts} color={CHART_COLORS.blue}   delta today={t} yesterday={y} field="contacts"  />
            <KpiCard icon={FileText} label="Notas"      value={t.notes}    color={CHART_COLORS.purple} delta today={t} yesterday={y} field="notes"     />
            <KpiCard icon={Calendar} label="Reuniones"  value={t.meetings} color={CHART_COLORS.gold}   delta today={t} yesterday={y} field="meetings"  />
            <KpiCard icon={Activity} label="Acciones"   value={t.total_activities} color={CHART_COLORS.green} delta today={t} yesterday={y} field="total_activities" />
          </div>
        </div>

        {/* Score history line chart */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-gold" />
            <h3 className="text-sm font-bold text-brand-text">Evolución de puntos — últimos 30 días</h3>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  interval={4} stroke="rgba(255,255,255,0.08)"
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="Puntos" stroke={CHART_COLORS.gold}
                  strokeWidth={2} dot={false}
                  activeDot={{ r: 5, fill: CHART_COLORS.gold, stroke: '#0a0a0a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart + Pie chart row */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Bar: last 7 days breakdown */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-brand-gold" />
              <h3 className="text-sm font-bold text-brand-text">Actividad — últimos 7 días</h3>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} stroke="rgba(255,255,255,0.08)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                  <Bar dataKey="Contactos" fill={CHART_COLORS.blue}   radius={[3,3,0,0]} />
                  <Bar dataKey="Notas"     fill={CHART_COLORS.purple} radius={[3,3,0,0]} />
                  <Bar dataKey="Reuniones" fill={CHART_COLORS.gold}   radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie: status distribution today */}
          <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-gold" />
              <h3 className="text-sm font-bold text-brand-text">Distribución de estados — hoy</h3>
            </div>
            {pieData.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-brand-muted text-sm">
                Sin cambios de estado hoy
              </div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%" outerRadius={85}
                      dataKey="value" labelLine={false} label={renderCustomLabel}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, n: any) => [v, n]}
                      contentStyle={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', fontSize: 11, borderRadius: 8 }}
                      labelStyle={{ color: '#d4af37' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {pieData.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-brand-muted">
                      <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      {p.name} ({p.value})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score bar chart: last 30 days */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-brand-gold" />
            <h3 className="text-sm font-bold text-brand-text">Puntaje diario — últimos 30 días</h3>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.map(d => ({ date: fmtDate(d.date), Puntos: d.score, grade: d.grade }))}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} stroke="rgba(255,255,255,0.06)" interval={4} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} stroke="rgba(255,255,255,0.06)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Puntos" radius={[3,3,0,0]}>
                  {history.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity timeline */}
        <div className="rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-gold" />
            <h3 className="text-sm font-bold text-brand-text">Actividad de hoy</h3>
          </div>
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </>
  );
}
