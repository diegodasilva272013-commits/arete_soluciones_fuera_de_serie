-- 0062 · course_sessions: calendario de mentorías 1-a-1
-- Cuando se marca como completada → auto-activa oneon1_done en lesson_progress
-- para todas las lecciones del módulo correspondiente.

CREATE TABLE IF NOT EXISTS public.course_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID        NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  student_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status       TEXT        NOT NULL DEFAULT 'scheduled',  -- 'scheduled' | 'completed' | 'cancelled'
  notes        TEXT,
  created_by   UUID        REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_sessions_status_check CHECK (status IN ('scheduled','completed','cancelled'))
);

CREATE INDEX IF NOT EXISTS course_sessions_student_idx  ON public.course_sessions(student_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS course_sessions_module_idx   ON public.course_sessions(module_id);
CREATE INDEX IF NOT EXISTS course_sessions_status_idx   ON public.course_sessions(status);

ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;

-- Admin: acceso total
DROP POLICY IF EXISTS "course_sessions_admin"  ON public.course_sessions;
CREATE POLICY "course_sessions_admin" ON public.course_sessions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Alumno: solo ve sus propias sesiones
DROP POLICY IF EXISTS "course_sessions_student" ON public.course_sessions;
CREATE POLICY "course_sessions_student" ON public.course_sessions
  FOR SELECT USING (auth.uid() = student_id);

-- ── Trigger: al completar sesión → marcar oneon1_done en lesson_progress ─
CREATE OR REPLACE FUNCTION public._on_course_session_complete()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_lesson RECORD;
BEGIN
  -- Solo ejecutar cuando status pasa a 'completed' y completed_at se setea
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Para cada lección del módulo, marcar oneon1_done en lesson_progress
    FOR v_lesson IN
      SELECT id FROM public.lessons WHERE module_id = NEW.module_id
    LOOP
      INSERT INTO public.lesson_progress (user_id, lesson_id, completed, oneon1_done, oneon1_done_at)
      VALUES (NEW.student_id, v_lesson.id, FALSE, TRUE, NEW.completed_at)
      ON CONFLICT (user_id, lesson_id) DO UPDATE
        SET oneon1_done    = TRUE,
            oneon1_done_at = NEW.completed_at;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_course_session_complete ON public.course_sessions;
CREATE TRIGGER on_course_session_complete
  AFTER INSERT OR UPDATE ON public.course_sessions
  FOR EACH ROW EXECUTE FUNCTION public._on_course_session_complete();
