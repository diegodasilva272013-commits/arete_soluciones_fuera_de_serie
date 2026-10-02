-- =====================================================================
-- 0072 · cjnoa_consultas — columna mensaje
--
-- La Webhook Tool configurada en ElevenLabs (registrar_consulta) manda
-- un campo "mensaje" (el texto que escribió el cliente) además de los
-- datos ya contemplados — no había una columna para guardarlo.
-- =====================================================================

ALTER TABLE public.cjnoa_consultas ADD COLUMN IF NOT EXISTS mensaje text;
