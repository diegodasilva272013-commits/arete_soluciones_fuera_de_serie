-- =====================================================================
-- 0080 · Frecuencia — guardarropa mínimo (Espejo 7.1) y dieta de
--        entradas (7.4).
--
-- PARA CORRER POR DIEGO en el SQL Editor de Supabase, en este orden:
--   1) 0080_..._CHECK.sql         (chequeo previo: todo tiene que dar 0)
--   2) este archivo
--   3) 0080_..._VERIFY.sql        (verificación: números esperados abajo)
-- Rollback: 0080_..._ROLLBACK.sql
--
-- Solo toca objetos frecuencia_. Orden: tablas → funciones → RLS →
-- triggers e índices. Sin IF NOT EXISTS. Todo calificado con public.
-- No hay funciones nuevas: se reusa public.frecuencia_habilitado() (0078)
-- y public.frecuencia_set_updated_at().
-- Lo íntimo (guardarropa, entradas) es SOLO del dueño: sin excepción de
-- admin ni de líder; las políticas no consultan otras tablas con RLS
-- (cero riesgo de recursión 42P17).
-- =====================================================================

BEGIN;

-- a) TABLAS ----------------------------------------------------------

CREATE TABLE public.frecuencia_guardarropa (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre             text NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 80),
  foto_storage_path  text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- Una fila por día: horas de pantalla y de noticias/redes (contar, no prohibir).
CREATE TABLE public.frecuencia_entradas (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha                   date NOT NULL,
  horas_pantalla          numeric(3,1) CHECK (horas_pantalla BETWEEN 0 AND 24),
  horas_noticias_redes    numeric(3,1) CHECK (horas_noticias_redes BETWEEN 0 AND 24),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, fecha)
);

-- Horario elegido para noticias y redes (parte de frecuencia_preferencias).
ALTER TABLE public.frecuencia_preferencias
  ADD COLUMN horario_entradas_inicio time,
  ADD COLUMN horario_entradas_fin    time;

-- c) RLS -------------------------------------------------------------

ALTER TABLE public.frecuencia_guardarropa ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_guardarropa FROM anon;
CREATE POLICY frecuencia_guardarropa_select ON public.frecuencia_guardarropa FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_guardarropa_insert ON public.frecuencia_guardarropa FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_guardarropa_update ON public.frecuencia_guardarropa FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_guardarropa_delete ON public.frecuencia_guardarropa FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_entradas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_entradas FROM anon;
CREATE POLICY frecuencia_entradas_select ON public.frecuencia_entradas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_entradas_insert ON public.frecuencia_entradas FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_entradas_update ON public.frecuencia_entradas FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_entradas_delete ON public.frecuencia_entradas FOR DELETE USING (user_id = auth.uid());

-- d) TRIGGERS E ÍNDICES ----------------------------------------------

CREATE TRIGGER trg_frecuencia_entradas_updated_at
  BEFORE UPDATE ON public.frecuencia_entradas
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();

CREATE INDEX idx_frecuencia_guardarropa_user ON public.frecuencia_guardarropa(user_id);
CREATE INDEX idx_frecuencia_entradas_user_fecha ON public.frecuencia_entradas(user_id, fecha DESC);

COMMIT;
