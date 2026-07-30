import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

export const runtime     = 'nodejs';
export const dynamic     = 'force-dynamic';
export const maxDuration = 120;

const openai = new OpenAI();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admin' }, { status: 403 });

    const { data: lesson } = await admin.from('lessons').select('id, title, transcript').eq('id', params.id).single();
    if (!lesson?.transcript) return NextResponse.json({ error: 'La lección no tiene transcripción todavía' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const lessonTitle: string = body.title ?? lesson.title;

    const systemMsg = 'Sos un diseñador de evaluaciones de aprendizaje para un curso de ventas en español (Argentina). Creás prácticas basadas en el contenido real de la clase. TODO en español argentino (vos). Nunca inventés conceptos que no estén en la transcripción. Las opciones incorrectas deben ser plausibles. El caso debe requerir aplicación real. Los criterios deben ser específicos. Respondé SOLO con JSON válido, sin texto extra.';

    const userMsg = [
      'TRANSCRIPCIÓN DE LA CLASE: "' + lessonTitle + '"',
      '---',
      lesson.transcript.slice(0, 12000),
      '---',
      '',
      'Generá una práctica con EXACTAMENTE este formato JSON:',
      '{',
      '  "quiz_title": "Práctica: [nombre corto]",',
      '  "quiz_description": "Una oración que explique qué cubre esta práctica",',
      '  "passing_score": 70,',
      '  "comprehension_questions": [',
      '    {',
      '      "prompt": "Pregunta basada en el contenido",',
      '      "options": [{"id":"a","label":"Opción A"},{"id":"b","label":"Opción B"},{"id":"c","label":"Opción C"},{"id":"d","label":"Opción D"}],',
      '      "correct_option_id": "a",',
      '      "explanation": "Por qué es correcta, citando la clase"',
      '    }',
      '  ],',
      '  "case_scenario": {',
      '    "prompt": "Caso real de 2-3 párrafos: situación concreta de setter/vendedor que requiera aplicar lo visto",',
      '    "scoring_criteria": "criterio1;criterio2;criterio3;criterio4;criterio5"',
      '  }',
      '}',
      '',
      'Generá 5 preguntas de comprensión (de básico a complejo) y 1 caso de aplicación real.',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      max_tokens:  4000,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user',   content: userMsg },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content ?? '{}';
    const generated = JSON.parse(raw);

    // Upsert quiz
    const { data: existingQuiz } = await admin.from('quizzes').select('id').eq('lesson_id', params.id).maybeSingle();
    let quizId: string;

    if (existingQuiz?.id) {
      quizId = existingQuiz.id;
      await admin.from('quizzes').update({
        title:         generated.quiz_title,
        description:   generated.quiz_description,
        passing_score: generated.passing_score,
        ai_generated:  true,
        is_published:  true,
        updated_at:    new Date().toISOString(),
      }).eq('id', quizId);
      await admin.from('quiz_questions').delete().eq('quiz_id', quizId);
    } else {
      const { data: newQuiz } = await admin.from('quizzes').insert({
        lesson_id:     params.id,
        title:         generated.quiz_title,
        description:   generated.quiz_description,
        passing_score: generated.passing_score,
        ai_generated:  true,
        is_published:  true,
      }).select('id').single();
      quizId = newQuiz.id;
    }

    const mcQuestions = (generated.comprehension_questions ?? []).map((q: any, i: number) => ({
      quiz_id:           quizId,
      question_type:     'multiple_choice',
      prompt:            q.prompt,
      options:           JSON.stringify(q.options),
      correct_option_id: q.correct_option_id,
      explanation:       q.explanation,
      order_index:       i,
    }));

    const caseQuestion = {
      quiz_id:           quizId,
      question_type:     'open_ended',
      prompt:            generated.case_scenario?.prompt ?? '',
      options:           JSON.stringify([]),
      correct_option_id: '',
      explanation:       null,
      scoring_criteria:  generated.case_scenario?.scoring_criteria ?? '',
      order_index:       mcQuestions.length,
    };

    await admin.from('quiz_questions').insert([...mcQuestions, caseQuestion]);
    return NextResponse.json({ quiz_id: quizId, questions: mcQuestions.length + 1 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
