-- ROLLBACK de 0081: borra solo la fila que creó.
BEGIN;
DELETE FROM public.frecuencia_knowledge_blocks WHERE clave = 'palabras_escasez';
COMMIT;
