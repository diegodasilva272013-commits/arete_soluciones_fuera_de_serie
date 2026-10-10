-- ROLLBACK de 0082: deja modelos_ia como estaba (vacío) y borra los dos prompts.
BEGIN;
UPDATE public.frecuencia_knowledge_blocks SET valor = '{"chat": [], "imagenes": []}'::jsonb, updated_at = now() WHERE clave = 'modelos_ia';
DELETE FROM public.frecuencia_knowledge_blocks WHERE clave IN ('prompt_chat', 'prompt_descomposicion');
COMMIT;
