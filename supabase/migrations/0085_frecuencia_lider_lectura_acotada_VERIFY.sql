-- VERIFICACIÓN POSTERIOR de 0085. Un solo resultado.
select 'evidencia del líder acotada por tipo' as verificacion, count(*)::int as cantidad, 1 as esperado
  from pg_policies where schemaname = 'public' and tablename = 'frecuencia_evidencia' and policyname = 'frecuencia_evidencia_select'
    and qual ilike '%ENTRENAMIENTO_CUMPLIDO%'
union all
select 'comparten_equipo exige a quien pregunta', count(*)::int, 1
  from pg_proc where proname = 'frecuencia_comparten_equipo' and pronamespace = 'public'::regnamespace and prosrc ilike '%auth.uid()%';
