import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = (profile as any)?.role === 'admin';

  const client = isAdmin ? createSupabaseAdminClient() : supabase;

  let query = (client as any)
    .from('call_debriefs')
    .select(`
      id, created_at, updated_at, resultado, monto_usd,
      notas_closer, notas_setter, proximo_paso, fecha_proximo_paso,
      lead_id, reunion_id, closer_id, setter_id, creado_por,
      lead:leads(id, first_name, last_name, phone, current_status),
      closer:profiles!call_debriefs_closer_id_fkey(id, full_name, avatar_url),
      setter:profiles!call_debriefs_setter_id_fkey(id, full_name, avatar_url),
      creator:profiles!call_debriefs_creado_por_fkey(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ debriefs: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    lead_id, reunion_id, closer_id, setter_id,
    resultado, monto_usd,
    notas_closer, notas_setter,
    proximo_paso, fecha_proximo_paso,
  } = body;

  if (!resultado) return NextResponse.json({ error: 'resultado requerido' }, { status: 400 });

  const { data, error } = await (supabase as any)
    .from('call_debriefs')
    .insert({
      creado_por: user.id,
      lead_id: lead_id || null,
      reunion_id: reunion_id || null,
      closer_id: closer_id || null,
      setter_id: setter_id || null,
      resultado,
      monto_usd: monto_usd ?? null,
      notas_closer: notas_closer ?? '',
      notas_setter: notas_setter ?? '',
      proximo_paso: proximo_paso ?? '',
      fecha_proximo_paso: fecha_proximo_paso || null,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const allowed = ['notas_closer','notas_setter','proximo_paso','fecha_proximo_paso','resultado','monto_usd'];
  const update: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in fields) update[k] = fields[k];
  }

  const { error } = await (supabase as any)
    .from('call_debriefs')
    .update(update)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
