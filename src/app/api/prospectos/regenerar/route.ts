import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { regenerateMessagesOnly } from '@/lib/ai/prospect-agents';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { prospectId } = await req.json();
  if (!prospectId) return NextResponse.json({ error: 'prospectId requerido' }, { status: 400 });

  const [{ data: prospect }, { data: analysis }] = await Promise.all([
    supabase.from('prospects').select('*').eq('id', prospectId).single(),
    supabase.from('prospect_analyses').select('*').eq('prospect_id', prospectId).single(),
  ]);

  if (!prospect || !analysis) {
    return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 });
  }

  const newMsgs = await regenerateMessagesOnly(
    analysis.raw_linkedin_data || '',
    JSON.stringify({ psychological_profile: analysis.psychological_profile, disc_type: analysis.disc_type }),
    JSON.stringify({ sales_angle: analysis.sales_angle, pain_points: analysis.pain_points }),
    prospect.full_name,
    (prospect.source_type as 'linkedin' | 'instagram') || 'linkedin'
  );

  // Eliminar mensajes anteriores y guardar los nuevos
  await supabase.from('generated_messages').delete().eq('prospect_id', prospectId);
  await supabase.from('generated_messages').insert([
    { prospect_id: prospectId, follow_up_number: 0, phase: 'contacto', message_type: 'inicial', content: newMsgs.mensaje_inicial },
    { prospect_id: prospectId, follow_up_number: 1, phase: 'contacto', message_type: 'sin_respuesta', content: newMsgs.fase_contacto?.seguimiento_1_sin_respuesta },
    { prospect_id: prospectId, follow_up_number: 1, phase: 'contacto', message_type: 'con_respuesta', content: newMsgs.fase_contacto?.seguimiento_2_con_respuesta },
    { prospect_id: prospectId, follow_up_number: 2, phase: 'venta', message_type: 'sin_respuesta', content: newMsgs.fase_venta?.seguimiento_3_sin_respuesta },
    { prospect_id: prospectId, follow_up_number: 3, phase: 'venta', message_type: 'sin_respuesta', content: newMsgs.fase_venta?.seguimiento_4_sin_respuesta },
    { prospect_id: prospectId, follow_up_number: 4, phase: 'venta', message_type: 'con_respuesta', content: newMsgs.fase_venta?.seguimiento_5_con_respuesta },
    { prospect_id: prospectId, follow_up_number: 5, phase: 'cierre', message_type: 'sin_respuesta', content: newMsgs.fase_cierre?.seguimiento_6_breakup },
    { prospect_id: prospectId, follow_up_number: 5, phase: 'cierre', message_type: 'con_respuesta', content: newMsgs.fase_cierre?.seguimiento_6_agendar },
  ]);

  const { data: messages } = await supabase
    .from('generated_messages')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('follow_up_number');

  return NextResponse.json({ success: true, messages });
}
