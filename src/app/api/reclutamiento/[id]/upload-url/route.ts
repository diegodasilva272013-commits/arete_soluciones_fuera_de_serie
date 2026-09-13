import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const FOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Devuelve una URL firmada para que el browser suba la foto o el
 * video DIRECTO a Supabase Storage, sin pasar por esta función de
 * Vercel — necesario para el video (los request bodies de Vercel
 * Functions están limitados a unos pocos MB, muy por debajo de lo que
 * pesa un video de presentación real). Mismo patrón que ya usa
 * VideoUploader (d2030) para las grabaciones internas.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { kind, size, contentType: bodyContentType } = await req.json().catch(() => ({})) as
    { kind?: string; size?: number; contentType?: string };

  if (kind !== 'foto' && kind !== 'video') {
    return NextResponse.json({ error: 'kind debe ser "foto" o "video"' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient() as any;

  const { data: postulante, error: lookupError } = await admin
    .from('reclutamiento_postulantes')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 });
  if (!postulante) return NextResponse.json({ error: 'Postulación no encontrada (id inválido)' }, { status: 404 });

  if (kind === 'foto') {
    if (typeof size === 'number' && size > MAX_FOTO_BYTES) {
      return NextResponse.json({ error: 'La foto no puede pesar más de 5 MB' }, { status: 400 });
    }
    const ext = FOTO_TYPES[bodyContentType ?? ''];
    if (!ext) return NextResponse.json({ error: 'Formato de foto no soportado (usá JPG, PNG o WEBP)' }, { status: 400 });
    const path = `${id}/foto.${ext}`;

    const { data, error } = await admin.storage.from('reclutamiento-fotos').createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Error creando URL' }, { status: 500 });

    await admin.from('reclutamiento_postulantes').update({ foto_path: path }).eq('id', id);
    // Retorna también bucket y path para que el cliente use uploadToSignedUrl del SDK
    return NextResponse.json({ uploadUrl: data.signedUrl, token: data.token, path, bucket: 'reclutamiento-fotos' });
  }

  // video — se sube directo desde el browser (sin ffmpeg.wasm para compatibilidad mobile)
  const ext = (bodyContentType ?? '').includes('webm') ? 'webm' : 'mp4';
  const path = `${id}/video.${ext}`;
  const { data, error } = await admin.storage.from('reclutamiento-videos').createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Error creando URL' }, { status: 500 });

  await admin.from('reclutamiento_postulantes').update({ video_path: path }).eq('id', id);
  return NextResponse.json({ uploadUrl: data.signedUrl, token: data.token, path, bucket: 'reclutamiento-videos' });
}
