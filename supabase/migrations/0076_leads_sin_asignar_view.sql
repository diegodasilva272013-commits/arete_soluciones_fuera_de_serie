-- =====================================================================
-- 0076 · Fix: "Ver sin asignar" se rompía con muchos leads
--
-- BUG: /api/admin/leads traía TODOS los ids de leads_sin_asignar(0) a
-- JS y después hacía .in('id', [...miles de uuids...]) contra
-- PostgREST. Eso arma una URL con un id por cada uuid (36 chars c/u) —
-- con 6000+ leads sin asignar la URL supera cualquier límite razonable
-- (Vercel/PostgREST la cortan o la rechazan), así que la query vuelve
-- vacía mientras el "count" de otra parte del código sigue mostrando
-- el total sin filtrar. Con pocos leads sin asignar nunca se notaba —
-- por eso "antes andaba" y ahora no, a medida que creció la base.
--
-- FIX: una vista hace el filtro NOT EXISTS del lado de Postgres. La API
-- consulta la vista directo (con paginación normal), nunca arma una
-- lista de ids para mandar por URL.
-- =====================================================================

CREATE OR REPLACE VIEW public.leads_sin_asignar_view AS
SELECT l.*
FROM public.leads l
WHERE l.assigned_to_user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.team_leads tl WHERE tl.source_lead_id = l.id
  );

-- Mismo problema en /api/admin/leads/reasignar-sin-setter: traía todos
-- los ids a JS para después hacer .update(...).in('id', [...]). Ahora
-- el UPDATE completo corre del lado de Postgres, sin pasar ids por URL.
CREATE OR REPLACE FUNCTION public.reasignar_leads_sin_setter(p_setter_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.leads l
  SET assigned_to_user_id = p_setter_id,
      assigned_at = now()
  WHERE l.assigned_to_user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.team_leads tl WHERE tl.source_lead_id = l.id
    );
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reasignar_leads_sin_setter(uuid) TO authenticated;
