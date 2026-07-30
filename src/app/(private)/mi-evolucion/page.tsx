import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PageHeader } from '@/components/layout/page-header';
import { CheckCircle2, Circle, Lock, Calendar, Award, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_TIMEZONE } from '@/constants/timezone';

export const dynamic = 'force-dynamic';

function pct(n: number, d: number) { return d > 0 ? Math.round((n / d) * 100) : 0; }
function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('es-AR', { timeZone: APP_TIMEZONE, day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function MiEvolucionPage() {
  const supabase = createSupabaseServerClient() as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [profileRes, coursesRes, progressRes, attemptsRes, sessionsRes] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, role').eq('id', user.id).single(),
    supabase.from('courses').select('id, title, description, modules(id, title, order_index, lessons(id, title, order_index, is_published))').eq('is_published', true).order('created_at'),
    supabase.from('lesson_progress').select('lesson_id, completed, quiz_passed, quiz_score, oneon1_done, completed_at, quiz_passed_at').eq('user_id', user.id),
    supabase.from('quiz_attempts').select('id, quiz_id, score, passed, created_at, quizzes(lesson_id)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('course_sessions').select('id, module_id, scheduled_at, completed_at, status, module:module_id(title)').eq('student_id', user.id).order('scheduled_at', { ascending: false }),
  ]);

  const profile  = profileRes.data  as any;
  const courses  = (coursesRes.data ?? [])  as any[];
  const progress = (progressRes.data ?? []) as any[];
  const attempts = (attemptsRes.data ?? []) as any[];
  const sessions = (sessionsRes.data ?? []) as any[];

  const progressMap  = new Map(progress.map((p: any) => [p.lesson_id, p]));

  // Métricas globales
  let totalLessons = 0, watchedLessons = 0, quizPassed = 0, oneon1Done = 0;
  for (const c of courses) {
    for (const m of c.modules ?? []) {
      for (const l of (m.lessons ?? []).filter((l: any) => l.is_published)) {
        totalLessons++;
        const p = progressMap.get(l.id);
        if (p?.completed)   watchedLessons++;
        if (p?.quiz_passed) quizPassed++;
        if (p?.oneon1_done) oneon1Done++;
      }
    }
  }

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s: number, a: any) => s + a.score, 0) / attempts.length)
    : null;
  const passRate = attempts.length
    ? Math.round(attempts.filter((a: any) => a.passed).length / attempts.length * 100)
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header con perfil */}
      <div className="card-premium flex items-center gap-5">
        <div className="h-16 w-16 rounded-full border-2 border-brand-gold/30 overflow-hidden bg-[#1a1a1a] shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name ?? ''} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-brand-gold">
              {(profile?.full_name ?? 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-brand-gold">Mi evolución</p>
          <h1 className="text-xl font-bold text-brand-text">{profile?.full_name ?? 'Alumno'}</h1>
          <p className="text-xs text-brand-muted capitalize">{profile?.role ?? 'student'}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-black text-brand-gold">{pct(quizPassed, totalLessons)}%</div>
          <p className="text-[10px] text-brand-muted uppercase tracking-widest">progreso global</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Clases vistas',         value: `${watchedLessons}/${totalLessons}`,  icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Prácticas aprobadas',   value: `${quizPassed}/${totalLessons}`,      icon: Award,        color: 'text-brand-gold' },
          { label: 'Sesiones 1-a-1',        value: `${sessions.filter((s: any) => s.status === 'completed').length}`, icon: Calendar, color: 'text-blue-400' },
          { label: 'Score promedio',         value: avgScore !== null ? `${avgScore}%` : '—',  icon: Target, color: 'text-violet-400' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card-premium text-center">
              <Icon className={cn('h-5 w-5 mx-auto mb-2', k.color)} />
              <p className="text-xl font-bold text-brand-text">{k.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-muted mt-0.5">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Cursos */}
      {courses.map((course: any) => {
        const modules = (course.modules ?? []).sort((a: any, b: any) => a.order_index - b.order_index);
        return (
          <section key={course.id}>
            <h2 className="text-base font-bold text-brand-text mb-4">{course.title}</h2>
            <div className="space-y-3">
              {modules.map((mod: any, mIdx: number) => {
                const lessons = (mod.lessons ?? []).filter((l: any) => l.is_published).sort((a: any, b: any) => a.order_index - b.order_index);
                const session = sessions.find((s: any) => s.module_id === mod.id);
                const modQuizPassed  = lessons.filter((l: any) => progressMap.get(l.id)?.quiz_passed).length;
                const modOneon1Done  = lessons.length > 0 && lessons.every((l: any) => progressMap.get(l.id)?.oneon1_done);
                const modCompleted   = modQuizPassed === lessons.length && modOneon1Done;

                return (
                  <div key={mod.id} className="card-premium">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-brand-gold/60 uppercase tracking-widest">Módulo {mIdx + 1}</p>
                        <p className="text-sm font-bold text-brand-text">{mod.title}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {modCompleted
                          ? <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold border border-emerald-700/40 rounded-full px-2.5 py-1"><CheckCircle2 className="h-3 w-3" />Completado</span>
                          : <span className="text-[10px] text-brand-muted">{modQuizPassed}/{lessons.length} clases</span>}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-[#1c1c1c] mb-4 overflow-hidden">
                      <div className="h-full bg-gold-gradient transition-all" style={{ width: `${pct(modQuizPassed, lessons.length)}%` }} />
                    </div>

                    {/* Lessons */}
                    <div className="space-y-2">
                      {lessons.map((lesson: any, lIdx: number) => {
                        const p = progressMap.get(lesson.id);
                        const watched     = !!p?.completed;
                        const passed      = !!p?.quiz_passed;
                        const oneon1      = !!p?.oneon1_done;
                        const score       = p?.quiz_score ?? null;
                        const passedAt    = p?.quiz_passed_at;

                        return (
                          <div key={lesson.id} className={cn(
                            'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                            passed ? 'border-emerald-800/30 bg-emerald-950/10' : 'border-[rgba(212,175,55,0.08)] bg-[#0d0d0d]'
                          )}>
                            {passed ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              : watched ? <Circle className="h-4 w-4 text-yellow-500 shrink-0" />
                              : <Lock className="h-4 w-4 text-brand-muted/40 shrink-0" />}

                            <span className={cn('flex-1 truncate', passed ? 'text-brand-text' : 'text-brand-muted')}>
                              {lIdx + 1}. {lesson.title}
                            </span>

                            <div className="flex items-center gap-2 shrink-0 text-[10px]">
                              {score !== null && (
                                <span className={cn('font-bold', score >= 70 ? 'text-emerald-400' : 'text-amber-400')}>{score}%</span>
                              )}
                              {oneon1 && (
                                <span className="text-blue-400 flex items-center gap-0.5"><Calendar className="h-3 w-3" />1-a-1</span>
                              )}
                              {passedAt && (
                                <span className="text-brand-muted/50">{fmtDate(passedAt)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Session 1-a-1 */}
                    <div className={cn('mt-3 rounded-xl border px-3 py-2.5 flex items-center gap-3 text-xs',
                      session?.status === 'completed' ? 'border-blue-800/30 bg-blue-950/20 text-blue-300'
                        : session ? 'border-yellow-800/30 bg-yellow-950/20 text-yellow-300'
                        : 'border-[rgba(212,175,55,0.06)] text-brand-muted/50')}>
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {session?.status === 'completed'
                        ? `Sesión 1-a-1 completada · ${fmtDate(session.completed_at)}`
                        : session
                        ? `Sesión programada: ${fmtDate(session.scheduled_at)}`
                        : 'Sesión 1-a-1 pendiente de agendar'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Historial de intentos */}
      {attempts.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-brand-text mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-gold" /> Historial de prácticas
          </h2>
          <div className="card-premium divide-y divide-[rgba(212,175,55,0.06)]">
            {attempts.slice(0, 15).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                {a.passed
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  : <Circle className="h-4 w-4 text-red-400 shrink-0" />}
                <span className="flex-1 text-xs text-brand-muted">{fmtDate(a.created_at)}</span>
                <span className={cn('text-sm font-bold', a.passed ? 'text-emerald-400' : 'text-red-400')}>{a.score}%</span>
                <span className={cn('text-[10px] rounded-full px-2 py-0.5 font-semibold border',
                  a.passed ? 'text-emerald-300 border-emerald-700/40 bg-emerald-900/20' : 'text-red-300 border-red-700/40 bg-red-900/20')}>
                  {a.passed ? 'Aprobó' : 'No aprobó'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
