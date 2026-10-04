/**
 * GET /api/webhooks/cjnoa-consultas-list
 *
 * Puente de lectura para el ERP de Centro Jurídico NOA (repo aparte,
 * cjnoa_erp / cjnoa-erp.vercel.app): les devuelve las consultas de
 * cjnoa_consultas en JSON para que las muestren dentro de su propio
 * sistema, sin exponerles el service role key de este proyecto.
 *
 * Protegido con un secret dedicado — distinto del CJNOA_TOOL_SECRET que
 * usa la Tool de ElevenLabs para escribir, porque este es de lectura y
 * lo llama un sistema externo, no el agente.
 *
 * Configurar en el ERP (Vercel → cjnoa-erp → env vars):
 *   CJNOA_ERP_READ_SECRET — mismo valor que acá
 *
 * Header esperado: Authorization: Bearer <CJNOA_ERP_READ_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest): boolean {
  const raw = req.headers.get('authorization') ?? '';
  const bearer = raw.startsWith('Bearer ') ? raw.slice(7) : null;
  return bearer === process.env.CJNOA_ERP_READ_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const { data, error } = await supabase
    .from('cjnoa_consultas')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
