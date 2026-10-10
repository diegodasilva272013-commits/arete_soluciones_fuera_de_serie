-- VERIFICACIÓN POSTERIOR de 0082. Un solo resultado.
select 'modelos de chat' as verificacion, jsonb_array_length(valor -> 'chat')::int as cantidad, 2 as esperado
  from public.frecuencia_knowledge_blocks where clave = 'modelos_ia'
union all
select 'modelos de imágenes', jsonb_array_length(valor -> 'imagenes')::int, 2
  from public.frecuencia_knowledge_blocks where clave = 'modelos_ia'
union all
select 'prompts cargados', count(*)::int, 2
  from public.frecuencia_knowledge_blocks where clave in ('prompt_chat', 'prompt_descomposicion') and length(valor ->> 'texto') > 200
union all
select 'ningún modelo con licencia no comercial', count(*)::int, 0
  from public.frecuencia_knowledge_blocks, jsonb_array_elements((valor -> 'chat') || (valor -> 'imagenes')) m
  where clave = 'modelos_ia' and (m ->> 'licencia') ilike '%non-commercial%';
