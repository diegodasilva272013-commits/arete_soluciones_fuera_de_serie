import { NextRequest, NextResponse } from 'next/server';
import { enviarZoomPendientes } from '@/lib/fds-temporada-zoom';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/temporada-1-zoom  (cron diario de Vercel, ver vercel.json)
 * Manda el link de Zoom desde arete@aretesoluciones.space a todos los
 * inscriptos de la Temporada 1 que todavía no lo recibieron.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY no está configurada' }, { status: 500 });
  }
  try {
    const r = await enviarZoomPendientes();
    return NextResponse.json(r);
  } catch (e) {
    console.error('[cron/temporada-1-zoom]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
