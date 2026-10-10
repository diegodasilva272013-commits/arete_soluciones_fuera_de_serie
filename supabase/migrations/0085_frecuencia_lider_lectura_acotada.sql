-- 0085 — Lectura del líder más acotada (revisión independiente del PR 6.5).
--  1) El líder lee de su equipo solo la evidencia de TRABAJO (ENTRENAMIENTO_CUMPLIDO y MANUAL); las reflexiones
--     (PASOS_ANTE_FALLA, APRENDIZAJE, etc.) quedan solo para su dueño, también a nivel de base de datos.
--  2) frecuencia_comparten_equipo(a, b) deja de ser un "oráculo" que cualquier persona logueada usaba para saber si
--     dos personas cualesquiera comparten equipo: ahora una de las dos tiene que ser quien pregunta.
-- Cambia una política y una función existentes; no toca datos.
BEGIN;

DROP POLICY IF EXISTS frecuencia_evidencia_select ON public.frecuencia_evidencia;
CREATE POLICY frecuencia_evidencia_select ON public.frecuencia_evidencia
  FOR SELECT USING (
    user_id = auth.uid()
    OR (public.frecuencia_es_lider_de(user_id) AND tipo IN ('ENTRENAMIENTO_CUMPLIDO', 'MANUAL'))
  );

CREATE OR REPLACE FUNCTION public.frecuencia_comparten_equipo(p_a uuid, p_b uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT (p_a = auth.uid() OR p_b = auth.uid()) AND EXISTS (
    SELECT 1
    FROM public.frecuencia_equipo_miembros m1
    JOIN public.frecuencia_equipo_miembros m2 ON m1.equipo_id = m2.equipo_id
    WHERE m1.user_id = p_a AND m2.user_id = p_b
  );
$$;

COMMIT;
