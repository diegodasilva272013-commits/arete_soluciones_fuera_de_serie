-- =====================================================================
-- 0067 · Transcripción completa en contactos_ia
-- =====================================================================

ALTER TABLE public.contactos_ia
  ADD COLUMN IF NOT EXISTS transcripcion text,          -- texto completo de la conversación
  ADD COLUMN IF NOT EXISTS conversation_id text;        -- ID de conversación ElevenLabs (para cruzar)

ALTER TABLE public.reuniones_externas
  ADD COLUMN IF NOT EXISTS contacto_ia_id uuid REFERENCES public.contactos_ia(id) ON DELETE SET NULL;
