import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Crea una sesión TUS en Supabase Storage usando el service role key
 * (server-side). El cliente recibe la URL de sesión y usa tus-js-client
 * para subir chunks directamente a Supabase — sin pasar por Vercel.
 *
 * Supabase TUS session URL: contiene un JWT de sesión en el path.
 * Los PATCHes posteriores usan esa URL (con el JWT embebido) y no
 * necesitan el Authorization header separado.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const body = await req.json().catch(() => ({})) as {
    kind?: string;
    size?: number;
    contentType?: string;
  };
  const { kind, size, contentType } = body;

  if (kind !== 'foto' && kind !== 'video') {
    return NextResponse.json({ error: 'kind debe ser foto o video' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient() as any;

  const { data: postulante, error: lookupError } = await admin
    .from('reclutamiento_postulantes')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (!postulante) return NextResponse.json({ error: 'Postulación no encontrada' }, { status: 404 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const bucket  = kind === 'foto' ? 'reclutamiento-fotos' : 'reclutamiento-videos';
  const ext     = kind === 'foto'
    ? (contentType?.includes('png') ? 'png' : contentType?.includes('webp') ? 'webp' : 'jpg')
    : (contentType?.includes('webm') ? 'webm' : 'mp4');
  const objPath = `${id}/${kind}.${ext}`;

  // Guardar el path en la postulación
  const pathField = kind === 'foto' ? 'foto_path' : 'video_path';
  await admin.from('reclutamiento_postulantes').update({ [pathField]: objPath }).eq('id', id);

  // Metadata TUS codificada en base64
  const b64 = (s: string) => Buffer.from(s).toString('base64');
  const metadata = [
    `bucketName ${b64(bucket)}`,
    `objectName ${b64(objPath)}`,
    `contentType ${b64(contentType ?? 'application/octet-stream')}`,
    `cacheControl ${b64('3600')}`,
  ].join(',');

  // POST al endpoint TUS de Supabase con service role key (server-side)
  const tusRes = await fetch(`${supabaseUrl}/storage/v1/upload/resumable`, {
    method: 'POST',
    headers: {
      'Authorization':   `Bearer ${serviceKey}`,
      'Content-Length':  '0',
      'Upload-Length':   String(size ?? 0),
      'Tus-Resumable':   '1.0.0',
      'Upload-Metadata': metadata,
    },
  });

  if (!tusRes.ok) {
    const txt = await tusRes.text().catch(() => '');
    return NextResponse.json(
      { error: `Error creando sesión TUS (${tusRes.status}): ${txt}` },
      { status: 500 },
    );
  }

  const sessionUrl = tusRes.headers.get('Location');
  if (!sessionUrl) {
    return NextResponse.json({ error: 'Supabase TUS no devolvió Location' }, { status: 500 });
  }

  return NextResponse.json({ sessionUrl, bucket, path: objPath });
}
