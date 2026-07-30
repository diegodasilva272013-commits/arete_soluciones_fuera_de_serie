import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PageHeader } from '@/components/layout/page-header';
import { SessionsManager } from './_components/SessionsManager';

export const dynamic = 'force-dynamic';

export default async function SesionesCursoPage() {
  const supabase = createSupabaseServerClient() as any;

  const [modulesRes, studentsRes, sessionsRes] = await Promise.all([
    supabase
      .from('modules')
      .select('id, title, order_index, courses(id, title)')
      .order('order_index', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .in('role', ['setter', 'closer', 'mentor'])
      .order('full_name'),
    supabase
      .from('course_sessions')
      .select('id, module_id, student_id, scheduled_at, completed_at, status, notes, student:student_id(id, full_name, avatar_url), module:module_id(id, title, courses(title))')
      .order('scheduled_at', { ascending: false })
      .limit(200),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Admin · Curso"
        title="Calendario de mentorías"
        description="Agendá y completá las sesiones 1-a-1. Al completar una, se activa automáticamente el módulo para el alumno."
      />
      <SessionsManager
        modules={modulesRes.data ?? []}
        students={studentsRes.data ?? []}
        sessions={sessionsRes.data ?? []}
      />
    </div>
  );
}
