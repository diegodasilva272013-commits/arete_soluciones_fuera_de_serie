/** Variables de contexto para el agente de VOZ (dial de hoy, bloque, tareas postergadas, objetivo). Solo de la persona logueada. */
import { NextResponse } from 'next/server';
import { getCurrentUserContext } from '@/lib/current-user';
import { tieneAccesoFrecuencia } from '@/lib/frecuencia-access';
import { variablesAgenteVoz } from '@/app/(frecuencia)/frecuencia/_ia/contexto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getCurrentUserContext();
  if (!ctx || !(await tieneAccesoFrecuencia(ctx.role))) return NextResponse.json({ error: 'sin_acceso' }, { status: 403 });
  return NextResponse.json({ variables: await variablesAgenteVoz(ctx.userId) });
}
