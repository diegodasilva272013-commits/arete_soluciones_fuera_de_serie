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
-- FIX: nada de tablas ni vistas nuevas — se extienden las dos funciones
-- que YA EXISTÍAN (leads_sin_asignar y leads_sin_asignar_count, de la
-- migración 0056) para que soporten paginación (p_offset) y filtro por
-- estado (p_status) directo en SQL. La API pagina llamando a la función
-- con el limit/offset de cada página — nunca arma una lista de ids para
-- mandar por URL.
-- =====================================================================

DROP FUNCTION IF EXISTS public.leads_sin_asignar_count();
CREATE FUNCTION public.leads_sin_asignar_count(p_status text DEFAULT NULL)
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.leads l
  WHERE l.assigned_to_user_id IS NULL
    AND (p_status IS NULL OR l.current_status = p_status)
    AND NOT EXISTS (
      SELECT 1 FROM public.team_leads tl WHERE tl.source_lead_id = l.id
    );
$$;

GRANT EXECUTE ON FUNCTION public.leads_sin_asignar_count(text) TO authenticated;

DROP FUNCTION IF EXISTS public.leads_sin_asignar(int);
CREATE FUNCTION public.leads_sin_asignar(
  p_limit  int DEFAULT 20,
  p_offset int DEFAULT 0,
  p_status text DEFAULT NULL
)
RETURNS TABLE (
  id               uuid,
  first_name       text,
  last_name        text,
  phone            text,
  email            text,
  country          text,
  source           text,
  current_status   text,
  batch_id         text,
  follow_up_count  integer,
  assigned_at      timestamptz,
  is_closed        boolean,
  created_at       timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, l.first_name, l.last_name, l.phone, l.email, l.country, l.source,
         l.current_status, l.batch_id, l.follow_up_count, l.assigned_at, l.is_closed, l.created_at
  FROM public.leads l
  WHERE l.assigned_to_user_id IS NULL
    AND (p_status IS NULL OR l.current_status = p_status)
    AND NOT EXISTS (
      SELECT 1 FROM public.team_leads tl WHERE tl.source_lead_id = l.id
    )
  ORDER BY l.created_at DESC
  LIMIT CASE WHEN p_limit > 0 THEN p_limit ELSE NULL END
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.leads_sin_asignar(int, int, text) TO authenticated;
