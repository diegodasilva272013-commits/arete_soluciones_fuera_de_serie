-- 0060 · Etiquetas libres en leads
-- Agrega tags text[] a la tabla existente. Sin tabla nueva.
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
