import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo admin' }, { status: 403 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY no configurada' }, { status: 500 });

    const formData = await req.formData();
    const audio    = formData.get('audio') as File | null;
    if (!audio) return NextResponse.json({ error: 'Falta el archivo de audio' }, { status: 400 });

    // Marcar como procesando
    await admin.from('lessons')
      .update({ transcript_status: 'processing' })
      .eq('id', params.id);

    // Llamar a Whisper
    const whisperForm = new FormData();
    whisperForm.append('file', audio, audio.name);
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('language', 'es');
    whisperForm.append('response_format', 'text');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      await admin.from('lessons')
        .update({ transcript_status: 'failed' })
        .eq('id', params.id);
      const err = await whisperRes.text();
      return NextResponse.json({ error: `Whisper error: ${err}` }, { status: 502 });
    }

    const transcript = await whisperRes.text();

    await admin.from('lessons')
      .update({
        transcript,
        transcript_status: 'done',
        transcript_updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    return NextResponse.json({ transcript });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
