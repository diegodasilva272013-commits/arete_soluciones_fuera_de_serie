import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * POST — el cliente llama este endpoint luego de que TUS confirma que
 * el video se subió al 100%. Setea video_completado = true en la BD.
 * Sin auth: usa service role, valida solo que el ID exista.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const admin = createSupabaseAdminClient() as any;

  const { error } = await admin
    .from('reclutamiento_postulantes')
    .update({ video_completado: true })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
