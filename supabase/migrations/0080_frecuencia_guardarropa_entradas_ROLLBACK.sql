-- ROLLBACK de 0080_frecuencia_guardarropa_entradas.sql
-- Borra solo lo que creó 0080 (nada más). Las fotos del guardarropa, si
-- las hubiera, viven en el bucket frecuencia-imagenes bajo
-- <user_id>/guardarropa/: se borran aparte con la Storage API.
BEGIN;

ALTER TABLE public.frecuencia_preferencias
  DROP COLUMN horario_entradas_inicio,
  DROP COLUMN horario_entradas_fin;

DROP TABLE public.frecuencia_entradas;
DROP TABLE public.frecuencia_guardarropa;

COMMIT;
