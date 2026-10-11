-- ROLLBACK de 0084: vuelve a la definición original de 0078.
BEGIN;
DROP INDEX IF EXISTS public.frecuencia_compromisos_mes_uk;
ALTER TABLE public.frecuencia_compromisos DROP CONSTRAINT IF EXISTS frecuencia_compromisos_avance_rango;
CREATE OR REPLACE FUNCTION public.frecuencia_actualizar_avance_compromiso(p_compromiso_id uuid, p_avance int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.frecuencia_compromisos
  SET avance = p_avance, updated_at = now()
  WHERE id = p_compromiso_id
    AND (user_id = auth.uid() OR co_conductor_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No autorizado o compromiso inexistente';
  END IF;
END;
$$;
DROP POLICY IF EXISTS frecuencia_compromisos_select ON public.frecuencia_compromisos;
CREATE POLICY frecuencia_compromisos_select ON public.frecuencia_compromisos
  FOR SELECT USING (
    user_id = auth.uid()
    OR co_conductor_id = auth.uid()
    OR public.frecuencia_es_lider_de(user_id)
  );
COMMIT;
