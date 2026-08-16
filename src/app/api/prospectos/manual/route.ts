import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { full_name, company, headline, location, whatsapp_number, linkedin_url, instagram_url } =
    await req.json();
  if (!full_name?.trim()) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

  const { data: prospect, error } = await supabase
    .from('prospects')
    .insert({
      full_name: full_name.trim(),
      company: company || '',
      headline: headline || '',
      location: location || '',
      whatsapp_number: whatsapp_number || null,
      linkedin_url: linkedin_url || null,
      instagram_url: instagram_url || null,
      source_type: 'manual',
      status: 'nuevo',
      phase: 'contacto',
      follow_up_count: 0,
      assigned_to: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !prospect) {
    return NextResponse.json({ error: 'Error creando prospecto' }, { status: 500 });
  }

  return NextResponse.json({ success: true, prospectId: prospect.id });
}
