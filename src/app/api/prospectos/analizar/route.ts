import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { runProspectAnalysisPipeline } from '@/lib/ai/prospect-agents';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { linkedinUrl, instagramUrl, profileText, sourceType = 'linkedin', language = 'es' } =
    await req.json();
  const profileUrl = sourceType === 'instagram' ? instagramUrl : linkedinUrl;
  if (!profileUrl) return NextResponse.json({ error: 'URL requerida' }, { status: 400 });

  // Verificar duplicado
  const urlField = sourceType === 'instagram' ? 'instagram_url' : 'linkedin_url';
  const { data: existing } = await supabase
    .from('prospects')
    .select('id')
    .eq(urlField, profileUrl)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'duplicate', message: 'Este prospecto ya existe', prospectId: existing.id },
      { status: 409 }
    );
  }

  // Pipeline IA
  const result = await runProspectAnalysisPipeline(profileUrl, profileText || '', sourceType, language);

  // Guardar prospecto
  const { data: prospect, error: pErr } = await supabase
    .from('prospects')
    .insert({
      linkedin_url: sourceType === 'linkedin' ? profileUrl : null,
      instagram_url: sourceType === 'instagram' ? profileUrl : null,
      source_type: sourceType,
      full_name: result.prospectInfo.full_name || 'Sin nombre',
      headline: result.prospectInfo.headline || '',
      company: result.prospectInfo.company || '',
      location: result.prospectInfo.location || '',
      status: 'nuevo',
      phase: 'contacto',
      follow_up_count: 0,
      assigned_to: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (pErr || !prospect) {
    return NextResponse.json({ error: 'Error guardando prospecto' }, { status: 500 });
  }

  // Guardar análisis
  await supabase.from('prospect_analyses').insert({
    prospect_id: prospect.id,
    psychological_profile: result.psychologicalProfile.psychological_profile,
    disc_type: result.psychologicalProfile.disc_type,
    communication_style: result.psychologicalProfile.communication_style,
    key_words: result.psychologicalProfile.key_words,
    pain_points: result.salesStrategy.pain_points,
    sales_angle: result.salesStrategy.sales_angle,
    company_analysis: result.salesStrategy.company_analysis,
    raw_linkedin_data: result.rawProfileData,
  });

  // Guardar mensajes
  const msgs = result.messages;
  await supabase.from('generated_messages').insert([
    { prospect_id: prospect.id, follow_up_number: 0, phase: 'contacto', message_type: 'inicial', content: msgs.mensaje_inicial },
    { prospect_id: prospect.id, follow_up_number: 1, phase: 'contacto', message_type: 'sin_respuesta', content: msgs.fase_contacto.seguimiento_1_sin_respuesta },
    { prospect_id: prospect.id, follow_up_number: 1, phase: 'contacto', message_type: 'con_respuesta', content: msgs.fase_contacto.seguimiento_2_con_respuesta },
    { prospect_id: prospect.id, follow_up_number: 2, phase: 'venta', message_type: 'sin_respuesta', content: msgs.fase_venta.seguimiento_3_sin_respuesta },
    { prospect_id: prospect.id, follow_up_number: 3, phase: 'venta', message_type: 'sin_respuesta', content: msgs.fase_venta.seguimiento_4_sin_respuesta },
    { prospect_id: prospect.id, follow_up_number: 4, phase: 'venta', message_type: 'con_respuesta', content: msgs.fase_venta.seguimiento_5_con_respuesta },
    { prospect_id: prospect.id, follow_up_number: 5, phase: 'cierre', message_type: 'sin_respuesta', content: msgs.fase_cierre.seguimiento_6_breakup },
    { prospect_id: prospect.id, follow_up_number: 5, phase: 'cierre', message_type: 'con_respuesta', content: msgs.fase_cierre.seguimiento_6_agendar },
  ]);

  // Auto-crear lead en el pipeline del setter
  // El prospecto pasa directamente a la lista de leads para hacer seguimiento
  const nameParts = (result.prospectInfo.full_name || 'Sin nombre').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Sin nombre';
  const lastName  = nameParts.slice(1).join(' ') || null;
  const noteLines = [
    result.prospectInfo.headline,
    result.prospectInfo.company,
  ].filter(Boolean).join(' — ');

  await supabase.from('leads').insert({
    first_name:           firstName,
    last_name:            lastName,
    phone:                prospect.whatsapp_number || '',
    source:               sourceType === 'instagram' ? 'instagram' : 'linkedin',
    assigned_to_user_id:  user.id,
    prospect_id:          prospect.id,
    current_status:       'NO_CONTACTADO',
    notes:                noteLines || null,
  });

  return NextResponse.json({ success: true, prospectId: prospect.id });
}
