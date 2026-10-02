-- =====================================================================
-- 0074 · Centro Jurídico NOA — trigger de updated_at
--
-- Los webhooks de CJ NOA actualizan la fila con .update(...) pero nunca
-- seteaban `updated_at` a mano, y la columna no se actualiza sola en un
-- UPDATE (el DEFAULT now() solo corre en el INSERT). Resultado: el primer
-- mensaje de una conversación se veía en tiempo real (fila nueva), pero
-- los siguientes mensajes de esa misma conversación no cambiaban
-- `updated_at`, así que el polling del panel no detectaba nada nuevo
-- hasta refrescar la página a mano.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.set_cjnoa_consultas_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_cjnoa_consultas_updated ON public.cjnoa_consultas;
CREATE TRIGGER trg_cjnoa_consultas_updated
  BEFORE UPDATE ON public.cjnoa_consultas
  FOR EACH ROW EXECUTE PROCEDURE public.set_cjnoa_consultas_updated_at();
