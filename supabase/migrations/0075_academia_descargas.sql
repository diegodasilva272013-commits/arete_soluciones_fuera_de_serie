-- =====================================================================
-- 0075 · Contador de descargas — Academia Areté Fuera de Serie
--
-- Cuenta cuántas veces se descargó cada recurso público de la Academia
-- (por ahora solo el Manual 01) desde /academia-fuera-de-serie. Tabla
-- aparte de leads/contactos_ia: es tráfico público anónimo, no un lead.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.academia_descargas (
  slug        text PRIMARY KEY,
  count       integer NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.academia_descargas ENABLE ROW LEVEL SECURITY;

-- Nadie accede directo por RLS: se lee/escribe siempre con el service
-- role (API route de descarga + render server-side de la página).
DROP POLICY IF EXISTS academia_descargas_admin ON public.academia_descargas;
CREATE POLICY academia_descargas_admin ON public.academia_descargas FOR ALL
  USING  (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.increment_academia_descarga(p_slug text)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  nuevo_count integer;
BEGIN
  INSERT INTO public.academia_descargas (slug, count, updated_at)
  VALUES (p_slug, 1, now())
  ON CONFLICT (slug) DO UPDATE
    SET count = public.academia_descargas.count + 1,
        updated_at = now()
  RETURNING count INTO nuevo_count;
  RETURN nuevo_count;
END;
$$;
