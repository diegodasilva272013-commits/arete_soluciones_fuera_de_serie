import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import { APP_TIMEZONE } from '@/constants/timezone';
import { getGrade } from '../setter/route';

export const dynamic = 'force-dynamic';

const SCORE_MAP: Record<string, number> = {
  APERTURA_ENVIADA: 3, CONTACTADO: 5, NO_RESPONDE: 2,
  RESPONDIO: 10, INTERES_DETECTADO: 12, INVITADO_AL_GRUPO: 15,
  INGRESO_AL_GRUPO: 18, ACTIVO_EN_GRUPO: 20, DIAGNOSTICO_INICIADO: 25,
  DIAGNOSTICO_PROFUNDO: 30, REUNION_PROPUESTA: 35, REUNION_AGENDADA: 60,
};

function toArgDate(isoStr: string) {
  return new Date(isoStr).toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });
}

type RawActivity = {
  user_id: string; created_at: string; type: string; new_status: string | null; note: string | null;
};

function computeDay(acts: RawActivity[]) {
  let contacts = 0, notes = 0, meetings = 0, score = 0;
  for (const a of acts) {
    if (a.type === 'STATUS_CHANGE' && a.new_status) {
      score += SCORE_MAP[a.new_status] ?? 0;
      if (['CONTACTADO','APERTURA_ENVIADA'].includes(a.new_status)) contacts++;
      if (a.new_status === 'REUNION_AGENDADA') meetings++;
    }
    if (a.type === 'NOTE_ADDED') { notes++; score += 3; }
  }
  return { contacts, notes, meetings, score, ...getGrade(score), total_activities: acts.length };
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if ((profile as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();

  // Get all setters
  const { data: setters } = await admin
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .in('role', ['setter', 'mentor'])
    .order('full_name');

  const setterIds = (setters ?? []).map((s: any) => s.id);
  if (setterIds.length === 0) return NextResponse.json({ setters: [], teams: [] });

  // Fetch last 30 days for ALL setters in 2 queries
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceISO = since.toISOString();

  const [{ data: la }, { data: tla }] = await Promise.all([
    (admin as any).from('lead_activities')
      .select('user_id, created_at, type, new_status')
      .in('user_id', setterIds)
      .gte('created_at', sinceISO),
    (admin as any).from('team_lead_activities')
      .select('user_id, created_at, type, new_status')
      .in('user_id', setterIds)
      .gte('created_at', sinceISO),
  ]);

  const all: RawActivity[] = [...(la ?? []), ...(tla ?? [])];

  // Group by (user_id, date)
  const byUserDay: Record<string, Record<string, RawActivity[]>> = {};
  for (const a of all) {
    const day = toArgDate(a.created_at);
    if (!byUserDay[a.user_id]) byUserDay[a.user_id] = {};
    if (!byUserDay[a.user_id][day]) byUserDay[a.user_id][day] = [];
    byUserDay[a.user_id][day].push(a);
  }

  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });

  // Build per-setter data
  const setterData = (setters ?? []).map((s: any) => {
    const userDays = byUserDay[s.id] ?? {};

    // 30-day history
    const history = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });
      const acts = userDays[dateStr] ?? [];
      const stats = computeDay(acts);
      history.push({ date: dateStr, ...stats });
    }

    const today = computeDay(userDays[todayStr] ?? []);
    const yesterday = (() => {
      const yd = new Date(); yd.setDate(yd.getDate() - 1);
      const ydStr = yd.toLocaleDateString('sv-SE', { timeZone: APP_TIMEZONE });
      return computeDay(userDays[ydStr] ?? []);
    })();

    return {
      user_id: s.id,
      full_name: s.full_name ?? '—',
      avatar_url: s.avatar_url,
      today,
      yesterday,
      history,
    };
  });

  // Sort by today's score desc
  setterData.sort((a, b) => b.today.score - a.today.score);

  // Teams
  const { data: teams } = await (admin as any)
    .from('setter_teams')
    .select('id, name, setter1_id, setter2_id');

  const teamData = (teams ?? []).map((t: any) => {
    const s1 = setterData.find(s => s.user_id === t.setter1_id);
    const s2 = setterData.find(s => s.user_id === t.setter2_id);
    const score = (s1?.today.score ?? 0) + (s2?.today.score ?? 0);
    return {
      team_id: t.id,
      name: t.name,
      score,
      setter1: s1 ? { name: s1.full_name, score: s1.today.score, grade: s1.today.grade } : null,
      setter2: s2 ? { name: s2.full_name, score: s2.today.score, grade: s2.today.grade } : null,
    };
  }).sort((a: any, b: any) => b.score - a.score);

  return NextResponse.json({ setters: setterData, teams: teamData, date: todayStr });
}
