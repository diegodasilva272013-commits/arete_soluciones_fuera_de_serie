-- ROLLBACK de 0083: vuelve a la definición original de 0078.
BEGIN;
DROP INDEX IF EXISTS public.frecuencia_delegaciones_abierta_uk;
CREATE OR REPLACE FUNCTION public.frecuencia_me_delegaron(p_tarea uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_delegaciones d WHERE d.tarea_id = p_tarea AND d.a_user_id = auth.uid()
  );
$$;
CREATE OR REPLACE FUNCTION public.frecuencia_criterio_delegado(p_criterio uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_delegaciones d WHERE d.criterio_id = p_criterio AND d.a_user_id = auth.uid()
  );
$$;
DROP POLICY IF EXISTS frecuencia_delegaciones_update ON public.frecuencia_delegaciones;
CREATE POLICY frecuencia_delegaciones_update ON public.frecuencia_delegaciones
  FOR UPDATE USING (de_user_id = auth.uid())
  WITH CHECK (de_user_id = auth.uid() AND public.frecuencia_habilitado());
COMMIT;
