import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

export const runtime     = 'nodejs';
export const dynamic     = 'force-dynamic';
export const maxDuration = 60;

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { quiz_id, mc_answers, open_ended_answer, open_ended_question_id } = body as {
      quiz_id: string;
      mc_answers: Record<string, string>;
      open_ended_answer: string;
      open_ended_question_id: string | null;
    };

    const admin = createSupabaseAdminClient() as any;

    const { data: quiz } = await admin.from('quizzes')
      .select('id, lesson_id, passing_score')
      .eq('id', quiz_id).single();
    if (!quiz) return NextResponse.json({ error: 'Quiz no encontrado' }, { status: 404 });

    const { data: qs } = await admin.from('quiz_questions')
      .select('id, question_type, prompt, options, correct_option_id, explanation, scoring_criteria')
      .eq('quiz_id', quiz_id)
      .order('order_index');
    const questions = (qs ?? []) as any[];

    // Transcript para contexto
    let transcript = '';
    if (quiz.lesson_id) {
      const { data: lesson } = await admin.from('lessons').select('transcript').eq('id', quiz.lesson_id).single();
      transcript = lesson?.transcript ?? '';
    }

    // ── Evaluar MC ─────────────────────────────────────────────────────────
    const mcQuestions  = questions.filter(q => q.question_type === 'multiple_choice');
    const openQuestion = open_ended_question_id
      ? questions.find(q => q.question_type === 'open_ended' && q.id === open_ended_question_id)
      : questions.find(q => q.question_type === 'open_ended');

    let mcCorrect = 0;
    const mcDetails: any[] = [];
    for (const q of mcQuestions) {
      const chosen  = mc_answers[q.id] ?? '';
      const correct = chosen === q.correct_option_id;
      if (correct) mcCorrect++;
      mcDetails.push({ id: q.id, correct, explanation: q.explanation, chosen, right: q.correct_option_id });
    }
    const mcScore = mcQuestions.length > 0 ? Math.round((mcCorrect / mcQuestions.length) * 100) : 100;

    // ── Evaluar open-ended con GPT ─────────────────────────────────────────
    let openScore  = 0;
    let aiFeedback: any = null;

    if (openQuestion && open_ended_answer?.trim()) {
      const evalSystem = 'Sos un evaluador experto en formación de equipos de ventas. Evaluás respuestas en español argentino. Respondé SOLO con JSON válido.';

      const evalUser = [
        'Evaluá esta respuesta al siguiente caso de aplicación real.',
        '',
        'CONTEXTO DE LA CLASE (extracto):',
        transcript.slice(0, 2000),
        '',
        'CASO PRESENTADO:',
        openQuestion.prompt,
        '',
        'CRITERIOS:',
        openQuestion.scoring_criteria ?? 'El alumno debe demostrar comprensión y aplicación práctica.',
        '',
        'RESPUESTA DEL ALUMNO:',
        '"' + open_ended_answer + '"',
        '',
        'Respondé con este JSON:',
        '{"score":85,"strengths":[{"point":"Qué hizo bien","quote":"frase exacta del alumno"}],"improvements":[{"point":"Qué mejorar","better_example":"Así se vería mejor: ejemplo concreto"}],"summary":"1-2 oraciones de diagnóstico directo y honesto"}',
        '',
        'score = 0-100 según criterios cumplidos. Citá textualmente en quote. Sé específico en improvements con ejemplos concretos.',
      ].join('\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: evalSystem },
          { role: 'user',   content: evalUser },
        ],
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0].message.content ?? '{}';
      aiFeedback = JSON.parse(raw);
      openScore  = Math.min(100, Math.max(0, aiFeedback.score ?? 0));
    }

    // ── Score combinado ───────────────────────────────────────────────────
    const hasOpen   = !!(openQuestion && open_ended_answer?.trim());
    const finalScore = hasOpen
      ? Math.round(mcScore * 0.5 + openScore * 0.5)
      : mcScore;
    const passed = finalScore >= (quiz.passing_score ?? 70);

    const answers: Record<string, string> = { ...mc_answers };
    if (openQuestion) answers[openQuestion.id] = open_ended_answer ?? '';

    await admin.from('quiz_attempts').insert({
      user_id:          user.id,
      quiz_id,
      score:            finalScore,
      passed,
      answers,
      open_ended_score: hasOpen ? openScore : null,
      ai_feedback:      aiFeedback,
      questions_snapshot: questions.map(q => ({ id: q.id, type: q.question_type, prompt: q.prompt })),
    });

    return NextResponse.json({
      score:       finalScore,
      mc_score:    mcScore,
      open_score:  openScore,
      passed,
      mc_details:  mcDetails,
      ai_feedback: aiFeedback,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
