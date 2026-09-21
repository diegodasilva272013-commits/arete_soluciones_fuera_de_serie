import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { APP_TIMEZONE } from '@/constants/timezone';

export const dynamic = 'force-dynamic';

const SCORE_MAP: Record<string, number> = {
  APERTURA_ENVIADA: 3, CONTACTADO: 5, NO_RESPONDE: 2,
  RESPONDIO: 10, INTERES_DETECTADO: 12, INVITADO_AL_GRUPO: 15,
  INGRESO_AL_GRUPO: 18, ACTIVO_EN_GRUPO: 20, DIAGNOSTICO_INICIADO: 25,
  DIAGNOSTICO_PROFUNDO: 30, REUNION_PROPUESTA: 35, REUNION_AGENDADA: 60,
};

export function getGrade(score: number) {
  if (score >= 250) return { grade: 'S', label: 'Fuera de Serie', color: '#d4af37' };
  if (score >= 150) return { grade: 'A', label: 'Excelente',       color: '#10b981' };
  if (score >= 100) return { grade: 'B', label: 'Muy Bien',        color: '#3b82f6' };
  if (score >= 50)  return { grade: 'C', label: 'Regular',         color: '#f59e0b' };
  if (score >= 20)  return { grade: 'D', label: 'Bajo',            color: '#f97316' };
  return              { grade: 'F', label: 'Sin actividad',    color: '#6b7280' };
}

function toArgDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });
}

type Activity = { id: string; created_at: string; type: string; new_status: string | null; note: string | null };

function computeDay(acts: Activity[]) {
  let contacts = 0, notes = 0, meetings = 0, score = 0;
  const breakdown: Record<string, number> = {};
  for (const a of acts) {
    if (a.type === 'STATUS_CHANGE' && a.new_status) {
      score += SCORE_MAP[a.new_status] ?? 0;
      if (['CONTACTADO','APERTURA_ENVIADA'].includes(a.new_status)) contacts++;
      if (a.new_status === 'REUNION_AGENDADA') meetings++;
      breakdown[a.new_status] = (breakdown[a.new_status] ?? 0) + 1;
    }
    if (a.type === 'NOTE_ADDED') { notes++; score += 3; }
  }
  return { contacts, notes, meetings, score, ...getGrade(score), breakdown };
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceISO = since.toISOString();

  const [{ data: la }, { data: tla }] = await Promise.all([
    (supabase as any).from('lead_activities')
      .select('id, created_at, type, new_status, note')
      .eq('user_id', user.id)
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),
    (supabase as any).from('team_lead_activities')
      .select('id, created_at, type, new_status, note')
      .eq('user_id', user.id)
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),
  ]);

  const all: Activity[] = [...(la ?? []), ...(tla ?? [])];

  const byDay: Record<string, Activity[]> = {};
  for (const a of all) {
    const day = toArgDate(a.created_at);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(a);
  }

  // 30-day history, gaps = 0
  const history = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });
    const acts = byDay[dateStr] ?? [];
    const stats = computeDay(acts);
    history.push({ date: dateStr, ...stats, total_activities: acts.length });
  }

  const today = history[history.length - 1];
  const yesterday = history[history.length - 2];

  // Today's activity log with labels
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });
  const recentActivities = (byDay[todayStr] ?? []).map(a => ({
    ...a,
    time: new Date(a.created_at).toLocaleTimeString('es-VE', {
      timeZone: APP_TIMEZONE, hour: '2-digit', minute: '2-digit',
    }),
  }));

  // Status distribution (today)
  const todayActs = byDay[todayStr] ?? [];
  const statusDist = Object.entries(
    todayActs
      .filter(a => a.type === 'STATUS_CHANGE' && a.new_status)
      .reduce((acc: Record<string, number>, a) => {
        acc[a.new_status!] = (acc[a.new_status!] ?? 0) + 1;
        return acc;
      }, {})
  ).map(([name, value]) => ({ name, value, pts: SCORE_MAP[name] ?? 0 }));

  return NextResponse.json({ today, yesterday, history, recentActivities, statusDist });
}
