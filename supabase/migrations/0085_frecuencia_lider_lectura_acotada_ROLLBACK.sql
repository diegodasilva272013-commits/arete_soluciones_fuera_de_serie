-- ROLLBACK de 0085: vuelve a la definición original de 0078.
BEGIN;
DROP POLICY IF EXISTS frecuencia_evidencia_select ON public.frecuencia_evidencia;
CREATE POLICY frecuencia_evidencia_select ON public.frecuencia_evidencia
  FOR SELECT USING (user_id = auth.uid() OR public.frecuencia_es_lider_de(user_id));
CREATE OR REPLACE FUNCTION public.frecuencia_comparten_equipo(p_a uuid, p_b uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.frecuencia_equipo_miembros m1
    JOIN public.frecuencia_equipo_miembros m2 ON m1.equipo_id = m2.equipo_id
    WHERE m1.user_id = p_a AND m2.user_id = p_b
  );
$$;
COMMIT;
