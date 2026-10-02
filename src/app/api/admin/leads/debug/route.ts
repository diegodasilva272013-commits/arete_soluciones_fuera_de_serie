import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: leads } = await admin
    .from('leads')
    .select('id, assigned_to_user_id, current_status')
    .limit(50000);

  const all = leads ?? [];
  const total = all.length;

  // Leads que están en el pool de alguna dupla (team_leads) — estos
  // cuentan como "no sin asignar" para leads_sin_asignar() aunque
  // assigned_to_user_id siga en NULL, porque ya fueron repartidos a un
  // equipo y están esperando que alguien de esa dupla los tome.
  const poolIds = new Set<string>();
  {
    let from = 0;
    const CHUNK = 1000;
    for (;;) {
      const { data: chunk } = await (admin as any)
        .from('team_leads')
        .select('source_lead_id')
        .range(from, from + CHUNK - 1);
      if (!chunk?.length) break;
      for (const r of chunk as any[]) if (r.source_lead_id) poolIds.add(r.source_lead_id);
      if (chunk.length < CHUNK) break;
      from += CHUNK;
    }
  }

  // Count per assigned_to_user_id
  const byId = new Map<string, number>();
  let unassigned = 0;
  let unassignedInPool = 0;
  let unassignedTrulyFree = 0;
  for (const l of all) {
    if (!l.assigned_to_user_id) {
      unassigned++;
      if (poolIds.has(l.id)) unassignedInPool++; else unassignedTrulyFree++;
      continue;
    }
    byId.set(l.assigned_to_user_id, (byId.get(l.assigned_to_user_id) ?? 0) + 1);
  }

  // Probar directamente las dos funciones SQL que usa el resto de la app
  // para "sin asignar", para ver si alguna está rota o desincronizada
  // contra el cálculo hecho acá mismo en JS (NOT EXISTS equivalente).
  const rpcCount = await (admin as any).rpc('leads_sin_asignar_count');
  const rpcList0 = await (admin as any).rpc('leads_sin_asignar', { p_limit: 0 });
  const rpcList20 = await (admin as any).rpc('leads_sin_asignar', { p_limit: 20 });

  const ids = [...byId.keys()];
  const profileMap = new Map<string, { full_name: string | null; email: string | null }>();
  for (let i = 0; i < ids.length; i += 500) {
    const chunk = ids.slice(i, i + 500);
    const { data: profiles } = await admin.from('profiles').select('id, full_name, email').in('id', chunk);
    for (const p of profiles ?? []) profileMap.set(p.id, p);
  }

  const rows = ids
    .map((id) => ({
      id,
      full_name: profileMap.get(id)?.full_name ?? null,
      email: profileMap.get(id)?.email ?? null,
      has_profile: profileMap.has(id),
      lead_count: byId.get(id)!,
    }))
    .sort((a, b) => b.lead_count - a.lead_count);

  return NextResponse.json({
    total,
    unassigned,
    assigned: total - unassigned,
    unassigned_pero_en_pool_de_dupla: unassignedInPool,
    unassigned_realmente_libres: unassignedTrulyFree,
    rpc_leads_sin_asignar_count: { data: rpcCount.data, error: rpcCount.error?.message ?? null },
    rpc_leads_sin_asignar_p_limit_0: {
      count: rpcList0.data?.length ?? null,
      error: rpcList0.error?.message ?? null,
      sample_ids: (rpcList0.data ?? []).slice(0, 3).map((r: any) => r.id),
    },
    rpc_leads_sin_asignar_p_limit_20: {
      count: rpcList20.data?.length ?? null,
      error: rpcList20.error?.message ?? null,
    },
    rows,
  });
}
