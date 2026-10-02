import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST { setter_id: string } → asigna TODOS los leads sin setter a ese setter
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    const { setter_id } = await req.json();
    if (!setter_id) return NextResponse.json({ error: 'setter_id requerido' }, { status: 400 });

    // El UPDATE corre entero del lado de Postgres (migración 0076,
    // reasignar_leads_sin_setter) con la misma definición de "sin asignar"
    // que el resto del panel: sin assigned_to_user_id Y sin estar ya en
    // team_leads. Antes se traían los ids a JS y se hacía .in('id', [...]) —
    // con miles de leads sin asignar esa URL podía superar el límite que
    // acepta PostgREST/Vercel y el update no aplicaba a nada.
    const { data: updated, error } = await (admin as any).rpc('reasignar_leads_sin_setter', {
      p_setter_id: setter_id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ updated: updated ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
