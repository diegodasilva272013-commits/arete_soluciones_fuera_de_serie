-- VERIFICACIÓN POSTERIOR de 0084. Un solo resultado.
select 'indice único creado' as verificacion, count(*)::int as cantidad, 1 as esperado
  from pg_indexes where schemaname = 'public' and indexname = 'frecuencia_compromisos_mes_uk'
union all
select 'restricción de avance creada', count(*)::int, 1
  from pg_constraint where conname = 'frecuencia_compromisos_avance_rango'
union all
select 'función exige rango y equipo', count(*)::int, 1
  from pg_proc where proname = 'frecuencia_actualizar_avance_compromiso' and pronamespace = 'public'::regnamespace
    and prosrc ilike '%frecuencia_comparten_equipo%' and prosrc ilike '%fuera de rango%'
union all
select 'política de lectura exige equipo para el co-conductor', count(*)::int, 1
  from pg_policies where schemaname = 'public' and tablename = 'frecuencia_compromisos' and policyname = 'frecuencia_compromisos_select'
    and qual ilike '%frecuencia_comparten_equipo%';
