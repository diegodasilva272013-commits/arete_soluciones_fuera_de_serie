-- ============================================================
-- 0064 — Vincula prospectos LinkedIn al pipeline de leads
-- Agrega prospect_id (nullable) a leads para que cada análisis
-- de LinkedIn genere automáticamente un lead en el pipeline.
-- ============================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS prospect_id UUID
    REFERENCES public.prospects(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leads_prospect_id_idx
  ON public.leads(prospect_id);

-- Permite que phone sea vacío para leads de LinkedIn
-- (el setter puede completarlo luego desde el detalle del lead)
ALTER TABLE public.leads
  ALTER COLUMN phone SET DEFAULT '';
