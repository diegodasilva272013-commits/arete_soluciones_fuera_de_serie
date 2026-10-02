-- =====================================================================
-- 0073 · Centro Jurídico NOA — historial de mensajes por conversación
--
-- Antes, cada llamada de la Tool "registrar_consulta" pisaba la columna
-- `mensaje` (un solo texto) y, si no llegaba conversation_id, insertaba
-- una fila nueva por cada mensaje en vez de agruparlos en una sola
-- conversación. `mensajes` guarda el historial completo (array
-- cronológico) de lo que fue escribiendo el cliente en esa conversación.
-- =====================================================================

ALTER TABLE public.cjnoa_consultas
  ADD COLUMN IF NOT EXISTS mensajes jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_cjnoa_telefono ON public.cjnoa_consultas (telefono);
