-- VERIFICACIÓN POSTERIOR de 0083. Un solo resultado.
select 'indice único creado' as verificacion, count(*)::int as cantidad, 1 as esperado
  from pg_indexes where schemaname = 'public' and indexname = 'frecuencia_delegaciones_abierta_uk'
union all
select 'me_delegaron exige equipo en común', count(*)::int, 1
  from pg_proc where proname = 'frecuencia_me_delegaron' and pronamespace = 'public'::regnamespace and prosrc ilike '%frecuencia_comparten_equipo%'
union all
select 'criterio_delegado exige equipo en común', count(*)::int, 1
  from pg_proc where proname = 'frecuencia_criterio_delegado' and pronamespace = 'public'::regnamespace and prosrc ilike '%frecuencia_comparten_equipo%'
union all
select 'política update exige equipo en común', count(*)::int, 1
  from pg_policies where schemaname = 'public' and tablename = 'frecuencia_delegaciones' and policyname = 'frecuencia_delegaciones_update' and with_check ilike '%frecuencia_comparten_equipo%';
