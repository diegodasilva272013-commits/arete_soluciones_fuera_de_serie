import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { LessonEditor } from './_components/LessonEditor';

export const dynamic = 'force-dynamic';

export default async function AdminLessonDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();

  const [lessonRes, quizRes] = await Promise.all([
    (supabase as any)
      .from('lessons')
      .select('id, title, description, video_url, duration_minutes, order_index, is_locked, is_published, transcript, transcript_status, module_id, modules(id, title, course_id, courses(id, title))')
      .eq('id', params.id)
      .maybeSingle(),
    (supabase as any)
      .from('quizzes')
      .select('id, title, description, passing_score, ai_generated, is_published')
      .eq('lesson_id', params.id)
      .maybeSingle(),
  ]);

  const lesson = lessonRes.data;
  if (!lesson) notFound();

  let questions: any[] = [];
  if (quizRes.data?.id) {
    const { data: qs } = await (supabase as any)
      .from('quiz_questions')
      .select('id, question_type, prompt, options, correct_option_id, explanation, scoring_criteria, order_index')
      .eq('quiz_id', quizRes.data.id)
      .order('order_index');
    questions = qs ?? [];
  }

  // Stats del intento
  const { data: statsRaw } = await (supabase as any)
    .from('quiz_attempts')
    .select('user_id, score, passed, created_at')
    .eq('quiz_id', quizRes.data?.id ?? '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false });

  const attempts = (statsRaw ?? []) as any[];
  const passed   = attempts.filter(a => a.passed);
  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : null;

  return (
    <LessonEditor
      lesson={lesson}
      quiz={quizRes.data ?? null}
      questions={questions}
      stats={{ total_attempts: attempts.length, passed: passed.length, avg_score: avgScore }}
    />
  );
}
