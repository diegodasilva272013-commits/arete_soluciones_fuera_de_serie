-- ROLLBACK de 0079_frecuencia_bloques_tiempo_real.sql

BEGIN;

DROP INDEX IF EXISTS public.idx_frecuencia_bloques_un_solo_en_el_aire;
ALTER TABLE public.frecuencia_bloques DROP CONSTRAINT IF EXISTS frecuencia_bloques_fin_real_valido;
ALTER TABLE public.frecuencia_bloques
  DROP COLUMN IF EXISTS fin_real,
  DROP COLUMN IF EXISTS inicio_real;

COMMIT;
