-- CHEQUEO PREVIO de 0083. Un solo resultado. Esperado: todos en 0 (si "duplicadas_abiertas" no es 0, avisame antes de correr 0083: el índice único fallaría).
select 'indice_ya_existe' as chequeo, count(*)::int as cantidad, 0 as esperado
  from pg_indexes where schemaname = 'public' and indexname = 'frecuencia_delegaciones_abierta_uk'
union all
select 'duplicadas_abiertas', count(*)::int, 0
  from (select tarea_id, a_user_id from public.frecuencia_delegaciones where not volvio group by 1, 2 having count(*) > 1) x;
