-- CHEQUEO PREVIO de 0082. Un solo resultado. Esperado: modelos_ia_vacio = 1, prompts_existentes = 0.
select 'modelos_ia_vacio' as chequeo,
       count(*)::int as cantidad
  from public.frecuencia_knowledge_blocks
  where clave = 'modelos_ia' and jsonb_array_length(valor -> 'chat') = 0 and jsonb_array_length(valor -> 'imagenes') = 0
union all
select 'prompts_existentes', count(*)::int
  from public.frecuencia_knowledge_blocks where clave in ('prompt_chat', 'prompt_descomposicion');
