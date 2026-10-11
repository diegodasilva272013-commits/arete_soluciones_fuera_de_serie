-- VERIFICACIÓN POSTERIOR de 0081. Un solo resultado. Esperado: filas = 1, energías = 4, cantidad de entradas = 38.
select 'filas' as verificacion, count(*)::int as cantidad, 1 as esperado
  from public.frecuencia_knowledge_blocks where clave = 'palabras_escasez'
union all
select 'energías', count(*)::int, 4
  from public.frecuencia_knowledge_blocks, jsonb_object_keys(valor) where clave = 'palabras_escasez'
union all
select 'entradas en total', coalesce(sum(jsonb_array_length(valor -> k)), 0)::int, 38
  from public.frecuencia_knowledge_blocks, jsonb_object_keys(valor) as k where clave = 'palabras_escasez';
