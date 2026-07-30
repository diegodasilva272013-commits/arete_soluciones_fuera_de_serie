-- 0061 · Course system v2: transcript, gating, AI quiz, sesiones
-- Todas las alteraciones son idempotentes con ADD COLUMN IF NOT EXISTS.

-- ── lessons: transcripción ───────────────────────────────────────────────
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS transcript          TEXT,
  ADD COLUMN IF NOT EXISTS transcript_status   TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS transcript_updated_at TIMESTAMPTZ;

-- ── courses: visibilidad por rol ─────────────────────────────────────────
-- Array vacío = visible para todos los roles autenticados
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS visible_to_roles TEXT[] NOT NULL DEFAULT '{}';

-- ── quizzes: generado por IA ─────────────────────────────────────────────
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT FALSE;

-- ── quiz_questions: tipo de pregunta ─────────────────────────────────────
-- 'multiple_choice' | 'open_ended'
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS question_type    TEXT NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS scoring_criteria TEXT;  -- guía para evaluación IA de open_ended

-- ── quiz_attempts: feedback IA ────────────────────────────────────────────
-- Estructura: { score_open: 0-100, strengths: [{point,quote}], improvements: [{point,better}] }
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS ai_feedback        JSONB,
  ADD COLUMN IF NOT EXISTS open_ended_score   INT,
  ADD COLUMN IF NOT EXISTS questions_snapshot JSONB;  -- snapshot de las preguntas usadas en este intento

-- ── lesson_progress: gating y 1-a-1 ─────────────────────────────────────
ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS quiz_passed     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS quiz_score      INT,
  ADD COLUMN IF NOT EXISTS quiz_passed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS oneon1_done     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oneon1_done_at  TIMESTAMPTZ;

-- ── Función: verificar unlock de siguiente lección ────────────────────────
-- Una lección se desbloquea cuando la anterior tiene quiz_passed = true
-- Y oneon1_done = true en la lesson_progress del usuario
CREATE OR REPLACE FUNCTION public.check_lesson_unlock(
  p_user_id   UUID,
  p_lesson_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_order  INT;
  v_mod    UUID;
  v_prev   UUID;
  v_prog   RECORD;
BEGIN
  SELECT order_index, module_id INTO v_order, v_mod FROM public.lessons WHERE id = p_lesson_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Primera lección del módulo: siempre desbloqueada
  IF v_order = 0 THEN RETURN TRUE; END IF;

  -- Buscar la lección anterior en el mismo módulo
  SELECT id INTO v_prev FROM public.lessons
  WHERE module_id = v_mod AND order_index < v_order
  ORDER BY order_index DESC LIMIT 1;

  IF v_prev IS NULL THEN RETURN TRUE; END IF;

  -- Verificar que la lección anterior tenga quiz aprobado Y 1-on-1 completado
  SELECT quiz_passed, oneon1_done INTO v_prog
  FROM public.lesson_progress
  WHERE user_id = p_user_id AND lesson_id = v_prev;

  RETURN COALESCE(v_prog.quiz_passed, FALSE) AND COALESCE(v_prog.oneon1_done, FALSE);
END;
$$;

-- ── Actualizar trigger de quiz_attempt para sincronizar lesson_progress ───
CREATE OR REPLACE FUNCTION public._on_quiz_attempt_insert()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_lesson UUID;
BEGIN
  IF NEW.passed THEN
    PERFORM public.grant_badge(NEW.user_id, 'quiz_master');
    SELECT lesson_id INTO v_lesson FROM public.quizzes WHERE id = NEW.quiz_id;
    IF v_lesson IS NOT NULL THEN
      INSERT INTO public.lesson_progress (user_id, lesson_id, completed, completed_at, quiz_passed, quiz_score, quiz_passed_at)
      VALUES (NEW.user_id, v_lesson, TRUE, NOW(), TRUE, NEW.score, NOW())
      ON CONFLICT (user_id, lesson_id) DO UPDATE
        SET completed      = TRUE,
            completed_at   = COALESCE(lesson_progress.completed_at, NOW()),
            quiz_passed    = TRUE,
            quiz_score     = NEW.score,
            quiz_passed_at = NOW();
    END IF;
  ELSE
    -- Attempt fallido: igual actualizamos el score para historial
    SELECT lesson_id INTO v_lesson FROM public.quizzes WHERE id = NEW.quiz_id;
    IF v_lesson IS NOT NULL THEN
      INSERT INTO public.lesson_progress (user_id, lesson_id, completed, quiz_score)
      VALUES (NEW.user_id, v_lesson, FALSE, NEW.score)
      ON CONFLICT (user_id, lesson_id) DO UPDATE
        SET quiz_score = GREATEST(COALESCE(lesson_progress.quiz_score, 0), NEW.score);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_quiz_attempt_insert ON public.quiz_attempts;
CREATE TRIGGER on_quiz_attempt_insert
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public._on_quiz_attempt_insert();

-- ── RLS: setters pueden leer sus propias lesson_progress (ya existía) ────
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lesson_progress_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_own" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "lesson_progress_admin" ON public.lesson_progress;
CREATE POLICY "lesson_progress_admin" ON public.lesson_progress
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
