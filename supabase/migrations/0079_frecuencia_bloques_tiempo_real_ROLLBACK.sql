-- ROLLBACK de 0079_frecuencia_bloques_tiempo_real.sql

BEGIN;

ALTER TABLE public.frecuencia_bloques
  DROP COLUMN IF EXISTS inicio_real,
  DROP COLUMN IF EXISTS fin_real;

COMMIT;
