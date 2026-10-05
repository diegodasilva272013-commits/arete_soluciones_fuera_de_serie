/**
 * TEMPORAL — crea el bucket 'frecuencia-imagenes' vía Storage API.
 * No puedo correr scripts/frecuencia-bucket.mjs localmente: la
 * SUPABASE_SERVICE_ROLE_KEY de .env.local está vacía (Vercel la marca
 * "Sensitive" y nunca se puede traer con vercel env pull). Este
 * endpoint hace lo mismo que el script pero corriendo en Vercel, donde
 * sí hay acceso a la key real en runtime. Solo GET, gated por
 * FRECUENCIA_C8_SECRET. Borrar una vez verificado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function GET(req: NextRequest) {
  if (req.headers.get('x-c8-secret') !== process.env.FRECUENCIA_C8_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const admin = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  const BUCKET = 'frecuencia-imagenes';

  const { data: creado, error: errorCrear } = await admin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });

  const { data: info, error: errorInfo } = await admin.storage.getBucket(BUCKET);

  return NextResponse.json({
    createBucket: { data: creado, error: errorCrear },
    getBucket: { data: info, error: errorInfo },
  });
}
