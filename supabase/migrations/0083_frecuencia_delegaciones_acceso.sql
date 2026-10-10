-- 0083 — Delegaciones: cerrar tres huecos que encontró la revisión independiente del PR 6.3.
--  1) Quien recibió una delegación solo lee la tarea y el criterio mientras SIGUE compartiendo equipo con quien delegó.
--  2) Quien delega no puede reasignar la delegación a alguien con quien no comparte equipo (UPDATE).
--  3) Una misma tarea no puede estar delegada dos veces a la misma persona mientras siga en sus manos.
-- Cambia funciones y una política existentes (CREATE OR REPLACE / DROP+CREATE POLICY); no toca datos.
BEGIN;

CREATE OR REPLACE FUNCTION public.frecuencia_me_delegaron(p_tarea uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_delegaciones d
    WHERE d.tarea_id = p_tarea AND d.a_user_id = auth.uid()
      AND public.frecuencia_comparten_equipo(d.de_user_id, d.a_user_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.frecuencia_criterio_delegado(p_criterio uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_delegaciones d
    WHERE d.criterio_id = p_criterio AND d.a_user_id = auth.uid()
      AND public.frecuencia_comparten_equipo(d.de_user_id, d.a_user_id)
  );
$$;

DROP POLICY IF EXISTS frecuencia_delegaciones_update ON public.frecuencia_delegaciones;
CREATE POLICY frecuencia_delegaciones_update ON public.frecuencia_delegaciones
  FOR UPDATE USING (de_user_id = auth.uid())
  WITH CHECK (
    de_user_id = auth.uid()
    AND public.frecuencia_comparten_equipo(de_user_id, a_user_id)
    AND public.frecuencia_habilitado()
  );

CREATE UNIQUE INDEX IF NOT EXISTS frecuencia_delegaciones_abierta_uk
  ON public.frecuencia_delegaciones (tarea_id, a_user_id) WHERE NOT volvio;

COMMIT;
