-- =====================================================================
-- 0068 · Storage bucket para grabaciones de audio del agente IA
-- =====================================================================

-- Bucket privado para audios de conversaciones ElevenLabs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'grabaciones-ia',
  'grabaciones-ia',
  false,
  104857600,   -- 100 MB por archivo
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Solo service role puede leer/escribir
CREATE POLICY IF NOT EXISTS "ia_audio_service_role_only" ON storage.objects
  FOR ALL USING (bucket_id = 'grabaciones-ia' AND auth.role() = 'service_role');

-- Columna audio_url en contactos_ia
ALTER TABLE public.contactos_ia
  ADD COLUMN IF NOT EXISTS audio_url text;   -- URL firmada del audio en Supabase Storage
