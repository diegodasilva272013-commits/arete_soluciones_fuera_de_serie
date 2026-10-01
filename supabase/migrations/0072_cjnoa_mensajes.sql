-- =====================================================================
-- 0072 · Centro Jurídico NOA — log de mensajes de WhatsApp real
--
-- Cada mensaje entrante del consultante y cada respuesta del agente,
-- uno por fila, para el puente WhatsApp (Meta) ↔ agente ElevenLabs en
-- /api/webhooks/cjnoa-whatsapp. Separado de cjnoa_consultas (que guarda
-- un resumen por conversación, no mensaje por mensaje).
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.cjnoa_mensajes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono    text        NOT NULL,
  rol         text        NOT NULL CHECK (rol IN ('user', 'assistant')),
  texto       text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cjnoa_mensajes_telefono ON public.cjnoa_mensajes (telefono, created_at);

ALTER TABLE public.cjnoa_mensajes ENABLE ROW LEVEL SECURITY;

-- Solo admin (Diego) — mismo criterio que cjnoa_consultas.
DROP POLICY IF EXISTS cjnoa_mensajes_admin ON public.cjnoa_mensajes;
CREATE POLICY cjnoa_mensajes_admin ON public.cjnoa_mensajes FOR ALL
  USING  (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Service role (el webhook de WhatsApp): bypasa RLS automáticamente.
