-- =====================================================================
-- 0069 · reclutamiento_postulantes — columna video_completado
-- Marca si el video fue subido completamente.
-- Se setea en true solo desde el cliente, despues de que TUS confirma
-- el upload exitoso. Evita que queden registros sin video.
-- =====================================================================

ALTER TABLE public.reclutamiento_postulantes
  ADD COLUMN IF NOT EXISTS video_completado boolean NOT NULL DEFAULT false;

-- Marcar como completados los registros existentes que ya tienen video_path
-- (asumimos que si tienen path, el video llegó)
UPDATE public.reclutamiento_postulantes
  SET video_completado = true
  WHERE video_path IS NOT NULL AND video_path != '';
