'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type MCQuestion = {
  id: string; prompt: string;
  options: { id: string; label: string }[];
  correct_option_id: string; explanation: string | null;
  question_type: 'multiple_choice';
};
type OpenQuestion = {
  id: string; prompt: string; scoring_criteria: string | null;
  question_type: 'open_ended';
};
type Question = MCQuestion | OpenQuestion;

type AIFeedback = {
  score: number;
  strengths: { point: string; quote: string }[];
  improvements: { point: string; better_example: string }[];
  summary: string;
};

type EvalResult = {
  score: number; mc_score: number; open_score: number; passed: boolean;
  mc_details: { id: string; correct: boolean; explanation: string | null; chosen: string; right: string }[];
  ai_feedback: AIFeedback | null;
};

type LastAttempt = { score: number; passed: boolean; created_at: string } | null;

export function LessonPractica({
  quizId, title, description, passingScore, questions, lastAttempt, lessonId,
}: {
  quizId: string; title: string; description: string | null;
  passingScore: number; questions: Question[]; lastAttempt: LastAttempt; lessonId: string;
}) {
  const mc   = questions.filter((q): q is MCQuestion  => q.question_type === 'multiple_choice');
  const open = questions.find((q): q is OpenQuestion  => q.question_type === 'open_ended') ?? null;

  const [mcAnswers,  setMcAnswers]  = useState<Record<string, string>>({});
  const [openAnswer, setOpenAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<EvalResult | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const allMcAnswered = mc.every(q => mcAnswers[q.id]);
  const canSubmit     = allMcAnswered && (!open || openAnswer.trim().length >= 50);

  async function submit() {
    setSubmitting(true); setError(null);
    const res = await fetch('/api/courses/quiz/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quizId,
        mc_answers: mcAnswers,
        open_ended_answer: openAnswer,
        open_ended_question_id: open?.id ?? null,
      }),
    });
    if (res.ok) {
      setResult(await res.json());
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Error al enviar la práctica');
    }
    setSubmitting(false);
  }

  function retry() {
    setResult(null); setMcAnswers({}); setOpenAnswer(''); setError(null);
    window.location.reload(); // recarga para obtener nuevas preguntas si el quiz fue regenerado
  }

  // ── RESULTADO ──────────────────────────────────────────────────────────────
  if (result) {
    const { score, mc_score, open_score, passed, mc_details, ai_feedback } = result;
    return (
      <div className="space-y-6">
        {/* Score card */}
        <div className={cn('rounded-2xl border p-6 text-center',
          passed ? 'border-emerald-700/40 bg-emerald-950/20' : 'border-red-700/40 bg-red-950/20')}>
          <div className={cn('text-5xl font-black mb-2', passed ? 'text-emerald-400' : 'text-red-400')}>{score}%</div>
          <div className={cn('text-lg font-bold mb-1', passed ? 'text-emerald-300' : 'text-red-300')}>
            {passed ? '¡Práctica aprobada!' : 'Necesitás mejorar'}
          </div>
          <p className="text-sm text-brand-muted">
            {passed
              ? `Superaste el mínimo de ${passingScore}%. El próximo módulo se desbloqueará cuando hagas la sesión 1-a-1.`
              : `El mínimo es ${passingScore}%. Revisá el feedback y volvé a intentarlo.`}
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div><span className="font-bold text-brand-text">{mc_score}%</span><span className="text-brand-muted ml-1">comprensión</span></div>
            {open && <div><span className="font-bold text-brand-text">{open_score}%</span><span className="text-brand-muted ml-1">aplicación</span></div>}
          </div>
        </div>

        {/* AI Feedback */}
        {ai_feedback && (
          <div className="card-premium space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-gold" />
              <p className="text-[10px] uppercase tracking-widest text-brand-gold">Evaluación de tu entrenador IA</p>
            </div>

            <div className="rounded-xl border border-[rgba(212,175,55,0.1)] bg-[#0d0d0d] px-4 py-3">
              <p className="text-sm text-brand-muted leading-relaxed italic">&quot;{ai_feedback.summary}&quot;</p>
            </div>

            {ai_feedback.strengths.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Lo que hiciste bien</p>
                <div className="space-y-3">
                  {ai_feedback.strengths.map((s, i) => (
                    <div key={i} className="rounded-xl border border-emerald-800/30 bg-emerald-950/20 p-4">
                      <p className="text-sm font-medium text-emerald-300">{s.point}</p>
                      {s.quote && (
                        <blockquote className="mt-2 border-l-2 border-emerald-600/40 pl-3">
                          <p className="text-xs text-emerald-400/80 italic">&quot;{s.quote}&quot;</p>
                        </blockquote>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ai_feedback.improvements.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Qué mejorar</p>
                <div className="space-y-3">
                  {ai_feedback.improvements.map((s, i) => (
                    <div key={i} className="rounded-xl border border-amber-800/30 bg-amber-950/10 p-4 space-y-2">
                      <p className="text-sm font-medium text-amber-300">{s.point}</p>
                      {s.better_example && (
                        <div className="rounded-lg bg-[#0d0d0d] border border-amber-700/20 px-3 py-2">
                          <p className="text-[10px] text-amber-500/60 uppercase tracking-widest mb-1">Así se vería mejor</p>
                          <p className="text-xs text-brand-muted italic">{s.better_example}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MC detail toggle */}
        <div className="card-premium">
          <button onClick={() => setShowDetails(v => !v)} className="flex items-center gap-2 text-xs text-brand-muted hover:text-brand-gold transition w-full">
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showDetails ? 'Ocultar' : 'Ver detalle'} de preguntas de comprensión
          </button>
          {showDetails && (
            <div className="mt-4 space-y-3 border-t border-[rgba(212,175,55,0.08)] pt-4">
              {mc_details.map((d, i) => {
                const q = mc.find(q => q.id === d.id);
                const chosenOpt = q?.options.find(o => o.id === d.chosen);
                const rightOpt  = q?.options.find(o => o.id === d.right);
                return (
                  <div key={d.id} className={cn('rounded-xl border p-3 text-xs space-y-1',
                    d.correct ? 'border-emerald-800/30 bg-emerald-950/10' : 'border-red-800/30 bg-red-950/10')}>
                    <div className="flex items-start gap-2">
                      {d.correct ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" /> : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />}
                      <p className="text-brand-text font-medium">{q?.prompt}</p>
                    </div>
                    {!d.correct && (
                      <div className="pl-5 space-y-0.5">
                        <p className="text-red-400">Tu respuesta: {chosenOpt?.label ?? (d.chosen || '(sin respuesta)')}</p>
                        <p className="text-emerald-400">Correcta: {rightOpt?.label ?? d.right}</p>
                      </div>
                    )}
                    {q?.explanation && <p className="pl-5 text-brand-muted">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!passed && (
          <div className="text-center">
            <button onClick={retry} className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-gold/90 transition">
              <RefreshCw className="h-4 w-4" />Intentar de nuevo con nuevas preguntas
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── FORMULARIO ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        {lastAttempt && (
          <div className={cn('mb-4 rounded-xl border px-4 py-3 text-sm',
            lastAttempt.passed ? 'border-emerald-700/30 bg-emerald-950/20 text-emerald-300' : 'border-amber-700/30 bg-amber-950/20 text-amber-300')}>
            {lastAttempt.passed ? `✓ Ya aprobaste esta práctica con ${lastAttempt.score}%` : `Último intento: ${lastAttempt.score}% — no alcanzó el ${passingScore}% mínimo`}
          </div>
        )}
        {description && <p className="text-sm text-brand-muted">{description}</p>}
      </div>

      {/* PARTE 1: Comprensión */}
      {mc.length > 0 && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-4">Parte 1 · Preguntas de comprensión</p>
          <div className="space-y-6">
            {mc.map((q, i) => (
              <div key={q.id} className="card-premium space-y-3">
                <p className="text-sm font-semibold text-brand-text">{i + 1}. {q.prompt}</p>
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt.id} className={cn(
                      'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer text-sm transition',
                      mcAnswers[q.id] === opt.id
                        ? 'border-brand-gold/50 bg-[rgba(212,175,55,0.08)] text-brand-text'
                        : 'border-[rgba(212,175,55,0.1)] text-brand-muted hover:border-[rgba(212,175,55,0.25)] hover:text-brand-text'
                    )}>
                      <input type="radio" name={`q_${q.id}`} value={opt.id}
                        checked={mcAnswers[q.id] === opt.id}
                        onChange={() => setMcAnswers(a => ({ ...a, [q.id]: opt.id }))}
                        className="accent-brand-gold" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PARTE 2: Caso de aplicación real */}
      {open && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-4">Parte 2 · Caso de aplicación real</p>
          <div className="card-premium space-y-4">
            <div className="rounded-xl border border-violet-700/20 bg-violet-950/10 px-4 py-4">
              <p className="text-sm text-brand-text leading-relaxed">{open.prompt}</p>
            </div>
            <div>
              <textarea
                value={openAnswer}
                onChange={e => setOpenAnswer(e.target.value)}
                rows={8}
                placeholder="Escribí tu respuesta aquí. Sé específico, aplicá lo que viste en la clase. Mínimo 50 caracteres para poder enviar."
                className="w-full resize-none rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111] px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold/40 focus:outline-none leading-relaxed"
              />
              <p className={cn('text-right text-[10px] mt-1', openAnswer.length >= 50 ? 'text-brand-muted' : 'text-amber-500')}>
                {openAnswer.length} / mín. 50 caracteres
              </p>
            </div>
          </div>
        </section>
      )}

      {error && <p className="rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={submitting || !canSubmit}
          className="flex items-center gap-2 rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-black hover:bg-brand-gold/90 disabled:opacity-40 transition"
        >
          <Sparkles className="h-4 w-4" />
          {submitting ? 'Evaluando con IA…' : 'Enviar y evaluar'}
        </button>
      </div>
      {!canSubmit && !submitting && (
        <p className="text-center text-xs text-brand-muted">
          {!allMcAnswered ? 'Respondé todas las preguntas de comprensión.' : 'Escribí al menos 50 caracteres en el caso de aplicación.'}
        </p>
      )}
    </div>
  );
}
