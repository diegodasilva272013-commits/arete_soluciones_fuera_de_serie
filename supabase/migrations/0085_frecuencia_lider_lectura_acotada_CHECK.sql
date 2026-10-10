-- CHEQUEO PREVIO de 0085. Un solo resultado. Esperado: policy_existe = 1, funcion_existe = 1.
select 'policy_existe' as chequeo, count(*)::int as cantidad, 1 as esperado
  from pg_policies where schemaname = 'public' and tablename = 'frecuencia_evidencia' and policyname = 'frecuencia_evidencia_select'
union all
select 'funcion_existe', count(*)::int, 1
  from pg_proc where proname = 'frecuencia_comparten_equipo' and pronamespace = 'public'::regnamespace;
