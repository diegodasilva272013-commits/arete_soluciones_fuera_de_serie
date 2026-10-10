-- CHEQUEO PREVIO de 0084. Un solo resultado. Esperado: todos en 0.
select 'indice_ya_existe' as chequeo, count(*)::int as cantidad, 0 as esperado
  from pg_indexes where schemaname = 'public' and indexname = 'frecuencia_compromisos_mes_uk'
union all
select 'restriccion_ya_existe', count(*)::int, 0
  from pg_constraint where conname = 'frecuencia_compromisos_avance_rango'
union all
select 'duplicados_por_persona_y_mes', count(*)::int, 0
  from (select user_id, mes from public.frecuencia_compromisos group by 1, 2 having count(*) > 1) x
union all
select 'avance_fuera_de_rango', count(*)::int, 0
  from public.frecuencia_compromisos where avance < 0 or avance > 100;
