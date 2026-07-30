'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileAudio, Sparkles, CheckCircle2, Circle, Upload, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lesson = {
  id: string; title: string; description: string | null; video_url: string | null;
  transcript: string | null; transcript_status: string;
  is_published: boolean; is_locked: boolean;
  modules: { id: string; title: string; courses: { id: string; title: string } | null } | null;
};
type Quiz = { id: string; title: string; description: string | null; passing_score: number; ai_generated: boolean; is_published: boolean } | null;
type Question = { id: string; question_type: string; prompt: string; options: any; correct_option_id: string; explanation: string | null; scoring_criteria: string | null; order_index: number };
type Stats = { total_attempts: number; passed: number; avg_score: number | null };

export function LessonEditor({ lesson, quiz, questions, stats }: { lesson: Lesson; quiz: Quiz; questions: Question[]; stats: Stats }) {
  const [transcribing,  setTranscribing]  = useState(false);
  const [generating,    setGenerating]    = useState(false);
  const [transcript,    setTranscript]    = useState(lesson.transcript ?? '');
  const [txStatus,      setTxStatus]      = useState(lesson.transcript_status);
  const [currentQuiz,   setCurrentQuiz]   = useState(quiz);
  const [currentQs,     setCurrentQs]     = useState<Question[]>(questions);
  const [txVisible,     setTxVisible]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [success,       setSuccess]       = useState<string | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  async function handleTranscribe() {
    const file = audioRef.current?.files?.[0];
    if (!file) { setError('Seleccioná un archivo de audio primero'); return; }
    setTranscribing(true); setError(null); setSuccess(null);
    const fd = new FormData();
    fd.append('audio', file, file.name);
    const res = await fetch(`/api/admin/lessons/${lesson.id}/transcribe`, { method: 'POST', body: fd });
    if (res.ok) {
      const d = await res.json();
      setTranscript(d.transcript);
      setTxStatus('done');
      setSuccess('Transcripción lista. Ahora podés generar el quiz.');
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Error al transcribir');
    }
    setTranscribing(false);
  }

  async function handleGenerateQuiz() {
    if (!transcript.trim()) { setError('Necesitás la transcripción primero'); return; }
    setGenerating(true); setError(null); setSuccess(null);
    const res = await fetch(`/api/admin/lessons/${lesson.id}/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: lesson.title }),
    });
    if (res.ok) {
      setSuccess('Quiz generado. Recargá la página para ver las preguntas.');
      window.location.reload();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Error al generar quiz');
    }
    setGenerating(false);
  }

  const mcQuestions  = currentQs.filter(q => q.question_type === 'multiple_choice');
  const openQuestion = currentQs.find(q => q.question_type === 'open_ended');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/admin/classes" className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-gold transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a clases
        </Link>
        <span className="text-brand-muted/40">·</span>
        {lesson.modules?.courses && (
          <span className="text-xs text-brand-muted">{lesson.modules.courses.title} · {lesson.modules.title}</span>
        )}
      </div>

      {/* Header */}
      <div className="card-premium">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-1">Lección</p>
            <h1 className="text-2xl font-bold text-brand-text">{lesson.title}</h1>
            {lesson.description && <p className="mt-1 text-sm text-brand-muted">{lesson.description}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <span className={cn('text-[10px] font-semibold rounded-full px-2.5 py-1 border',
              lesson.is_published ? 'text-emerald-300 bg-emerald-900/30 border-emerald-700/40' : 'text-zinc-400 bg-zinc-800 border-zinc-700/40')}>
              {lesson.is_published ? 'Publicada' : 'Borrador'}
            </span>
          </div>
        </div>
        {lesson.video_url && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-1">Video</p>
            <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">{lesson.video_url}</a>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats.total_attempts > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Intentos', value: stats.total_attempts },
            { label: 'Aprobaron', value: stats.passed },
            { label: 'Score promedio', value: stats.avg_score !== null ? `${stats.avg_score}%` : '—' },
          ].map(s => (
            <div key={s.label} className="card-premium text-center">
              <p className="text-2xl font-bold text-brand-text">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Errors / success */}
      {error   && <div className="rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">{success}</div>}

      {/* Transcripción */}
      <div className="card-premium space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold">Transcripción</p>
            <div className="mt-1 flex items-center gap-2">
              {txStatus === 'done' && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />Lista</span>}
              {txStatus === 'processing' && <span className="flex items-center gap-1 text-xs text-yellow-400"><RefreshCw className="h-3.5 w-3.5 animate-spin" />Procesando…</span>}
              {txStatus === 'none' && <span className="text-xs text-brand-muted">Sin transcripción</span>}
              {txStatus === 'failed' && <span className="text-xs text-red-400">Error en la última transcripción</span>}
            </div>
          </div>
          {txStatus === 'done' && (
            <button onClick={() => setTxVisible(v => !v)} className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-gold transition">
              {txVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {txVisible ? 'Ocultar' : 'Ver transcripción'}
            </button>
          )}
        </div>

        {txVisible && transcript && (
          <div className="max-h-60 overflow-y-auto rounded-xl border border-[rgba(212,175,55,0.1)] bg-[#0d0d0d] p-4">
            <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>
        )}

        <div className="border-t border-[rgba(212,175,55,0.08)] pt-4">
          <p className="text-xs text-brand-muted mb-3">Subí el audio/video de la clase (MP3, MP4, M4A, WAV — máx 25 MB). El audio se envía a OpenAI Whisper para transcribir.</p>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-[rgba(212,175,55,0.2)] px-4 py-2 text-sm text-brand-muted hover:text-brand-text hover:border-brand-gold/30 transition">
              <Upload className="h-4 w-4" />
              <span>{audioRef.current?.files?.[0]?.name ?? 'Seleccionar audio…'}</span>
              <input ref={audioRef} type="file" accept="audio/*,video/mp4" className="hidden" onChange={() => setError(null)} />
            </label>
            <button
              onClick={handleTranscribe}
              disabled={transcribing}
              className="flex items-center gap-2 rounded-xl border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] px-4 py-2 text-sm font-semibold text-brand-gold hover:bg-[rgba(212,175,55,0.12)] disabled:opacity-50 transition"
            >
              <FileAudio className="h-4 w-4" />
              {transcribing ? 'Transcribiendo…' : 'Transcribir con Whisper'}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className="card-premium space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brand-gold">Práctica (Quiz AI)</p>
            {currentQuiz ? (
              <p className="mt-1 text-sm font-semibold text-brand-text">{currentQuiz.title}</p>
            ) : (
              <p className="mt-1 text-sm text-brand-muted">Sin práctica generada</p>
            )}
          </div>
          <button
            onClick={handleGenerateQuiz}
            disabled={generating || !transcript.trim()}
            title={!transcript.trim() ? 'Necesitás la transcripción primero' : ''}
            className="flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-black hover:bg-brand-gold/90 disabled:opacity-50 transition"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generando…' : currentQuiz ? 'Regenerar quiz' : 'Generar quiz con IA'}
          </button>
        </div>

        {currentQs.length > 0 && (
          <div className="border-t border-[rgba(212,175,55,0.08)] pt-4 space-y-4">
            <p className="text-xs text-brand-muted uppercase tracking-widest">Vista previa de preguntas ({currentQs.length})</p>

            {/* MC Questions */}
            {mcQuestions.map((q, i) => {
              const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []);
              return (
                <div key={q.id} className="rounded-xl border border-[rgba(212,175,55,0.1)] bg-[#0d0d0d] p-4 space-y-2">
                  <p className="text-[10px] text-brand-gold/60 uppercase tracking-widest">Pregunta {i + 1}</p>
                  <p className="text-sm font-medium text-brand-text">{q.prompt}</p>
                  <div className="space-y-1">
                    {opts.map((opt: any) => (
                      <div key={opt.id} className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs',
                        opt.id === q.correct_option_id ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40' : 'text-brand-muted'
                      )}>
                        {opt.id === q.correct_option_id ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <Circle className="h-3 w-3 shrink-0 opacity-30" />}
                        {opt.label}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <p className="text-[11px] text-brand-muted border-t border-[rgba(212,175,55,0.06)] pt-2 mt-2">{q.explanation}</p>}
                </div>
              );
            })}

            {/* Open-ended */}
            {openQuestion && (
              <div className="rounded-xl border border-violet-700/30 bg-violet-900/10 p-4 space-y-2">
                <p className="text-[10px] text-violet-400 uppercase tracking-widest">Caso de aplicación real</p>
                <p className="text-sm text-brand-text leading-relaxed">{openQuestion.prompt}</p>
                {openQuestion.scoring_criteria && (
                  <div className="border-t border-violet-700/20 pt-2 mt-2">
                    <p className="text-[10px] text-brand-muted mb-1 uppercase tracking-widest">Criterios de evaluación</p>
                    <ul className="space-y-0.5">
                      {openQuestion.scoring_criteria.split(';').map((c, i) => (
                        <li key={i} className="text-[11px] text-brand-muted flex items-start gap-1.5">
                          <span className="text-violet-500 mt-0.5">·</span>{c.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link to preview */}
      {lesson.is_published && (
        <div className="text-center">
          <a href={`/classes/${lesson.id}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-gold transition">
            <Eye className="h-4 w-4" />Ver como alumno →
          </a>
        </div>
      )}
    </div>
  );
}
