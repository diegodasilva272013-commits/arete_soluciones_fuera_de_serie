/**
 * GET /api/fuera-de-serie/manual-01/descargar
 *
 * Sirve el PDF del Manual 01 forzando la descarga (Content-Disposition:
 * attachment) y suma uno al contador antes de responder, para poder
 * mostrar "descargado N veces" en /fuera-de-serie/manual-01.
 */

import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const SLUG = 'manual-01';
const FILE_NAME = 'Arete_Fuera_de_Serie_Manual_01_Fundamentos_de_la_Conversacion_Comercial.pdf';

export async function GET() {
  const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  await supabase.rpc('increment_academia_descarga', { p_slug: SLUG }).then(
    () => {},
    (err) => console.error('[manual-01-descargar] no se pudo incrementar el contador', err)
  );

  const filePath = path.join(process.cwd(), 'public', FILE_NAME);
  const file = await readFile(filePath);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${FILE_NAME}"`,
      'Cache-Control': 'no-store',
    },
  });
}
