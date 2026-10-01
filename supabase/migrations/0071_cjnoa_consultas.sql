-- =====================================================================
-- 0071 · Centro Jurídico NOA — consultas recibidas por el agente de voz/texto
--
-- Tabla independiente de leads/contactos_ia: CJ NOA es un cliente externo
-- de Areté (su propio estudio jurídico), no el pipeline de ventas interno
-- de Areté — no corresponde mezclar sus datos con los de leads/contactos_ia.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.cjnoa_consultas (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id           text,
  nombre_consultante        text,
  dni_o_cuil                text,
  telefono                  text,
  rama_consulta             text,
  tipo_tramite_previsional  text,
  requiere_turno            boolean,
  resumen                   text,
  transcripcion             text,
  datos_adicionales         text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cjnoa_conversation_id
  ON public.cjnoa_consultas (conversation_id)
  WHERE conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cjnoa_created ON public.cjnoa_consultas (created_at DESC);

ALTER TABLE public.cjnoa_consultas ENABLE ROW LEVEL SECURITY;

-- Solo admin (Diego) — CJ NOA es un cliente externo, no aplican acá los
-- roles setter/closer del equipo de ventas interno de Areté.
DROP POLICY IF EXISTS cjnoa_admin ON public.cjnoa_consultas;
CREATE POLICY cjnoa_admin ON public.cjnoa_consultas FOR ALL
  USING  (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Service role (webhooks de ElevenLabs): bypasa RLS automáticamente.
